import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { EventsFeatureModule } from "./features/events/events.feature.module";
import { CategoriesModule } from "./tables/categories/categories.module";
import { EventStatusesModule } from "./tables/event-statuses/event-statuses.module";
import { EventsModule } from "./tables/events/events.module";
import { UsersModule } from "./tables/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    CategoriesModule,
    EventStatusesModule,
    EventsModule,
    EventsFeatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
