export interface EventDetailsResult {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  createdAt: Date;
  googleEventId?: string | null;
  status: {
    id: number;
    name: string;
  };
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  } | null;
}

export const EVENTS_DETAILS_REPOSITORY = Symbol("EVENTS_DETAILS_REPOSITORY");

export interface EventsDetailsRepository {
  findById(eventId: number): Promise<EventDetailsResult | null>;
}
