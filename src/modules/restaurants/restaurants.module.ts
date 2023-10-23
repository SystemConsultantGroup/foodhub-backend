import { Module } from "@nestjs/common";
import { RestaurantControllerGroups, RestaurantsController } from "./restaurants.controller";
import { RestaurantsService } from "./restaurants.service";
import { PrismaService } from "src/config/database/prisma.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [RestaurantsController, RestaurantControllerGroups],
  providers: [RestaurantsService, PrismaService],
})
export class RestaurantsModule {}
