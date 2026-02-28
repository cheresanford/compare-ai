import { Transform } from "class-transformer";
import { IsString, Length } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @Length(2, 60)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name: string;
}
