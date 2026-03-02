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
import { ListEventsQueryDto } from "./dto/list-events.query.dto";
import { ReportEventsQueryDto } from "./dto/report-events.query.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventEntity } from "./event.entity";
import { EventStatus } from "./event-status.enum";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

type EventSummaryByStatus = {
  status: EventStatus;
  total: number;
};

type EventSummaryByCategory = {
  categoryId: number | null;
  categoryName: string;
  total: number;
};

export type EventsSummaryReport = {
  period: {
    startDate: string;
    endDate: string;
  };
  totalEvents: number;
  byStatus: EventSummaryByStatus[];
  byCategory: EventSummaryByCategory[];
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

  async reportSummary(
    query: ReportEventsQueryDto,
  ): Promise<EventsSummaryReport> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    this.assertReportDateRange(startDate, endDate);

    const periodStart = new Date(startDate);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(endDate);
    periodEnd.setHours(23, 59, 59, 999);

    const events = await this.eventsRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.category", "category")
      .where("event.startDate <= :periodEnd", { periodEnd })
      .andWhere("event.endDate >= :periodStart", { periodStart })
      .getMany();

    const byStatusMap = new Map<EventStatus, number>([
      [EventStatus.Scheduled, 0],
      [EventStatus.Canceled, 0],
    ]);

    const byCategoryMap = new Map<string, EventSummaryByCategory>();

    for (const event of events) {
      byStatusMap.set(event.status, (byStatusMap.get(event.status) ?? 0) + 1);

      const categoryId = event.category?.id ?? null;
      const categoryName = event.category?.name ?? "Sem categoria";
      const categoryKey = String(categoryId ?? "null");

      const existing = byCategoryMap.get(categoryKey);
      if (!existing) {
        byCategoryMap.set(categoryKey, {
          categoryId,
          categoryName,
          total: 1,
        });
      } else {
        existing.total += 1;
      }
    }

    const byStatus: EventSummaryByStatus[] = [
      {
        status: EventStatus.Scheduled,
        total: byStatusMap.get(EventStatus.Scheduled) ?? 0,
      },
      {
        status: EventStatus.Canceled,
        total: byStatusMap.get(EventStatus.Canceled) ?? 0,
      },
    ];

    const byCategory = Array.from(byCategoryMap.values()).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName),
    );

    return {
      period: {
        startDate: periodStart.toISOString(),
        endDate: periodEnd.toISOString(),
      },
      totalEvents: events.length,
      byStatus,
      byCategory,
    };
  }

  async create(dto: CreateEventDto): Promise<EventEntity> {
    this.assertDateRange(dto.startDate, dto.endDate);
    await this.assertNoScheduleConflict({
      organizerEmail: dto.organizerEmail,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

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
    await this.assertNoScheduleConflict({
      organizerEmail,
      startDate,
      endDate,
      excludeEventId: id,
    });

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

  private assertReportDateRange(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new BadRequestException("startDate must be a valid date");
    }
    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("endDate must be a valid date");
    }

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException(
        "endDate must be greater than or equal to startDate",
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

  private async assertNoScheduleConflict(params: {
    organizerEmail: string;
    startDate: Date;
    endDate: Date;
    excludeEventId?: number;
  }) {
    const organizerEmail = params.organizerEmail.trim().toLowerCase();

    const qb = this.eventsRepository
      .createQueryBuilder("event")
      .where("LOWER(event.organizerEmail) = :organizerEmail", {
        organizerEmail,
      })
      .andWhere("event.startDate < :endDate", { endDate: params.endDate })
      .andWhere("event.endDate > :startDate", { startDate: params.startDate });

    if (params.excludeEventId) {
      qb.andWhere("event.id != :excludeEventId", {
        excludeEventId: params.excludeEventId,
      });
    }

    const conflict = await qb.getOne();

    if (conflict) {
      throw new ConflictException(
        "Horário já está ocupado para este organizador.",
      );
    }
  }
}
