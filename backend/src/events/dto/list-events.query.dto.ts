import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export type EventsSortBy = "startDate" | "createdAt";
export type SortDirection = "ASC" | "DESC";

export class ListEventsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryIdFilter?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(["startDate", "createdAt"])
  sortBy?: EventsSortBy;

  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  sortDir?: SortDirection | "asc" | "desc";
}
