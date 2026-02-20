import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventStatus } from "./entities/event-status.entity";

@Module({
  imports: [TypeOrmModule.forFeature([EventStatus])],
  exports: [TypeOrmModule],
})
export class EventStatusesModule {}
