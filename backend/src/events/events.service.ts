import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
  ) {}

  async list(query: ListEventsQueryDto): Promise<PaginatedResult<EventEntity>> {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const q = (query.q ?? "").trim();
    const categoryIdFilter = query.categoryIdFilter ?? null;

    const sortBy = query.sortBy ?? "startDate";
    const sortDirRaw = query.sortDir ?? "ASC";
    const sortDir =
      sortDirRaw.toString().toUpperCase() === "DESC" ? "DESC" : "ASC";

    const qb = this.eventsRepository.createQueryBuilder("event");

    if (q.length > 0) {
      qb.andWhere("event.title LIKE :q", { q: `%${q}%` });
    }

    if (categoryIdFilter) {
      qb.andWhere("event.categoryId = " + categoryIdFilter);
    }

    qb.orderBy(`event.${sortBy}`, sortDir as "ASC" | "DESC");
    qb.skip((page - 1) * size).take(size);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, size };
  }

  async findOne(id: number): Promise<EventEntity> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  async create(dto: CreateEventDto): Promise<EventEntity> {
    this.assertDateRange(dto.startDate, dto.endDate);

    const event = this.eventsRepository.create({
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
      location: dto.location,
      organizerEmail: dto.organizerEmail,
      status: dto.status ?? EventStatus.Scheduled,
      category: dto.categoryId,
    });

    return this.eventsRepository.save(event);
  }

  async update(id: number, dto: UpdateEventDto): Promise<EventEntity> {
    const existing = await this.findOne(id);

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;
    this.assertDateRange(startDate, endDate);

    const merged = this.eventsRepository.merge(existing, {
      ...dto,
      category:
        dto.category === undefined ? existing.category : (dto.category ?? null),
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
}
