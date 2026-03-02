import { Type } from "class-transformer";
import { IsDate, IsDateString } from "class-validator";
import { IsAfterDate } from "../validators/is-after-date.validator";

export class EventRelatorioDto {
  @Type(() => Date)
  @IsDateString()
  startDate: Date;

  @Type(() => Date)
  @IsDateString()
  @IsAfterDate("startDate", {
    message: "endDate must be strictly greater than startDate",
  })
  endDate: Date;
}

export type EventResult = {
  totalEvents;
};
