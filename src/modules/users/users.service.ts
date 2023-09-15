import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "src/modules/users/dtos/update-user.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const res: Partial<User> & { file?: Partial<File> } = {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: createUserDto.nickname,
      defaultPhotoId: 1,
      birthYear: 2003,
      gender: 1,
      isActivated: true,
      file: {},
      createdAt: new Date("2023-01-01T10:00:00.000Z"),
      updatedAt: new Date("2023-01-10T10:00:00.000Z"),
      deletedAt: null,
    };
    return res;
  }

  async getMe(user: User) {
    const me = await this.prisma.user.findUnique({
      where: { oauthId: user.oauthId },
      include: {
        Files: {
          select: {
            uuid: true,
            name: true,
            mimeType: true,
            size: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    console.log(me);
    return me;
  }

  async updateMe(updateUserDto: UpdateUserDto) {
    const res: Partial<User> & { file?: Partial<File> } = {
      id: BigInt(1),
      email: "sample@email.com",
      password: "password123",
      nickname: "nickname123",
      defaultPhotoId: 1,
      birthYear: 2003,
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
