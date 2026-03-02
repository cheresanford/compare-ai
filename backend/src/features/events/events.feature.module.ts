import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsController } from "./events.controller";
import { CreateEventUseCase } from "./application/use-cases/create-event.use-case";
import { DeleteEventUseCase } from "./application/use-cases/delete-event.use-case";
import { GetEventDetailsUseCase } from "./application/use-cases/get-event-details.use-case";
import { ListEventCategoriesUseCase } from "./application/use-cases/list-event-categories.use-case";
import { ListEventStatusesUseCase } from "./application/use-cases/list-event-statuses.use-case";
import { ListEventsUseCase } from "./application/use-cases/list-events.use-case";
import { UpdateEventUseCase } from "./application/use-cases/update-event.use-case";
import { EVENTS_COMMAND_REPOSITORY } from "./domain/interfaces/events-command.repository.interface";
import { EVENTS_DETAILS_REPOSITORY } from "./domain/interfaces/events-details.repository.interface";
import { EVENTS_LIST_REPOSITORY } from "./domain/interfaces/events-list.repository.interface";
import { EVENTS_LOOKUP_REPOSITORY } from "./domain/interfaces/events-lookup.repository.interface";
import { EVENTS_RELATORIO_REPOSITORY } from "./domain/interfaces/events-relatorio.repository.interface";
import { TypeormEventsCommandRepository } from "./infrastructure/repositories/typeorm-events-command.repository";
import { TypeormEventsDetailsRepository } from "./infrastructure/repositories/typeorm-events-details.repository";
import { TypeormEventsListRepository } from "./infrastructure/repositories/typeorm-events-list.repository";
import { TypeormEventsLookupRepository } from "./infrastructure/repositories/typeorm-events-lookup.repository";
import { Category } from "../../tables/categories/entities/category.entity";
import { Event } from "../../tables/events/entities/event.entity";
import { User } from "../../tables/users/entities/user.entity";
import { EventStatus } from "../../tables/event-statuses/entities/event-status.entity";
import { TypeormEventsRelatorioRepository } from "./infrastructure/repositories/typeorm-events-relatorio.repository";
import { ListEventsRelatoriosUseCase } from "./application/use-cases/list-events.relatorios.use-case";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, EventStatus, Category])],
  controllers: [EventsController],
  providers: [
    ListEventsUseCase,
    CreateEventUseCase,
    UpdateEventUseCase,
    GetEventDetailsUseCase,
    DeleteEventUseCase,
    ListEventCategoriesUseCase,
    ListEventStatusesUseCase,
    ListEventsRelatoriosUseCase,
    TypeormEventsListRepository,
    TypeormEventsCommandRepository,
    TypeormEventsDetailsRepository,
    TypeormEventsLookupRepository,
    TypeormEventsRelatorioRepository,
    {
      provide: EVENTS_LIST_REPOSITORY,
      useExisting: TypeormEventsListRepository,
    },
    {
      provide: EVENTS_RELATORIO_REPOSITORY,
      useExisting: TypeormEventsRelatorioRepository,
    },
    {
      provide: EVENTS_COMMAND_REPOSITORY,
      useExisting: TypeormEventsCommandRepository,
    },
    {
      provide: EVENTS_DETAILS_REPOSITORY,
      useExisting: TypeormEventsDetailsRepository,
    },
    {
      provide: EVENTS_LOOKUP_REPOSITORY,
      useExisting: TypeormEventsLookupRepository,
    },
  ],
})
export class EventsFeatureModule {}
