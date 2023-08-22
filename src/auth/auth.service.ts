import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/config/database/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UserProvider } from 'src/common/enums/user-provider.enum';
import axios from 'axios';


@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService,
              private readonly prismaService: PrismaService,
              private readonly jwtService: JwtService,
              ) {}

  private async createKakaoUser(kakaoID: number) {
    await this.prismaService.user.create({
      data: {
        provider: UserProvider.KAKAO,
        oauthId: kakaoID,
        email: "temp",
        nickname: "temp",
        defaultPhotoId: 3,
        isActivated: false,
      }
    })
  }

  async kakaoLogin(kakaoID: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        oauthId: kakaoID,
      },
    });

    if (!user) {
      await this.createKakaoUser(kakaoID);
      throw new UnauthorizedException("서비스 내 회원가입이 완료되지 않은 유저입니다");
    }
    


    return this.jwtService.sign({
      id: Number(user.id),
      provider: user.provider,
    });
  }

  async getKakaoIdToken(code: string) {
    const kakaoGetTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.configService.get('kakao.clientID'),
      redirect_uri: this.configService.get('kakao.callbackURI'),
      code: code,
    })
    try {
      const response = await axios.post(
        kakaoGetTokenUrl, body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      );
      return response.data.id_token;
    } catch(error) {
      throw new BadRequestException("카카오 인가코드 인증에 실패하였습니다");
    }
  }

  async getKakaoUserInfo(idToken: string) {
    const kakaoTokenInfoUrl = 'https://kauth.kakao.com/oauth/tokeninfo';
    const body = new URLSearchParams({
      id_token: idToken
    })
    try {
      const response = await axios.post(
        kakaoTokenInfoUrl, body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      );
      return response.data.sub;
    } catch(error) {
      throw new BadRequestException("잘못된 토큰 정보 입니다");
    }
  }
}
