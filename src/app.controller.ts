import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { Oauth2Guard } from "./modules/auth/guards/oauth2.guard";
import { CurrentUser } from "./common/decorators/current-user.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Test API Code
  @Get("test")
  @UseGuards(Oauth2Guard({ strict: false, isSignUp: false }))
  async test(@CurrentUser() user) {
    console.log(user);
    return "this is test";
  }
}
