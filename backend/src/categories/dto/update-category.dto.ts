import { IsString, Length } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @Length(2, 60)
  name: string;
}
