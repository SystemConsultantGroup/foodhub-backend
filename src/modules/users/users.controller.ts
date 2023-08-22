import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "src/modules/users/users.service";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";
import { CreateUserResponseDto } from "src/modules/users/dtos/create-user-response.dto";

@ApiTags("유저 API")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "회원가입 API",
    description: "카카오 로그인 정보를 통해 유저를 DB에 추가한다.",
  })
  @ApiCreatedResponse({ type: CreateUserResponseDto, description: "회원가입 성공" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userInfo = await this.usersService.createUser(createUserDto);
    return new CreateUserResponseDto(userInfo);
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
