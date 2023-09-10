import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app/config.module";
import { GroupsModule } from "./modules/groups/groups.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [AppConfigModule, AuthModule, GroupsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
