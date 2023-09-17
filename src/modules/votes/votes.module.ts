import { Module } from "@nestjs/common";
import {
  VotesControllerGroups,
  VotesControllerVotes,
  VotesControllerItems,
} from "./votes.controller";
import { VotesService } from "./votes.service";
import { CacheModule } from "@nestjs/cache-manager";
import { AuthService } from "src/modules/auth/auth.service";
import { Oauth2Strategy } from "src/modules/auth/strategies/oauth2.strategy";

@Module({
  imports: [CacheModule.register()],
  controllers: [VotesControllerGroups, VotesControllerVotes, VotesControllerItems],
  providers: [VotesService, AuthService, Oauth2Strategy],
})
export class VotesModule {}
