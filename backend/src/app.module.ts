import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { CategoriesFeatureModule } from "./features/categories/categories.feature.module";
import { EventsFeatureModule } from "./features/events/events.feature.module";
import { CategoriesModule } from "./tables/categories/categories.module";
import { EventStatusesModule } from "./tables/event-statuses/event-statuses.module";
import { EventsModule } from "./tables/events/events.module";
import { GoogleTokensModule } from "./tables/google-tokens/google-tokens.module";
import { UsersModule } from "./tables/users/users.module";
import { GoogleFeatureModule } from "./features/google/google.feature.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    CategoriesModule,
    EventStatusesModule,
    EventsModule,
    GoogleTokensModule,
    EventsFeatureModule,
    CategoriesFeatureModule,
    GoogleFeatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
