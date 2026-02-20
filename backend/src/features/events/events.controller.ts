import { Controller, Get, Query } from "@nestjs/common";
import { ListEventsQueryDto } from "./application/dtos/list-events-query.dto";
import { ListEventsUseCase } from "./application/use-cases/list-events.use-case";

@Controller("events")
export class EventsController {
  constructor(private readonly listEventsUseCase: ListEventsUseCase) {}

  @Get()
  async list(@Query() query: ListEventsQueryDto) {
    return this.listEventsUseCase.execute(query);
  }
}
