import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/config/database/prisma.service";
import axios from "axios";

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async getKakaoIdToken(code: string) {
    const kakaoGetTokenUrl = "https://kauth.kakao.com/oauth/token";
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.configService.get("kakao.clientID"),
      redirect_uri: this.configService.get("kakao.callbackURI"),
      client_secret: this.configService.get("kakao.clientSecret"),
      code: code,
    });
    try {
      const response = await axios.post(kakaoGetTokenUrl, body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      return response.data.id_token;
    } catch (error) {
      throw new BadRequestException("카카오 인가코드 인증에 실패하였습니다");
    }
  }
}
