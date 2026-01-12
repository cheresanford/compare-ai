import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, MaxLength } from "class-validator";

export class CreateEventoDto {
    // deixar tudo em uppercase
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsNotEmpty()
    @MaxLength(120)
    nome_evento: string;
    @IsNotEmpty()
    @Transform(({ value }) => (value ? new Date(value) : value), { toClassOnly: true })
    @IsDate()
    data_evento: Date;
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsNotEmpty()
    @MaxLength(300)
    local_evento: string;
}
