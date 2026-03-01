import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, EventStatus } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
  ) {}

  async findAll(query: ListEventsQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const sortBy = query.sortBy ?? 'startDate';
    const sortDir = (query.sortDir ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const qb = this.eventsRepository.createQueryBuilder('event');

    const search = query.search?.trim();
    if (search) {
      qb.where('event.title LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy(`event.${sortBy}`, sortDir);
    qb.skip((page - 1) * size).take(size);

    const [items, total] = await qb.getManyAndCount();
    const pageCount = total === 0 ? 1 : Math.ceil(total / size);

    return {
      items,
      total,
      page,
      size,
      pageCount,
    };
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(dto: CreateEventDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (!this.isEndAfterStart(start, end)) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = this.eventsRepository.create({
      ...dto,
      title: dto.title.trim(),
      location: dto.location.trim(),
      organizerEmail: dto.organizerEmail.trim(),
      startDate: start,
      endDate: end,
      status: dto.status ?? EventStatus.SCHEDULED,
      category: this.normalizeOptional(dto.category),
    });

    return this.eventsRepository.save(event);
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    const start = dto.startDate ? new Date(dto.startDate) : event.startDate;
    const end = dto.endDate ? new Date(dto.endDate) : event.endDate;

    if (!this.isEndAfterStart(start, end)) {
      throw new BadRequestException('End date must be after start date');
    }

    Object.assign(event, {
      ...dto,
      title: dto.title ? dto.title.trim() : event.title,
      location: dto.location ? dto.location.trim() : event.location,
      organizerEmail: dto.organizerEmail
        ? dto.organizerEmail.trim()
        : event.organizerEmail,
      startDate: start,
      endDate: end,
      category: this.normalizeOptional(dto.category ?? event.category),
    });

    return this.eventsRepository.save(event);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
    return { deleted: true };
  }

  private isEndAfterStart(start: Date, end: Date) {
    return end.getTime() > start.getTime();
  }

  private normalizeOptional(value?: string | null) {
    if (value === undefined) return null;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
}
