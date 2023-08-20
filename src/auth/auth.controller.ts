import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { CommonResponseDto } from "src/common/dtos/common-response.dto";
import { ApiOperation } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("kakao")
  @UseGuards(AuthGuard("kakao")) // Kakao 로그인 테스트
  @ApiOperation({ summary: "카카오 로그인 테스트 API" })
  async kakaoAuthenticate(@Req() req: Request) {
    return "test";
  }

  @Get("kakao/callback") // Kakao Access Token return
  @UseGuards(AuthGuard("kakao"))
  @ApiOperation({ summary: "카카오 계정으로 로그인 " })
  async kakaoLogin(@Req() req) {
    const accessToken = await this.authService.kakaoLogin(req);
    if (accessToken) {
      return new CommonResponseDto({
        accessToken,
      });
    } else {
      return new CommonResponseDto({
        success: false,
        message: "Kakao Login Failed",
      });
    }
  }
}
