import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, maxLength, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(120)
  email: string;


  @Type(() => Boolean)
  @IsBoolean()
  is_active: boolean;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value))
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
