import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "../categories/category.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventsReportQueryDto } from "./dto/events-report.query.dto";
import { ListEventsQueryDto } from "./dto/list-events.query.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventEntity } from "./event.entity";
import { EventStatus } from "./event-status.enum";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

export type EventsReportSummary = {
  period: {
    startDate: string;
    endDate: string;
  };
  total: number;
  byStatus: Array<{ status: EventStatus; total: number }>;
  byCategory: Array<{
    categoryId: number | null;
    categoryName: string;
    total: number;
  }>;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async list(query: ListEventsQueryDto): Promise<PaginatedResult<EventEntity>> {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const q = (query.q ?? "").trim();

    const sortBy = query.sortBy ?? "startDate";
    const sortDirRaw = query.sortDir ?? "ASC";
    const sortDir =
      sortDirRaw.toString().toUpperCase() === "DESC" ? "DESC" : "ASC";

    const qb = this.eventsRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.category", "category");

    if (q.length > 0) {
      qb.andWhere("event.title LIKE :q", { q: `%${q}%` });
    }

    if (query.categoryId) {
      qb.andWhere("event.categoryId = :categoryId", {
        categoryId: query.categoryId,
      });
    }

    qb.orderBy(`event.${sortBy}`, sortDir as "ASC" | "DESC");
    qb.skip((page - 1) * size).take(size);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, size };
  }

  async reportSummary(
    query: EventsReportQueryDto,
  ): Promise<EventsReportSummary> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("startDate and endDate must be valid dates");
    }

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException("endDate must be equal to or after startDate");
    }

    const overlapWhere = [
      "event.startDate <= :periodEnd",
      "event.endDate >= :periodStart",
    ];
    const overlapParams = {
      periodStart: startDate,
      periodEnd: endDate,
    };

    const total = await this.eventsRepository
      .createQueryBuilder("event")
      .where(overlapWhere.join(" AND "), overlapParams)
      .getCount();

    const rawByStatus = await this.eventsRepository
      .createQueryBuilder("event")
      .select("event.status", "status")
      .addSelect("COUNT(*)", "total")
      .where(overlapWhere.join(" AND "), overlapParams)
      .groupBy("event.status")
      .getRawMany<{ status: EventStatus; total: string }>();

    const statusTotals = new Map<EventStatus, number>([
      [EventStatus.Scheduled, 0],
      [EventStatus.Canceled, 0],
    ]);

    rawByStatus.forEach((item) => {
      if (
        item.status === EventStatus.Scheduled ||
        item.status === EventStatus.Canceled
      ) {
        statusTotals.set(item.status, Number(item.total));
      }
    });

    const rawByCategory = await this.eventsRepository
      .createQueryBuilder("event")
      .leftJoin("event.category", "category")
      .select("event.categoryId", "categoryId")
      .addSelect("COALESCE(category.name, 'Sem categoria')", "categoryName")
      .addSelect("COUNT(*)", "total")
      .where(overlapWhere.join(" AND "), overlapParams)
      .groupBy("event.categoryId")
      .addGroupBy("category.name")
      .orderBy("total", "DESC")
      .addOrderBy("categoryName", "ASC")
      .getRawMany<{ categoryId: number | null; categoryName: string; total: string }>();

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      total,
      byStatus: [
        {
          status: EventStatus.Scheduled,
          total: statusTotals.get(EventStatus.Scheduled) ?? 0,
        },
        {
          status: EventStatus.Canceled,
          total: statusTotals.get(EventStatus.Canceled) ?? 0,
        },
      ],
      byCategory: rawByCategory.map((item) => ({
        categoryId:
          item.categoryId === null || item.categoryId === undefined
            ? null
            : Number(item.categoryId),
        categoryName: item.categoryName,
        total: Number(item.total),
      })),
    };
  }

  async findOne(id: number): Promise<EventEntity> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  async create(dto: CreateEventDto): Promise<EventEntity> {
    this.assertDateRange(dto.startDate, dto.endDate);
    await this.assertNoOrganizerScheduleConflict(
      dto.organizerEmail,
      dto.startDate,
      dto.endDate,
    );

    const category = await this.resolveCategory(dto.categoryId);

    const event = this.eventsRepository.create({
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
      location: dto.location,
      organizerEmail: dto.organizerEmail,
      status: dto.status ?? EventStatus.Scheduled,
      categoryId: category?.id ?? null,
      category: category ?? null,
    });

    return this.eventsRepository.save(event);
  }

  async update(id: number, dto: UpdateEventDto): Promise<EventEntity> {
    const existing = await this.findOne(id);

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;
    const organizerEmail = dto.organizerEmail ?? existing.organizerEmail;
    this.assertDateRange(startDate, endDate);
    await this.assertNoOrganizerScheduleConflict(
      organizerEmail,
      startDate,
      endDate,
      id,
    );

    const category =
      dto.categoryId === undefined
        ? undefined
        : await this.resolveCategory(dto.categoryId);

    const merged = this.eventsRepository.merge(existing, {
      ...dto,
      ...(category === undefined
        ? {}
        : { categoryId: category?.id ?? null, category: category ?? null }),
    });

    return this.eventsRepository.save(merged);
  }

  async remove(
    id: number,
  ): Promise<{ deleted: true } & Pick<EventEntity, "id">> {
    const existing = await this.findOne(id);
    await this.eventsRepository.remove(existing);
    return { id, deleted: true };
  }

  private assertDateRange(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new BadRequestException("startDate must be a valid date");
    }
    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("endDate must be a valid date");
    }

    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException(
        "endDate must be strictly greater than startDate",
      );
    }
  }

  private async assertNoOrganizerScheduleConflict(
    organizerEmail: string,
    startDate: Date,
    endDate: Date,
    excludeEventId?: number,
  ) {
    const qb = this.eventsRepository
      .createQueryBuilder("event")
      .where("LOWER(event.organizerEmail) = LOWER(:organizerEmail)", {
        organizerEmail,
      })
      .andWhere("event.startDate < :endDate", { endDate })
      .andWhere("event.endDate > :startDate", { startDate });

    if (excludeEventId) {
      qb.andWhere("event.id != :excludeEventId", { excludeEventId });
    }

    const hasConflict = (await qb.getCount()) > 0;

    if (hasConflict) {
      throw new ConflictException(
        "Horario ja ocupado para este organizador no intervalo informado",
      );
    }
  }

  private async resolveCategory(categoryId?: number | null) {
    if (categoryId === undefined) return undefined;
    if (categoryId === null) return null;

    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException("categoryId is invalid");
    }

    return category;
  }
}
