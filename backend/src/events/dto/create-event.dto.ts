import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { EventStatus } from "../event-status.enum";
import { IsAfterDate } from "../validators/is-after-date.validator";

export class CreateEventDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsAfterDate("startDate", {
    message: "endDate must be strictly greater than startDate",
  })
  endDate: Date;

  @IsString()
  @Length(1, 255)
  location: string;

  @IsEmail()
  organizerEmail: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsNumber()
  categoryId: string;
}
