import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../../../../tables/events/entities/event.entity";
import {
  EventDetailsResult,
  EventsDetailsRepository,
} from "../../domain/interfaces/events-details.repository.interface";

@Injectable()
export class TypeormEventsDetailsRepository implements EventsDetailsRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async findById(eventId: number): Promise<EventDetailsResult | null> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { user: true, status: true, category: true },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      createdAt: event.createdAt,
      status: {
        id: event.status.id,
        name: event.status.name,
      },
      organizer: {
        id: event.user.id,
        name: event.user.name,
        email: event.user.email,
      },
      category: event.category
        ? {
            id: event.category.id,
            name: event.category.name,
          }
        : null,
    };
  }
}
