import { Inject, Injectable } from "@nestjs/common";
import { ListEventsQueryDto } from "../dtos/list-events-query.dto";
import {
  EVENTS_LIST_REPOSITORY,
  EventsListRepository,
  ListEventsResult,
} from "../../domain/interfaces/events-list.repository.interface";

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENTS_LIST_REPOSITORY)
    private readonly eventsListRepository: EventsListRepository,
  ) {}

  execute(query: ListEventsQueryDto): Promise<ListEventsResult> {
    return this.eventsListRepository.list({
      page: query.page ?? 1,
      size: query.size ?? 10,
      search: query.search,
      sortBy: query.sortBy ?? "startDate",
      sortDirection: query.sortDirection ?? "asc",
    });
  }
}
