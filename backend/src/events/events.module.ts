import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "./event.entity";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { CategoryEntity } from "../categories/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, CategoryEntity])],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
