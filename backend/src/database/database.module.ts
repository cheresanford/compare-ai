import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
        username: configService.get<string>('DB_USER', 'tcc'),
        password: configService.get<string>('DB_PASS', 'tcc'),
        database: configService.get<string>('DB_NAME', 'tcc'),
        autoLoadEntities: true,
        synchronize: false, // <- baseado
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
