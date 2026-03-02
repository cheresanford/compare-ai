import { IsDateString } from "class-validator";

export class EventsReportQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
