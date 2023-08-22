import { Controller, Get, HttpStatus, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation } from "@nestjs/swagger";
import { JwtGuard } from "./guards/jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("kakao")
  @UseGuards(AuthGuard("kakao"))
  @ApiOperation({ summary: "카카오 로그인 테스트 API" })
  async kakaoAuthenticate(@Req() req: Request) {
    return "test";
  }

  @Get("kakao/callback") // Kakao Access Token return
  @ApiOperation({ summary: "카카오 로그인 callback" })
  async kakaoLogin(@Query('code') query: string, @Res() res) {
    const idToken = await this.authService.getKakaoIdToken(query);
    const kakaoID = await this.authService.getKakaoUserInfo(idToken);
    const accessToken = await this.authService.kakaoLogin(kakaoID);
    res.header('Authorization', `Bearer ${accessToken}`);
    res.status(HttpStatus.OK).send();
  }

  @Get("jwt")
  @UseGuards(JwtGuard) // JWT 로그인 테스트
  @ApiOperation({ summary: "카카오 로그인 테스트 API" })
  async temp(@Req() req: Request) {
    return "test";
  }
}
