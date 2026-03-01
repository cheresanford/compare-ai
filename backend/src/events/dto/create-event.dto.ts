import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { EventStatus } from '../event.entity';

export class CreateEventDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @Length(2, 160)
  location: string;

  @IsEmail()
  organizerEmail: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsString()
  @IsOptional()
  @Length(2, 100)
  category?: string | null;
}
