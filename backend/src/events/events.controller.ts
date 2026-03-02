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
import { CreateEventDto } from "./dto/create-event.dto";
import { ListEventsQueryDto } from "./dto/list-events.query.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";
import { EventRelatorioDto } from "./dto/event-relatorio.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(@Query() query: ListEventsQueryDto) {
    return this.eventsService.list(query);
  }

  @Get("relatorios")
  relatorio(@Param() query: EventRelatorioDto) {
    return this.eventsService.relatorio(query.startDate, query.endDate);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
