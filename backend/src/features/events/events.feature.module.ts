import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { ListEventsUseCase } from './application/use-cases/list-events.use-case';
import { EVENTS_LIST_REPOSITORY } from './domain/interfaces/events-list.repository.interface';
import { TypeormEventsListRepository } from './infrastructure/repositories/typeorm-events-list.repository';
import { Event } from '../../tables/events/entities/event.entity';
import { User } from '../../tables/users/entities/user.entity';
import { EventStatus } from '../../tables/event-statuses/entities/event-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, EventStatus])],
  controllers: [EventsController],
  providers: [
    ListEventsUseCase,
    TypeormEventsListRepository,
    {
      provide: EVENTS_LIST_REPOSITORY,
      useExisting: TypeormEventsListRepository,
    },
  ],
})
export class EventsFeatureModule {}
