export interface SelectionOptionItem {
  id: number;
  name: string;
}

export const EVENTS_LOOKUP_REPOSITORY = Symbol("EVENTS_LOOKUP_REPOSITORY");

export interface EventsLookupRepository {
  listCategories(): Promise<SelectionOptionItem[]>;
  listStatuses(): Promise<SelectionOptionItem[]>;
}
