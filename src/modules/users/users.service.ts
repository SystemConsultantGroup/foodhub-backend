import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "src/modules/users/dtos/update-user.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto, user: { oauthId: string; email: string }) {
    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          oauthId: user.oauthId,
        },
      });
      if (existingUser) {
        throw new BadRequestException("이미 가입한 소셜아이디입니다.");
      }
      return tx.user.create({
        data: {
          nickname: createUserDto.nickname,
          provider: "KAKAO",
          isActivated: true,
          defaultPhotoId: Math.floor(Math.random() / 6 + 1),
          oauthId: user.oauthId,
        },
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
    });
  }

  async getMe(user: User) {
    return this.prisma.user.findUnique({
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
  }

  async updateMe(updateUserDto: UpdateUserDto, user: User) {
    return await this.prisma.$transaction(async (tx) => {
      if (updateUserDto.file) {
        await tx.file.update({
          where: { uuid: updateUserDto.file.uuid },
          data: { userId: user.id },
        });
        await tx.file.deleteMany({
          where: { userId: user.id, NOT: { uuid: updateUserDto.file.uuid } },
        });
      }
      return tx.user.update({
        where: { oauthId: user.oauthId },
        data: {
          nickname: updateUserDto.nickname,
          birthYear: updateUserDto.birthYear,
          isActivated: updateUserDto.isActivated,
        },
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
    });
  }

  async deleteMe(user: User) {
    await this.prisma.user.delete({ where: { id: user.id } });
    return true;
  }
}
