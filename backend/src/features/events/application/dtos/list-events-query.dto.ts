import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import {
  EventSortBy,
  SortDirection,
} from "../../domain/interfaces/events-list.repository.interface";

export class ListEventsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  search?: string;

  @IsOptional()
  @IsIn(["startDate", "createdAt"])
  sortBy?: EventSortBy = "startDate";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortDirection?: SortDirection = "asc";
}
