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
        const nodeEnv = (config.get<string>('NODE_ENV') ?? '').toLowerCase();
        const isDev = nodeEnv === 'development' || nodeEnv === 'dev';
        const dbSyncRaw = (config.get<string>('DB_SYNC') ?? '').toLowerCase();
        const dbSyncFromEnv =
          dbSyncRaw === 'true' ? true : dbSyncRaw === 'false' ? false : null;

        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST') ?? 'localhost',
          port: Number.isFinite(port) ? port : 3306,
          username: config.get<string>('DB_USER') ?? 'root',
          password: config.get<string>('DB_PASS') ?? '',
          database: config.get<string>('DB_NAME') ?? 'tcc',
          autoLoadEntities: true,
          // Em dev, facilita demonstração local sem migrations.
          // Em produção, mantenha migrations + synchronize=false.
          synchronize: dbSyncFromEnv ?? isDev,
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
