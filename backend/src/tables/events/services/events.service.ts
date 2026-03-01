import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../entities/event.entity";
import { User } from "../../users/entities/user.entity";
import { Category } from "../../categories/entities/category.entity";
import { EventStatus } from "../../event-statuses/entities/event-status.entity";
import { EVENT_REPOSITORY } from "../contracts/event.contracts";
import { EventRepository } from "../repositories/event.repository";
import { ListEventsQueryDto } from "../dto/list-events-query.dto";
import { CreateEventDto } from "../dto/create-event.dto";
import { UpdateEventDto } from "../dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(EventStatus)
    private readonly statusRepository: Repository<EventStatus>,
  ) {}

  async list(query: ListEventsQueryDto) {
    return this.eventRepository.list({
      page: query.page ?? 1,
      size: query.size ?? 10,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy ?? "startDate",
      sortDir: (query.sortDir ?? "asc").toUpperCase() as "ASC" | "DESC",
      categoryId: query.categoryId,
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException("Evento não encontrado");
    }

    return event;
  }

  async create(dto: CreateEventDto) {
    this.validateDateRange(dto.startDate, dto.endDate);

    const [status, organizer, category] = await Promise.all([
      this.resolveStatusByName(dto.status),
      this.resolveUserByEmail(dto.organizerEmail, dto.organizerName),
      this.resolveCategory(dto.categoryId),
    ]);

    const event = new Event();
    event.title = dto.title.trim();
    event.startDate = dto.startDate;
    event.endDate = dto.endDate;
    event.location = dto.location.trim();
    event.statusId = status.id;
    event.status = status;
    event.userId = organizer.id;
    event.user = organizer;
    event.categoryId = category?.id ?? null;
    event.category = category;

    return this.eventRepository.save(event);
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    const nextStartDate = dto.startDate ?? event.startDate;
    const nextEndDate = dto.endDate ?? event.endDate;
    this.validateDateRange(nextStartDate, nextEndDate);

    if (dto.title !== undefined) {
      event.title = dto.title.trim();
    }

    if (dto.startDate !== undefined) {
      event.startDate = dto.startDate;
    }

    if (dto.endDate !== undefined) {
      event.endDate = dto.endDate;
    }

    if (dto.location !== undefined) {
      event.location = dto.location.trim();
    }

    if (dto.status !== undefined) {
      const status = await this.resolveStatusByName(dto.status);
      event.statusId = status.id;
      event.status = status;
    }

    if (dto.organizerEmail !== undefined) {
      const organizer = await this.resolveUserByEmail(
        dto.organizerEmail,
        dto.organizerName,
      );
      event.userId = organizer.id;
      event.user = organizer;
    }

    if (dto.categoryId !== undefined) {
      const category = await this.resolveCategory(dto.categoryId);
      event.categoryId = category?.id ?? null;
      event.category = category;
    }

    return this.eventRepository.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);

    return { deleted: true };
  }

  async options() {
    const [categories, statuses] = await Promise.all([
      this.categoryRepository.find({ order: { name: "ASC" } }),
      this.statusRepository.find({ order: { name: "ASC" } }),
    ]);

    return {
      categories,
      statuses,
    };
  }

  private async resolveStatusByName(name: string) {
    const normalized = name?.trim().toLowerCase();

    if (!["agendado", "cancelado"].includes(normalized)) {
      throw new BadRequestException("Status deve ser 'agendado' ou 'cancelado'");
    }

    const status = await this.statusRepository.findOne({
      where: { name: normalized },
    });

    if (!status) {
      throw new BadRequestException("Status inválido");
    }

    return status;
  }

  private async resolveUserByEmail(email: string, organizerName?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return existingUser;
    }

    const user = new User();
    user.email = normalizedEmail;
    user.name = organizerName?.trim() || normalizedEmail.split("@")[0];

    return this.userRepository.save(user);
  }

  private async resolveCategory(categoryId?: number | null) {
    if (!categoryId) {
      return null;
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException("Categoria inválida");
    }

    return category;
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new BadRequestException("Data de início inválida");
    }

    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Data de término inválida");
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        "Data de término deve ser maior que a data de início",
      );
    }
  }
}

