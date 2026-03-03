import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoogleToken } from "./entities/google-token.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GoogleToken])],
  exports: [TypeOrmModule],
})
export class GoogleTokensModule {}
