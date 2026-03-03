import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CreateEventDto } from "./application/dtos/create-event.dto";
import { DeleteEventQueryDto } from "./application/dtos/delete-event-query.dto";
import { EventsSummaryQueryDto } from "./application/dtos/events-summary-query.dto";
import { ListEventsQueryDto } from "./application/dtos/list-events-query.dto";
import { UpdateEventDto } from "./application/dtos/update-event.dto";
import { CreateEventUseCase } from "./application/use-cases/create-event.use-case";
import { DeleteEventUseCase } from "./application/use-cases/delete-event.use-case";
import { GetEventDetailsUseCase } from "./application/use-cases/get-event-details.use-case";
import { GetEventsSummaryUseCase } from "./application/use-cases/get-events-summary.use-case";
import { ListEventCategoriesUseCase } from "./application/use-cases/list-event-categories.use-case";
import { ListEventStatusesUseCase } from "./application/use-cases/list-event-statuses.use-case";
import { ListEventsUseCase } from "./application/use-cases/list-events.use-case";
import { UpdateEventUseCase } from "./application/use-cases/update-event.use-case";

@Controller("events")
export class EventsController {
  constructor(
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly getEventDetailsUseCase: GetEventDetailsUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly listEventCategoriesUseCase: ListEventCategoriesUseCase,
    private readonly listEventStatusesUseCase: ListEventStatusesUseCase,
    private readonly getEventsSummaryUseCase: GetEventsSummaryUseCase,
  ) {}

  @Get("options/categories")
  async listCategoryOptions() {
    return this.listEventCategoriesUseCase.execute();
  }

  @Get("options/statuses")
  async listStatusOptions() {
    return this.listEventStatusesUseCase.execute();
  }

  @Get()
  async list(@Query() query: ListEventsQueryDto) {
    return this.listEventsUseCase.execute(query);
  }

  @Get("reports/summary")
  async summary(@Query() query: EventsSummaryQueryDto) {
    return this.getEventsSummaryUseCase.execute(query);
  }

  @Post()
  async create(@Body() body: CreateEventDto) {
    return this.createEventUseCase.execute(body);
  }

  @Get(":id")
  async details(@Param("id", ParseIntPipe) id: number) {
    return this.getEventDetailsUseCase.execute(id);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateEventDto,
  ) {
    return this.updateEventUseCase.execute(id, body);
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: DeleteEventQueryDto,
  ) {
    return this.deleteEventUseCase.execute(id, query.confirm);
  }
}
