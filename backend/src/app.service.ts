import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  async getHealth() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', db: 'ok' };
    } catch (error) {
      return { status: 'error', db: 'error', message: (error as Error).message };
    }
  }

  getVersion() {
    return { app: 'tcc-lab-backend', version: '0.1.0' };
  }
}
