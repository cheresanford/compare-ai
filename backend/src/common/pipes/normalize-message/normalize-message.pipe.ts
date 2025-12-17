import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Console } from 'console';

@Injectable()
export class NormalizeMessagePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string') return value;

    const normalized = value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase(); // colapsa espaços
      

      console.log('Normalized message:', normalized);

    if (normalized.length === 0) {
      throw new BadRequestException('message não pode ser vazia');
    }

    return normalized;
  }
}
