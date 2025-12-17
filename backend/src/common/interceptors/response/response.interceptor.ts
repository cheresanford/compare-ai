import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { traceId?: string }>();

    // tenta pegar do header; se não vier, gera
    const traceId =
      (req.headers as any)?.['x-trace-id']?.toString() ??
      req.traceId ??
      randomUUID();

    req.traceId = traceId;

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          traceId,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
