import { Body, Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { KakaoLoginAuthOutputDto } from "./dtos/kakao-login-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("kakao")
  @UseGuards(AuthGuard('kakao')) // Kakao 로그인 테스트
  async kakaoAuthenticate(@Req() req: Request) {}

  @Get("kakao/callback") // Kakao Access Token return
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(@Req() req) : Promise<KakaoLoginAuthOutputDto>{ 
    return this.authService.kakaoLogin(req);
    
  }

}
