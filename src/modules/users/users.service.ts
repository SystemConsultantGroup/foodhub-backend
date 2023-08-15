import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  /**
   * @TODO: prismaService 추가 (DB 접근 로직 추가 시)
   */
  constructor() {
    console.log("need PrismaService");
  }

  async createUser() {
    return "createUser";
  }

  async getMe() {
    return "getMe";
  }

  async updateMe() {
    return "updateMe";
  }

  async deleteMe() {
    return "deleteMe";
  }
}
