import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const portRaw = config.get<string>('DB_PORT') ?? '3306';
        const port = Number.parseInt(portRaw, 10);
        const syncFlag = config.get<string>('DB_SYNC') ?? 'true';

        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST') ?? 'localhost',
          port: Number.isFinite(port) ? port : 3306,
          username: config.get<string>('DB_USER') ?? 'root',
          password: config.get<string>('DB_PASS') ?? '',
          database: config.get<string>('DB_NAME') ?? 'tcc',
          autoLoadEntities: true,
          synchronize: syncFlag === 'true',
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          retryAttempts: 10,
          retryDelay: 2000,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
