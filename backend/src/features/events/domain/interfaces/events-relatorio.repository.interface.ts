import { Event } from "./../../../../tables/events/entities/event.entity";
export type EventSortBy = "startDate" | "createdAt";
export type SortDirection = "asc" | "desc";
export type EventStatuses = "agendado" | "cancelado";

export interface RelatorioEventParams {
  startDate: Date;
  endDate: Date;
}

export interface EventosPorStatus {
  status: EventStatuses;
  quantidadeDeEventos: number;
}

export interface EventosPorCategoria {
  nomeCategoria: string;
  quantidadeDeEventos: number;
}

export interface RelatorioEventItem {
  totalEventosPorStatus: EventosPorStatus[];
  totalEventosPorCategoria: EventosPorCategoria[];
}

export const EVENTS_RELATORIO_REPOSITORY = Symbol(
  "EVENTS_RELATORIO_REPOSITORY",
);

export interface EventsRelatorioRepository {
  list(params: RelatorioEventParams): Promise<RelatorioEventItem>;
}
