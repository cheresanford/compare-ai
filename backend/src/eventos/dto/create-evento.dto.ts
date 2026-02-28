import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsString, Length } from "class-validator";
export class CreateEventoDto {
  @IsString()
  @Length(3, 100)
  titulo: string;

  @IsDate()
  @Type(() => Date)
  dataInicio: Date;

  @IsDate()
  @Type(() => Date)
  dataTermino: Date;

  @IsBoolean()
  status: boolean;

  @IsEmail()
  organizadorEmail: string;

  @IsString()
  categoria?: string;
}
