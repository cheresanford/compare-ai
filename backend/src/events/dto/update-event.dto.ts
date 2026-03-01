import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from "class-validator";
import { EventStatus } from "../event-status.enum";
import { IsAfterDate } from "../validators/is-after-date.validator";

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  title?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  // Se vierem as duas no PATCH, valida localmente também.
  @ValidateIf((obj: UpdateEventDto) => obj.startDate instanceof Date)
  @IsAfterDate("startDate", {
    message: "endDate must be strictly greater than startDate",
  })
  endDate?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string;

  @IsOptional()
  @IsEmail()
  organizerEmail?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  category?: string;
}
