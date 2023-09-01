import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentOauth2User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  return req.body.oauth2Id;
});
