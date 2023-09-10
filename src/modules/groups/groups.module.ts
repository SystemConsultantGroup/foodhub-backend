import { Module } from "@nestjs/common";
import { GroupsController, InvitationsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { CacheModule } from "@nestjs/cache-manager";
import { AuthService } from "src/modules/auth/auth.service";
import { Oauth2Strategy } from "src/modules/auth/strategies/oauth2.strategy";

@Module({
  imports: [CacheModule.register()],
  controllers: [GroupsController, InvitationsController],
  providers: [GroupsService, AuthService, Oauth2Strategy],
})
export class GroupsModule {}
