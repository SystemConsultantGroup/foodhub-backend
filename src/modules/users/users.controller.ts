import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "src/modules/users/users.service";

@ApiTags("유저 API")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser() {
    const resp = await this.usersService.createUser();
    return resp;
  }

  @Get("me")
  async getMe() {
    const res = await this.usersService.getMe();
    return res;
  }

  @Patch("me")
  async updateMe() {
    const res = await this.usersService.updateMe();
    return res;
  }

  @Delete("me")
  async deleteMe() {
    const res = await this.usersService.deleteMe();
    return res;
  }
}
