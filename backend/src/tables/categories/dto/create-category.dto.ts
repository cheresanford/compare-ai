import { Transform } from "class-transformer";
import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @Transform(({ value }) => value?.toString().trim())
  @IsString()
  @Length(2, 60)
  name: string;
}
