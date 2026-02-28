import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { User } from "../users/entities/user.entity";
import { EventStatus } from "../event-statuses/entities/event-status.entity";
import { Category } from "../categories/entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, EventStatus, Category])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [TypeOrmModule],
})
export class EventsModule {}
