import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASS', ''),
        database: configService.get<string>('DB_NAME', 'test'),
        entities: [User],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
