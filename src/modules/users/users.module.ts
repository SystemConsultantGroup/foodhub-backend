import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
