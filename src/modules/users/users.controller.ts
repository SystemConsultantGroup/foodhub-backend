import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UsersService } from "src/modules/users/users.service";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";
import { UserResponseDto } from "src/modules/users/dtos/user-response.dto";
import { UpdateUserDto } from "src/modules/users/dtos/update-user.dto";
import { Oauth2Guard } from "src/modules/auth/guards/oauth2.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";

@ApiTags("유저 API")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "회원가입",
    description: "카카오 로그인 정보를 통해 유저를 DB에 추가한다.",
  })
  @ApiCreatedResponse({ type: UserResponseDto, description: "회원가입 성공" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userInfo = await this.usersService.createUser(createUserDto);
    // return new UserResponseDto(userInfo);
  }

  @Get("me")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "본인 정보 조회",
    description: "본인의 유저 정보를 조회한다.",
  })
  @ApiOkResponse({ type: UserResponseDto, description: "본인 정보 조회 성공" })
  @ApiUnauthorizedResponse({ description: "인증 실패 (유효한 토큰이 아니거나 토큰 없음)" })
  @ApiNotFoundResponse({ description: "유저 없음" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async getMe(@CurrentUser() user: User) {
    const myInfo = await this.usersService.getMe(user);
    return new UserResponseDto(myInfo);
  }

  @Patch("me")
  async updateMe(@Body() updateUserDto: UpdateUserDto) {
    const updatedMyInfo = await this.usersService.updateMe(updateUserDto);
    // return new UserResponseDto(updatedMyInfo);
  }

  @Delete("me")
  async deleteMe() {
    const res = await this.usersService.deleteMe();
    return res;
  }
}
