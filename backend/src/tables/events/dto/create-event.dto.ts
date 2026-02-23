import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

export class CreateEventDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsString()
  @MaxLength(255)
  location: string;

  @IsEmail()
  organizerEmail: string;

  @IsString()
  @MaxLength(150)
  @IsOptional()
  organizerName?: string;

  @IsString()
  status: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  categoryId?: number;
}

