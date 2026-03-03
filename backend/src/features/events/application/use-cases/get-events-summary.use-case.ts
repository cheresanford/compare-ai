import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { EventsSummaryQueryDto } from "../dtos/events-summary-query.dto";
import {
  EVENTS_REPORT_REPOSITORY,
  EventsReportRepository,
} from "../../domain/interfaces/events-report.repository.interface";

@Injectable()
export class GetEventsSummaryUseCase {
  constructor(
    @Inject(EVENTS_REPORT_REPOSITORY)
    private readonly eventsReportRepository: EventsReportRepository,
  ) {}

  async execute(query: EventsSummaryQueryDto) {
    if (query.endDate.getTime() < query.startDate.getTime()) {
      throw new BadRequestException(
        "A data final deve ser maior ou igual a data inicial.",
      );
    }

    const result = await this.eventsReportRepository.getSummary({
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      ...result,
    };
  }
}
