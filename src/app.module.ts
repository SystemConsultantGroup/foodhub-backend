import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app/config.module";
import { GroupsModule } from "./modules/groups/groups.module";
import { AuthModule } from "./modules/auth/auth.module";
import { VotesModule } from "./modules/votes/votes.module";

@Module({
  imports: [AppConfigModule, AuthModule, GroupsModule, VotesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
