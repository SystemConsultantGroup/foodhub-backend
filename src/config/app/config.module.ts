import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./configuration";
import { LoggerModule } from "../logger/logger.module";
import { PrismaModule } from "../database/prisma.module";

@Module({
  // 사용할 모듈 불러오기
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env." + process.env.NODE_ENV,
      load: [configuration],
      cache: true,
    }),
    LoggerModule,
    PrismaModule,
  ],
})
export class AppConfigModule {}
