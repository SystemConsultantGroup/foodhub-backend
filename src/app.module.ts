import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppConfigModule } from "./config/app/config.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { GroupsModule } from "./modules/groups/groups.module";

@Module({
  imports: [AppConfigModule, AuthModule, RestaurantsModule, GroupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
