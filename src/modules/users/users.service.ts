import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";

@Injectable()
export class UsersService {
  /**
   * @TODO: prismaService 추가 (DB 접근 로직 추가 시)
   */
  constructor() {
    console.log("need PrismaService");
  }

  async createUser(createUserDto: CreateUserDto) {
    return {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: createUserDto.nickname,
      defaultPhotoId: 1,
      userPhotoUuid: "123e4567-e89b-12d3-a456-426614174000",
      birthYear: new Date("1990-01-01"),
      gender: 1,
      isActivated: true,
      createdAt: new Date("2023-01-01T10:00:00.000Z"),
      updatedAt: new Date("2023-01-10T10:00:00.000Z"),
      deletedAt: null,
    };
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
