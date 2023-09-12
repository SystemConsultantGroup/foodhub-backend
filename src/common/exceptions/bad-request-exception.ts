import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequestException extends HttpException {
  constructor(code: AuthExceptionType) {
    super(types[code], HttpStatus.BAD_REQUEST);
  }
}

const types = {
  AU001: {
    code: "AU001",
    message: "Invalid Authorization Code",
  },
  AU002: {
    code: "AU002",
    message: "No Token in Request Cookie",
  },
  AU003: {
    code: "AU003",
    message: "Expired Token",
  },
  AU004: {
    code: "AU004",
    message: "Invalid Token",
  },
};

type AuthExceptionType = keyof typeof types;
