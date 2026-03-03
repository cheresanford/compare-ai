import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../../../tables/categories/entities/category.entity";
import { EventStatus } from "../../../../tables/event-statuses/entities/event-status.entity";
import { Event } from "../../../../tables/events/entities/event.entity";
import { User } from "../../../../tables/users/entities/user.entity";
import {
  EventCommandResult,
  EventsCommandRepository,
  SaveEventPayload,
} from "../../domain/interfaces/events-command.repository.interface";

@Injectable()
export class TypeormEventsCommandRepository implements EventsCommandRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EventStatus)
    private readonly eventStatusRepository: Repository<EventStatus>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(payload: SaveEventPayload): Promise<EventCommandResult> {
    const user = await this.findOrCreateOrganizer(
      payload.organizerName,
      payload.organizerEmail,
    );

    const status = await this.getStatus(payload.statusId, payload.status);
    const category = await this.getCategoryOrNull(payload.categoryId);

    const entity = this.eventRepository.create({
      title: payload.title,
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      userId: user.id,
      statusId: status.id,
      categoryId: category?.id ?? null,
    });

    const savedEvent = await this.eventRepository.save(entity);
    const event = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: { user: true, status: true, category: true },
    });

    if (!event) {
      throw new NotFoundException("Evento não encontrado após criação.");
    }

    return this.mapEvent(event);
  }

  async update(
    eventId: number,
    payload: SaveEventPayload,
  ): Promise<EventCommandResult> {
    const existing = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!existing) {
      throw new NotFoundException("Evento não encontrado.");
    }

    const user = await this.findOrCreateOrganizer(
      payload.organizerName,
      payload.organizerEmail,
    );

    const status = await this.getStatus(payload.statusId, payload.status);
    const category = await this.getCategoryOrNull(payload.categoryId);

    existing.title = payload.title;
    existing.startDate = payload.startDate;
    existing.endDate = payload.endDate;
    existing.location = payload.location;
    existing.userId = user.id;
    existing.statusId = status.id;
    existing.categoryId = category?.id ?? null;

    await this.eventRepository.save(existing);

    const updated = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { user: true, status: true, category: true },
    });

    if (!updated) {
      throw new NotFoundException("Evento não encontrado após atualização.");
    }

    return this.mapEvent(updated);
  }

  async delete(eventId: number): Promise<void> {
    await this.eventRepository.delete({ id: eventId });
  }

  async findById(eventId: number): Promise<EventCommandResult | null> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { user: true, status: true, category: true },
    });

    if (!event) {
      return null;
    }

    return this.mapEvent(event);
  }

  async hasOverlappingEvent(params: {
    organizerEmail: string;
    startDate: Date;
    endDate: Date;
    excludeEventId?: number;
  }): Promise<boolean> {
    const query = this.eventRepository
      .createQueryBuilder("event")
      .innerJoin("event.user", "user")
      .where("LOWER(user.email) = LOWER(:email)", {
        email: params.organizerEmail,
      })
      .andWhere("event.startDate < :endDate", { endDate: params.endDate })
      .andWhere("event.endDate > :startDate", { startDate: params.startDate });

    if (
      params.excludeEventId !== undefined &&
      params.excludeEventId !== null
    ) {
      query.andWhere("event.id <> :excludeEventId", {
        excludeEventId: params.excludeEventId,
      });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async categoryExists(categoryId: number): Promise<boolean> {
    const count = await this.categoryRepository.count({
      where: { id: categoryId },
    });
    return count > 0;
  }

  async statusExists(status: string): Promise<boolean> {
    const count = await this.eventStatusRepository.count({
      where: { name: status },
    });
    return count > 0;
  }

  async statusExistsById(statusId: number): Promise<boolean> {
    const count = await this.eventStatusRepository.count({
      where: { id: statusId },
    });
    return count > 0;
  }

  private async findOrCreateOrganizer(
    name: string,
    email: string,
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      if (existing.name !== name) {
        existing.name = name;
        return this.userRepository.save(existing);
      }

      return existing;
    }

    const user = this.userRepository.create({ name, email });
    return this.userRepository.save(user);
  }

  private async getStatus(
    statusId?: number,
    statusName?: string,
  ): Promise<EventStatus> {
    if (statusId) {
      const statusById = await this.eventStatusRepository.findOne({
        where: { id: statusId },
      });

      if (statusById) {
        return statusById;
      }
    }

    if (statusName) {
      const statusByName = await this.eventStatusRepository.findOne({
        where: { name: statusName },
      });

      if (statusByName) {
        return statusByName;
      }
    }

    throw new NotFoundException("Status de evento não encontrado.");
  }

  private async getCategoryOrNull(
    categoryId?: number | null,
  ): Promise<Category | null> {
    if (!categoryId) {
      return null;
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    return category;
  }

  private mapEvent(event: Event): EventCommandResult {
    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      statusId: event.status.id,
      status: event.status.name,
      organizer: {
        id: event.user.id,
        name: event.user.name,
        email: event.user.email,
      },
      categoryId: event.category?.id ?? null,
      createdAt: event.createdAt,
    };
  }
}
