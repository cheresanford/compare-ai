import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../../../../tables/events/entities/event.entity";
import {
  EventsListRepository,
  ListEventsParams,
  ListEventsResult,
} from "../../domain/interfaces/events-list.repository.interface";

@Injectable()
export class TypeormEventsListRepository implements EventsListRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async list(params: ListEventsParams): Promise<ListEventsResult> {
    const page = params.page;
    const size = params.size;

    const sortColumnByField: Record<ListEventsParams["sortBy"], string> = {
      startDate: "event.startDate",
      createdAt: "event.createdAt",
    };

    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.user", "user")
      .leftJoinAndSelect("event.status", "status")
      .leftJoinAndSelect("event.category", "category");

    if (params.search) {
      queryBuilder.andWhere("event.title LIKE :search", {
        search: `%${params.search}%`,
      });
    }

    if (params.categoryId) {
      queryBuilder.andWhere("event.category_id = :categoryId", {
        categoryId: params.categoryId,
      });
    }

    queryBuilder
      .orderBy(
        sortColumnByField[params.sortBy],
        params.sortDirection.toUpperCase() as "ASC" | "DESC",
      )
      .addOrderBy("event.id", "DESC")
      .skip((page - 1) * size)
      .take(size);

    const [events, total] = await queryBuilder.getManyAndCount();

    return {
      items: events.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status.name,
        category: event.category
          ? {
              id: event.category.id,
              name: event.category.name,
            }
          : null,
        organizer: {
          id: event.user.id,
          name: event.user.name,
          email: event.user.email,
        },
        createdAt: event.createdAt,
      })),
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    };
  }
}
