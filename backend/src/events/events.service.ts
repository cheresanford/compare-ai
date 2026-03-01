import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "../categories/category.entity";
import { CreateEventDto } from "./dto/create-event.dto";
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

  async create(dto: CreateEventDto): Promise<EventEntity> {
    this.assertDateRange(dto.startDate, dto.endDate);

    const category = await this.resolveCategory(dto.categoryId);

    const conflictCount = await this.OrganizerConflict(
      dto.organizerEmail,
      dto.startDate,
      dto.endDate,
    );

    if (conflictCount > 0) {
      throw new BadRequestException("Horario já ocupado por um organizador");
    }

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
    this.assertDateRange(startDate, endDate);

    const conflictCount = await this.OrganizerConflict(
      dto.organizerEmail,
      dto.startDate,
      dto.endDate,
      id,
    );

    if (conflictCount > 0) {
      throw new BadRequestException("Horario já ocupado por um organizador");
    }
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

  private async OrganizerConflict(
    organizerEmail: string,
    startDate: Date,
    endDate: Date,
    eventIdEdit?: number,
  ) {
    const qbOrganizerConflict = await this.eventsRepository
      .createQueryBuilder("event")
      .where("event.organizerEmail = :organizerEmail", { organizerEmail })
      .andWhere("event.startDate < :endDate", { endDate })
      .andWhere("event.endDate > :startDate", { startDate });

    if (eventIdEdit !== undefined) {
      qbOrganizerConflict.andWhere("event.id != :eventIdEdit", {
        eventIdEdit,
      });
    }

    const conflictCount = await qbOrganizerConflict.getCount();

    return conflictCount;
  }
}
