import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

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
  endDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  organizerName?: string;

  @IsOptional()
  @IsEmail()
  organizerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  statusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number | null;
}
