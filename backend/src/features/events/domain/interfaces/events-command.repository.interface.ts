import { CreateEventDto } from "../../application/dtos/create-event.dto";
import { UpdateEventDto } from "../../application/dtos/update-event.dto";

export interface SaveEventPayload {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status?: string;
  statusId?: number;
  organizerName: string;
  organizerEmail: string;
  categoryId?: number | null;
}

export interface EventCommandResult {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  statusId: number;
  status: string;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  categoryId?: number | null;
  createdAt: Date;
}

export const EVENTS_COMMAND_REPOSITORY = Symbol("EVENTS_COMMAND_REPOSITORY");

export interface EventsCommandRepository {
  create(payload: SaveEventPayload): Promise<EventCommandResult>;
  update(
    eventId: number,
    payload: SaveEventPayload,
  ): Promise<EventCommandResult>;
  delete(eventId: number): Promise<void>;
  findById(eventId: number): Promise<EventCommandResult | null>;
  categoryExists(categoryId: number): Promise<boolean>;
  areEventsOverlapping(
    newEvent: CreateEventDto | UpdateEventDto,
  ): Promise<boolean>;
  statusExists(status: string): Promise<boolean>;
  statusExistsById(statusId: number): Promise<boolean>;
}
