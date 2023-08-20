import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommonResponseDto } from "src/common/dtos/common-response.dto";

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async kakaoLogin(req): Promise<CommonResponseDto> {
    try {
      const { kakaoID, accessToken } = req.user;
      // Prisma 에서 User 여부 확인 후에 SignUp or Login 선택
      return accessToken;
    } catch (error) {
      return null;
    }
  }
}
