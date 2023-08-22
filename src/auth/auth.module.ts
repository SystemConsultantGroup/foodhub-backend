import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { KakaoStrategy } from "./strategies/kakao.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false}),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions: {expiresIn: '1d'},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KakaoStrategy],
})
export class AuthModule {}
