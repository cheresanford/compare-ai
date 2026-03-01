import { Event } from "../entities/event.entity";
import { PaginatedResult } from "../contracts/event.contracts";

export interface ListEventsParams {
  page: number;
  size: number;
  search?: string;
  sortBy: "startDate" | "createdAt";
  sortDir: "ASC" | "DESC";
  categoryId?: number;
}

export interface EventRepository {
  list(params: ListEventsParams): Promise<PaginatedResult<Event>>;
  findById(id: number): Promise<Event | null>;
  save(event: Event): Promise<Event>;
  remove(event: Event): Promise<void>;
}

