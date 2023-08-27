import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Oauth2Guard } from "./guards/oauth2.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get("kakao/login")
  @ApiOperation({ summary: "카카오 로그인 접근 API / Redirect " })
  @ApiResponse({ status: 302, description: "Redirect to Kakao Oauth2 Login " })
  kakaoAuthenticate(@Res() res: Response) {
    const clientID = this.configService.get("kakao.clientID");
    const callbackURI = this.configService.get("kakao.callbackURI");
    const redirectURI = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientID}&redirect_uri=${callbackURI}`;
    res.set("Location", redirectURI);
    res.status(302).send();
  }

  @Get("kakao/callback") // Kakao Access Token return in Response cookie
  @ApiOperation({ summary: "카카오 로그인 callback" })
  async kakaoLogin(@Query("code") query: string, @Res() res: Response) {
    const token = await this.authService.getKakaoIdToken(query);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.send();
  }

  @Get("test")
  @UseGuards(Oauth2Guard) // JWT 로그인 테스트
  @ApiOperation({ summary: "카카오 로그인 테스트 API" })
  async temp(@Req() req: Request) {
    return req.body.oauth2Id;
  }
}
