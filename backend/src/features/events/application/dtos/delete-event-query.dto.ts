import { Transform } from "class-transformer";
import { IsBoolean } from "class-validator";

export class DeleteEventQueryDto {
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  confirm: boolean;
}
