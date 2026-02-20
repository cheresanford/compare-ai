export type EventSortBy = "startDate" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface ListEventsParams {
  page: number;
  size: number;
  search?: string;
  sortBy: EventSortBy;
  sortDirection: SortDirection;
}

export interface EventListItem {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  status: string;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface ListEventsResult {
  items: EventListItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export const EVENTS_LIST_REPOSITORY = Symbol("EVENTS_LIST_REPOSITORY");

export interface EventsListRepository {
  list(params: ListEventsParams): Promise<ListEventsResult>;
}
