import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppConfigModule } from "./config/app/config.module";
import { UsersModule } from "src/modules/users/users.module";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [AppConfigModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
