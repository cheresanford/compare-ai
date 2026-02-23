import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { User } from "../users/entities/user.entity";
import { Category } from "../categories/entities/category.entity";
import { EventStatus } from "../event-statuses/entities/event-status.entity";
import { EventsController } from "./events.controller";
import { EventsService } from "./services/events.service";
import { EVENT_REPOSITORY } from "./contracts/event.contracts";
import { TypeOrmEventRepository } from "./repositories/typeorm-event.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Category, EventStatus])],
  controllers: [EventsController],
  providers: [
    EventsService,
    TypeOrmEventRepository,
    {
      provide: EVENT_REPOSITORY,
      useExisting: TypeOrmEventRepository,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}

