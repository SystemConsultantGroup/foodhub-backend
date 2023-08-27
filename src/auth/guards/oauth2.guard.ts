import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { Oauth2Strategy } from "../strategies/oauth2.strategy";

@Injectable()
export class Oauth2Guard implements CanActivate {
  constructor(private readonly oauth2Strategy: Oauth2Strategy) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const oauth2Id = await this.oauth2Strategy.validate(request);

    if (!oauth2Id) {
      throw new UnauthorizedException("User not authenticated");
    }
    request.body.oauth2Id = oauth2Id;
    return true;
  }
}
