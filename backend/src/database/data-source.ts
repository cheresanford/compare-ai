import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Evento } from '../eventos/entities/evento.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: [User, Evento],
  migrations: ['src/database/migrations/*.ts'],

  // Em produção/dev sério: false. (Laravel: nunca usar auto-sync)
  synchronize: false,
});
