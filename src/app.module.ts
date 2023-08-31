import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppConfigModule } from "./config/app/config.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [AppConfigModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
