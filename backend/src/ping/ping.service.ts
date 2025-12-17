import { Injectable } from '@nestjs/common';

@Injectable()
export class PingService {
    getMessage() {
        return {message: 'pong'};
    }
}
