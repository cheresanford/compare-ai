import { Inject, Injectable } from "@nestjs/common";
import {
  EVENTS_LOOKUP_REPOSITORY,
  EventsLookupRepository,
} from "../../domain/interfaces/events-lookup.repository.interface";

@Injectable()
export class ListEventStatusesUseCase {
  constructor(
    @Inject(EVENTS_LOOKUP_REPOSITORY)
    private readonly eventsLookupRepository: EventsLookupRepository,
  ) {}

  execute() {
    return this.eventsLookupRepository.listStatuses();
  }
}
