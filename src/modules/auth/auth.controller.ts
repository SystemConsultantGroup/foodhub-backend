import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get("kakao/login")
  @ApiOperation({ summary: "카카오 로그인 접근 API " })
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
    console.log(token);
    const user = await this.authService.isUserExist(token);
    const FE_BASEURL = this.configService.get("fe.baseUrl");
    res.set("Location", user ? FE_BASEURL : `${FE_BASEURL}/register`);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.status(302).send();
  }

  @Get("kakao/logout")
  @ApiOperation({ summary: "카카오 로그아웃 접근 API " })
  async kakaoLogout(@Res() res: Response) {
    const clientID = this.configService.get("kakao.clientID");
    const callbackURI = this.configService.get("kakao.logoutRedirectURI");
    const redirectURI = `https://kauth.kakao.com/oauth/logout?client_id=${clientID}&logout_redirect_uri=${callbackURI}`;
    res.set("Location", redirectURI);
    res.status(302).send();
  }

  @Get("kakao/logout/redirect")
  @ApiOperation({ summary: "카카오 로그아웃 Redirect" })
  async kakaoLogoutredirect(@Query("state") state: string, @Res() res: Response) {
    const FE_BASEURL = this.configService.get("fe.baseUrl");
    res.set("Location", FE_BASEURL);
    res.clearCookie("token", { httpOnly: true });
    res.status(302).send();
  }
}
