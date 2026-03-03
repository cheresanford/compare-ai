import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoogleAuthController } from "./google.controller";
import { GoogleIntegrationService } from "./google.service";
import { GoogleToken } from "../../tables/google-tokens/entities/google-token.entity";
import { Event } from "../../tables/events/entities/event.entity";
import { User } from "../../tables/users/entities/user.entity";
import { EventStatus } from "../../tables/event-statuses/entities/event-status.entity";
import { Category } from "../../tables/categories/entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GoogleToken, Event, User, EventStatus, Category])],
  controllers: [GoogleAuthController],
  providers: [GoogleIntegrationService],
  exports: [GoogleIntegrationService],
})
export class GoogleFeatureModule {}
