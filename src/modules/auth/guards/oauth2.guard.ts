import { CanActivate, ExecutionContext, Injectable, mixin } from "@nestjs/common";
import { Oauth2Strategy } from "../strategies/oauth2.strategy";
import { UnauthorizedException } from "src/common/exceptions/unauthorized-request.exception";

// options.strict => 로그인 여부 확인 (특정 API 회원가입 된 유저에게 추가 정보 제공(user 정보 기반))
// options.isSignUp => 회원가입 API 확인
export const Oauth2Guard = (options?: { strict: boolean; isSignUp?: boolean }): any => {
  @Injectable()
  class Oauth2GuardMixin implements CanActivate {
    constructor(private readonly oauth2Strategy: Oauth2Strategy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest();
        const user: any = await this.oauth2Strategy.validate(request);

        // Logged in But not Signed Up
        if (!user.id || user.deletedAt) {
          if (!options.isSignUp) {
            throw new UnauthorizedException("AU007");
          }
        }

        request.user = user;
        return true;
      } catch (error) {
        // strict False
        if (!options?.strict) return true;
        if (error.response.code === "AU003") throw new UnauthorizedException("AU005");
        if (error.response.code === "AU007") throw new UnauthorizedException("AU007");
        else throw new UnauthorizedException("AU006");
      }
    }
  }
  const guard = mixin(Oauth2GuardMixin);
  return guard;
};
