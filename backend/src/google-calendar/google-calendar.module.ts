import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "../events/event.entity";
import {
  GoogleCalendarController,
  GoogleOAuthController,
} from "./google-calendar.controller";
import { GoogleCalendarSessionEntity } from "./google-calendar-session.entity";
import { GoogleCalendarService } from "./google-calendar.service";

@Module({
  imports: [TypeOrmModule.forFeature([GoogleCalendarSessionEntity, EventEntity])],
  providers: [GoogleCalendarService],
  controllers: [GoogleCalendarController, GoogleOAuthController],
})
export class GoogleCalendarModule {}
