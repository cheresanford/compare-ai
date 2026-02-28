import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query.dto';
import { User } from '../users/entities/user.entity';
import { EventStatus } from '../event-statuses/entities/event-status.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(EventStatus)
    private readonly statusesRepository: Repository<EventStatus>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list(query: ListEventsQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const sortBy = query.sortBy ?? 'startDate';
    const sortOrder = query.sortOrder ?? 'ASC';
    const search = query.search ?? '';

    const where = search
      ? {
          title: ILike(`%${search}%`),
        }
      : {};

    const [items, total] = await this.eventsRepository.findAndCount({
      where,
      relations: {
        user: true,
        status: true,
      },
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.map((event) => this.toEventListItem(event)),
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    };
  }

  async getById(id: number) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: {
        user: true,
        status: true,
        category: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return this.toEventDetail(event);
  }

  async create(input: CreateEventDto) {
    this.validateDateRange(input.startDate, input.endDate);

    const status = await this.statusesRepository.findOne({
      where: { id: input.statusId },
    });

    if (!status) {
      throw new BadRequestException('Status inválido');
    }

    let category: Category | null = null;
    if (input.categoryId !== null && input.categoryId !== undefined) {
      category = await this.categoriesRepository.findOne({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Categoria inválida');
      }
    }

    const organizer = await this.findOrCreateOrganizer(
      input.organizerEmail,
      input.organizerName,
    );

    const event = this.eventsRepository.create({
      title: input.title,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      location: input.location,
      userId: organizer.id,
      statusId: status.id,
      categoryId: category?.id ?? null,
    });

    const saved = await this.eventsRepository.save(event);
    return this.getById(saved.id);
  }

  async update(id: number, input: UpdateEventDto) {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    const nextStartDate = input.startDate ?? event.startDate.toISOString();
    const nextEndDate = input.endDate ?? event.endDate.toISOString();
    this.validateDateRange(nextStartDate, nextEndDate);

    if (input.statusId !== undefined) {
      const status = await this.statusesRepository.findOne({
        where: { id: input.statusId },
      });
      if (!status) {
        throw new BadRequestException('Status inválido');
      }
      event.statusId = status.id;
    }

    if (input.categoryId !== undefined) {
      if (input.categoryId === null) {
        event.categoryId = null;
      } else {
        const category = await this.categoriesRepository.findOne({
          where: { id: input.categoryId },
        });
        if (!category) {
          throw new BadRequestException('Categoria inválida');
        }
        event.categoryId = category.id;
      }
    }

    if (input.organizerEmail !== undefined) {
      const organizer = await this.findOrCreateOrganizer(
        input.organizerEmail,
        input.organizerName,
      );
      event.userId = organizer.id;
    }

    if (input.title !== undefined) {
      event.title = input.title;
    }
    if (input.startDate !== undefined) {
      event.startDate = new Date(input.startDate);
    }
    if (input.endDate !== undefined) {
      event.endDate = new Date(input.endDate);
    }
    if (input.location !== undefined) {
      event.location = input.location;
    }

    await this.eventsRepository.save(event);
    return this.getById(event.id);
  }

  async remove(id: number) {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    await this.eventsRepository.remove(event);
    return { deleted: true, id };
  }

  async options() {
    const [statuses, categories] = await Promise.all([
      this.statusesRepository.find({ order: { id: 'ASC' } }),
      this.categoriesRepository.find({ order: { name: 'ASC' } }),
    ]);

    return { statuses, categories };
  }

  private validateDateRange(startDateRaw: string, endDateRaw: string) {
    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate.getTime() <= startDate.getTime()
    ) {
      throw new BadRequestException(
        'A data de término deve ser maior que a data de início',
      );
    }
  }

  private async findOrCreateOrganizer(email: string, name?: string) {
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      return existing;
    }

    const fallbackName = email.split('@')[0] || 'Organizador';
    const user = this.usersRepository.create({
      email,
      name: name?.trim() || fallbackName,
    });

    return this.usersRepository.save(user);
  }

  private toEventListItem(event: Event) {
    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      createdAt: event.createdAt,
      location: event.location,
      status: event.status?.name,
      statusId: event.statusId,
      organizerEmail: event.user?.email,
      organizerName: event.user?.name,
      categoryId: event.categoryId,
    };
  }

  private toEventDetail(event: Event) {
    return {
      ...this.toEventListItem(event),
      category: event.category
        ? {
            id: event.category.id,
            name: event.category.name,
          }
        : null,
    };
  }
}
