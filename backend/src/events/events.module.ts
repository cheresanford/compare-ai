import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "../categories/category.entity";
import { EventEntity } from "./event.entity";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, CategoryEntity])],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
