export const EVENT_REPOSITORY = Symbol("EVENT_REPOSITORY");

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

