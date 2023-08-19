import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { KakaoLoginAuthOutputDto } from "./dtos/kakao-login-auth.dto";

@Injectable()
export class AuthService {
    constructor(private readonly httpService : HttpService,
                private readonly configService: ConfigService) {}

    async kakaoLogin(req): Promise<KakaoLoginAuthOutputDto> {
        try {
            const { kakaoID, accessToken } = req.user;
            // Prisma 에서 User 여부 확인 후에 SignUp or Login 선택
            return new KakaoLoginAuthOutputDto({ 
                success : true,
                message : '카카오 로그인 인증 성공',
                accessToken : accessToken,
            });
        } catch (error) {
            console.log(error);
            return new KakaoLoginAuthOutputDto({
                success : false,
                message : '카카오 로그인 인증 실패',
            })
        }
    }
}
