import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get("kakao.clientID"),
      clientSecret: "",
      callbackURL: configService.get("kakao.callbackURI"),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    try {
      const { _json } = profile;
      const user = {
        accessToken: accessToken,
        kakaoID: _json.id,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
