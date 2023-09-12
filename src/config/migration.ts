import { PrismaService } from "./database/prisma.service";

export class Migration {
  prismaService: PrismaService = new PrismaService();

  async createUser() {
    await this.prismaService.user.create({
      data: {
        id: 1n,
        email: "mrcroc1234@gmail.com",
        password: "1234",
        nickname: "test user",
        defaultPhotoId: 1,
        isActivated: true,
      },
    });
  }

  async updateUser(oauthId) {
    await this.prismaService.user.update({
      data: {
        oauthId,
      },
      where: {
        id: 1n,
      },
    });
  }

  async createArea() {
    await this.prismaService.sidoArea.create({
      data: {
        name: "test sido",
      },
    });
    await this.prismaService.siggArea.create({
      data: {
        name: "test sigg",
        sidoId: 1n,
      },
    });
    await this.prismaService.emdArea.create({
      data: {
        name: "test emd",
        siggId: 1n,
      },
    });
  }
}
