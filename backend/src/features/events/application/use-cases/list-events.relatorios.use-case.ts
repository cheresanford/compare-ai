import { Inject, Injectable } from "@nestjs/common";
import { ListEventsQueryDto } from "../dtos/list-events-query.dto";
import {
  EventsListRepository,
  ListEventsResult,
} from "../../domain/interfaces/events-list.repository.interface";
import {
  EVENTS_RELATORIO_REPOSITORY,
  EventsRelatorioRepository,
  RelatorioEventItem,
} from "../../domain/interfaces/events-relatorio.repository.interface";
import { EventsRelatorioQueryDto } from "../dtos/events-relatorio-query.dto";

@Injectable()
export class ListEventsRelatoriosUseCase {
  constructor(
    @Inject(EVENTS_RELATORIO_REPOSITORY)
    private readonly eventsRelatorio: EventsRelatorioRepository,
  ) {}

  execute(query: EventsRelatorioQueryDto): Promise<RelatorioEventItem> {
    return this.eventsRelatorio.list({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
