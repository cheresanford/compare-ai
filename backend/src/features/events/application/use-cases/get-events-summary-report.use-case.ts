import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  EVENTS_REPORT_REPOSITORY,
  EventsReportRepository,
} from "../../domain/interfaces/events-report.repository.interface";
import { EventsSummaryReportQueryDto } from "../dtos/events-summary-report-query.dto";

@Injectable()
export class GetEventsSummaryReportUseCase {
  constructor(
    @Inject(EVENTS_REPORT_REPOSITORY)
    private readonly eventsReportRepository: EventsReportRepository,
  ) {}

  async execute(query: EventsSummaryReportQueryDto) {
    if (query.endDate.getTime() <= query.startDate.getTime()) {
      throw new BadRequestException(
        "A data final deve ser maior que a data inicial.",
      );
    }

    return this.eventsReportRepository.getSummary({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
