import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Oauth2Strategy } from "./strategies/oauth2.strategy";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService, Oauth2Strategy],
  exports: [Oauth2Strategy],
})
export class AuthModule {}
