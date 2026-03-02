import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
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

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ""
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  categoryId?: number;
}
