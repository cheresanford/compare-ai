import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEchoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  message: string;

  @IsOptional()
  @Type(() => Number) // ajuda o transform a virar número
  @IsInt()
  @Min(1)
  @Max(5)
  repeat?: number;
}
