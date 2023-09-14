import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "src/modules/users/dtos/update-user.dto";
import { User } from "@prisma/client";

@Injectable()
export class UsersService {
  /**
   * @TODO: prismaService 추가 (DB 접근 로직 추가 시)
   */
  constructor() {
    console.log("need PrismaService");
  }

  async createUser(createUserDto: CreateUserDto) {
    const res: Partial<User> & { file?: Partial<File> } = {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: createUserDto.nickname,
      defaultPhotoId: 1,
      birthYear: new Date("1990-01-01"),
      gender: 1,
      isActivated: true,
      file: {},
      createdAt: new Date("2023-01-01T10:00:00.000Z"),
      updatedAt: new Date("2023-01-10T10:00:00.000Z"),
      deletedAt: null,
    };
    return res;
  }

  async getMe() {
    const res: Partial<User> & { file?: Partial<File> } = {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: "nickname123",
      defaultPhotoId: 1,
      birthYear: new Date("1990-01-01"),
      gender: 1,
      isActivated: true,
      file: {},
      createdAt: new Date("2023-01-01T10:00:00.000Z"),
      updatedAt: new Date("2023-01-10T10:00:00.000Z"),
      deletedAt: null,
    };
    return res;
  }

  async updateMe(updateUserDto: UpdateUserDto) {
    const res: Partial<User> & { file?: Partial<File> } = {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: "nickname123",
      defaultPhotoId: 1,
      birthYear: new Date("1990-01-01"),
      gender: 1,
      isActivated: true,
      file: {},
      createdAt: new Date("2023-01-01T10:00:00.000Z"),
      updatedAt: new Date("2023-01-10T10:00:00.000Z"),
      deletedAt: null,
    };
    return { ...res, ...updateUserDto } as Partial<User> & { file?: Partial<File> };
  }

  async deleteMe() {
    return "deleteMe";
  }
}
