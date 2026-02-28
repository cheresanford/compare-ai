import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @Length(2, 255)
  location: string;

  @IsEmail()
  organizerEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  organizerName?: string;

  @Type(() => Number)
  @IsInt()
  statusId: number;

  @ValidateIf((dto) => dto.categoryId !== null && dto.categoryId !== undefined)
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;
}
