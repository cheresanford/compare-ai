import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  EVENTS_DETAILS_REPOSITORY,
  EventsDetailsRepository,
} from "../../domain/interfaces/events-details.repository.interface";

@Injectable()
export class GetEventDetailsUseCase {
  constructor(
    @Inject(EVENTS_DETAILS_REPOSITORY)
    private readonly eventsDetailsRepository: EventsDetailsRepository,
  ) {}

  async execute(eventId: number) {
    const event = await this.eventsDetailsRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException("Evento não encontrado.");
    }

    return event;
  }
}
