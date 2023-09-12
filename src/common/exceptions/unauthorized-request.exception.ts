import { HttpException, HttpStatus } from "@nestjs/common";

export class UnauthorizedException extends HttpException {
  constructor(code: AuthExceptionType) {
    super(types[code], HttpStatus.UNAUTHORIZED);
  }
}

const types = {
  AU005: {
    code: "AU005",
    message: "Expired Token",
  },
  AU006: {
    code: "AU006",
    message: "Not Logged in",
  },
  AU007: {
    code: "AU007",
    message: "Not Signed up",
  },
  AU008: {
    code: "AU008",
    message: "No Authorization",
  },
};

type AuthExceptionType = keyof typeof types;
