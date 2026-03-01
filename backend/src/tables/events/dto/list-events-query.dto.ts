import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const SORT_FIELDS = ["startDate", "createdAt"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

export class ListEventsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  size?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @Transform(({ value }) => value?.toString().trim())
  @IsIn(SORT_FIELDS)
  @IsOptional()
  sortBy?: "startDate" | "createdAt" = "startDate";

  @Transform(({ value }) => value?.toString().toLowerCase())
  @IsIn(SORT_DIRECTIONS)
  @IsOptional()
  sortDir?: "asc" | "desc" = "asc";

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;
}

