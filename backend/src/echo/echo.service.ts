import { Injectable } from '@nestjs/common';
import { CreateEchoDto } from './dto/create-echo.dto';
@Injectable()
export class EchoService {
    run(dto: CreateEchoDto) {
        const repeat = dto.repeat ?? 1;

        return {
            original: dto.message,
            normalized: dto.message,
            repeated: Array.from({ length: repeat }, () => dto.message),
            repeat,
        };
    }

}
