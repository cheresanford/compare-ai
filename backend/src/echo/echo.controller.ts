import { Body, Controller, Get, Post } from '@nestjs/common';
import { EchoService } from './echo.service';
import { CreateEchoDto } from './dto/create-echo.dto';
import { NormalizeMessagePipe } from '../common/pipes/normalize-message/normalize-message.pipe';

@Controller('echo')
export class EchoController {
    constructor(private readonly echoService: EchoService) {}

    @Get('ping')
    ping() {
        return {ok: true};
    }

    @Post()
    create(
        @Body() dto: CreateEchoDto,
        @Body('message', NormalizeMessagePipe) message: string,
    ) {
        dto.message = message;
        return this.echoService.run(dto);
    }
}
