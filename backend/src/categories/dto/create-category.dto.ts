import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

import { IntegerType } from "typeorm";

export class CreateCategoryDto {
  @IsString()
  @Length(2, 60)
  name: string;
}
