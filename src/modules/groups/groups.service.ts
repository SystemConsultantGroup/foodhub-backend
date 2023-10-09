import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma.service";
import { CreateGroupDto } from "./dtos/create-group.dto";
import { CreateInvitationDto } from "./dtos/create-invitation.dto";
import { CreateRegistrationDto } from "./dtos/create-registration.dto";
import { PatchMyRegistrationDto } from "./dtos/patch-my-registration.dto";
import { PatchRegistrationDto } from "./dtos/patch-registration.dto";
import { PatchInvitationDto } from "./dtos/patch-invitation.dto";
import { PatchGroupDto } from "./dtos/patch-group.dto";
import { TransferFounderDto } from "./dtos/transfer-founder.dto";
import { randomBytes } from "crypto";
import { genSalt, hash, compare } from "bcrypt";
import { User } from "@prisma/client";

@Injectable()
export class GroupsService {
  constructor(private readonly prismaService: PrismaService) {}

  async hash(password: string) {
    if (!password) return null;
    const saltRound = 10;
    const salt = await genSalt(saltRound);
    return await hash(password, salt);
  }

  async createGroup(createGroupDto: CreateGroupDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { name, type, areaId, isPublic, password, nickname, fileUUID } = createGroupDto;

      const hashedPassword = await this.hash(password);

      try {
        const group = await tx.group.create({
          data: {
            name,
            type,
            areaId,
            isPublic,
            password: hashedPassword,
          },
          include: {
            area: {
              include: {
                sigg: {
                  include: {
                    sido: true,
                  },
                },
              },
            },
          },
        });

        if (fileUUID) {
          const file = await tx.file.update({
            where: {
              uuid: fileUUID,
            },
            data: {
              groupId: group.id,
            },
          });
          if (!file) throw new NotFoundException("존재하지 않는 파일입니다");

          await tx.file.updateMany({
            where: {
              groupId: group.id,
            },
            data: {
              deletedAt: new Date(Date.now()),
            },
          });
        }

        await tx.registration.create({
          data: {
            userId: user.id,
            groupId: group.id,
            nickname,
            authority: 1,
            isActivated: true,
          },
        });

        return group;
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async patchGroup(groupId: bigint, patchGroupDto: PatchGroupDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { name, type, areaId, isPublic, password, fileUUID } = patchGroupDto;

      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });
      if (!group) throw new NotFoundException("그룹이 존재하지 않습니다");

      const registration = await tx.registration.findFirst({
        where: {
          user: {
            id: user.id,
            deletedAt: null,
          },
          authority: 1,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 소유자만 그룹 정보 수정이 가능합니다");

      try {
        if (fileUUID) {
          const file = await tx.file.update({
            where: {
              uuid: fileUUID,
            },
            data: {
              groupId: group.id,
            },
          });
          if (!file) throw new NotFoundException("존재하지 않는 파일입니다");

          await tx.file.updateMany({
            where: {
              groupId: group.id,
            },
            data: {
              deletedAt: new Date(Date.now()),
            },
          });
        }

        return await tx.group.update({
          where: {
            id: groupId,
            deletedAt: null,
          },
          data: {
            ...(name && { name }),
            ...(type && { type }),
            ...(areaId && { areaId }),
            ...(isPublic && { isPublic }),
            ...(password && { password }),
          },
          include: {
            area: {
              include: {
                sigg: {
                  include: {
                    sido: true,
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async getGroup(groupId: bigint) {
    return await this.prismaService.$transaction(async (tx) => {
      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
        include: {
          area: {
            include: {
              sigg: {
                include: {
                  sido: true,
                },
              },
            },
          },
        },
      });

      if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

      return group;
    });
  }

  async createRegistration(
    groupId: bigint,
    createRegistrationDto: CreateRegistrationDto,
    user: User
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      const { password } = createRegistrationDto;

      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });

      if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");
      if (!(await compare(password, group.password)))
        throw new UnauthorizedException("그룹 가입 비밀번호가 일치하지 않습니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          deletedAt: null,
        },
      });

      if (registration) throw new BadRequestException("이미 가입한 그룹입니다");

      try {
        return await tx.registration.create({
          data: {
            userId: user.id,
            groupId,
            nickname: null,
            authority: 3,
            isActivated: false,
          },
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException(e);
      }
    });
  }

  async patchMyRegistration(
    groupId: bigint,
    patchMyRegistrationDto: PatchMyRegistrationDto,
    user: User
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      const { nickname } = patchMyRegistrationDto;

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          deletedAt: null,
        },
      });

      if (!registration) throw new NotFoundException("가입 정보가 존재하지 않습니다");

      try {
        return await tx.registration.update({
          where: {
            id: registration.id,
            deletedAt: null,
          },
          data: {
            nickname,
            isActivated: true,
          },
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException(e);
      }
    });
  }

  async getRegistrations(groupId: bigint, lastId: bigint, pageSize: number, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });
      if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          deletedAt: null,
        },
      });

      if (!registration) throw new ForbiddenException("그룹 멤버가 아닙니다");

      try {
        return await tx.registration.findMany({
          where: {
            groupId,
            deletedAt: null,
          },
          take: pageSize ? pageSize : 10,
          skip: lastId ? 1 : 0,
          ...(lastId && { cursor: { id: lastId } }),
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async patchRegistration(
    groupId: bigint,
    userId: bigint,
    patchRegistrationDto: PatchRegistrationDto,
    user: User
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      const { authority } = patchRegistrationDto;

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 소유자만 수정이 가능합니다");

      const registrationToPatch = await tx.registration.findFirst({
        where: {
          userId,
          groupId,
          deletedAt: null,
        },
      });
      if (!registrationToPatch) throw new NotFoundException("가입 정보가 존재하지 않습니다");
      if (registrationToPatch.authority == 1)
        throw new ForbiddenException("그룹 소유자의 직책은 변경할 수 없습니다");

      try {
        return await tx.registration.update({
          where: {
            id: registrationToPatch.id,
            deletedAt: null,
          },
          data: {
            authority,
          },
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async deleteRegistration(groupId: bigint, userId: bigint, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration && userId != user.id)
        throw new ForbiddenException("그룹 소유자나 본인만 탈퇴 처리가 가능합니다");
      if (registration && userId == user.id)
        throw new ForbiddenException("그룹 소유자의 탈퇴 처리는 불가능합니다");

      const registrationToDelete = await tx.registration.findFirst({
        where: {
          userId,
          groupId,
          deletedAt: null,
        },
      });
      if (!registrationToDelete) throw new NotFoundException("가입 정보가 존재하지 않습니다");
      try {
        return await tx.registration.update({
          where: {
            id: registrationToDelete.id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(Date.now()),
          },
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async transferFounder(groupId: bigint, transferFounderDto: TransferFounderDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { userId } = transferFounderDto;

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration)
        throw new ForbiddenException("그룹 소유자만 소유자 권한 승계가 가능합니다");

      const registrationToPatch = await tx.registration.findFirst({
        where: {
          userId,
        },
      });
      if (!registrationToPatch)
        throw new NotFoundException("승계하고자 하는 유저가 그룹에 존재하지 않습니다");

      try {
        await tx.registration.update({
          where: {
            id: registration.id,
            deletedAt: null,
          },
          data: {
            authority: 3,
          },
        });

        return await tx.registration.update({
          where: {
            id: registrationToPatch.id,
            deletedAt: null,
          },
          data: {
            authority: 1,
          },
          include: {
            //user: true,
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async createInvitation(groupId: bigint, createInvitationDto: CreateInvitationDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { expireAt, limitNumber } = createInvitationDto;

      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });
      if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 소유자만 생성이 가능합니다");

      if (!expireAt && !limitNumber)
        throw new BadRequestException("유효기간이나 유효횟수를 설정해주세요!");

      try {
        return await tx.invitation.create({
          data: {
            link: randomBytes(20).toString("hex"),
            expireAt,
            limitNumber,
            useNumber: 0,
            groupId,
          },
          include: {
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async getInvitation(groupId: bigint, lastId: bigint, pageSize: number, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const group = await tx.group.findUnique({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });
      if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 조회가 가능합니다");

      try {
        return await tx.invitation.findMany({
          where: {
            groupId,
            deletedAt: null,
          },
          take: pageSize ? pageSize : 10,
          skip: lastId ? 1 : 0,
          ...(lastId && { cursor: { id: lastId } }),
          include: {
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async patchInvitation(invitationId: bigint, patchInvitationDto: PatchInvitationDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { expireAt, limitNumber } = patchInvitationDto;

      const invitation = await tx.invitation.findUnique({
        where: {
          id: invitationId,
          deletedAt: null,
        },
        include: {
          group: {
            include: {
              area: {
                include: {
                  sigg: {
                    include: {
                      sido: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: invitation.group.id,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 소유자만 수정이 가능합니다");
      if (!expireAt && !limitNumber)
        throw new BadRequestException("유효기간이나 유효횟수를 설정해주세요!");

      try {
        return await tx.invitation.update({
          data: {
            ...(expireAt && { expireAt }),
            ...(limitNumber && { limitNumber }),
          },
          where: {
            id: invitation.id,
            deletedAt: null,
          },
          include: {
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async deleteInvitation(invitationId: bigint, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({
        where: {
          id: invitationId,
          deletedAt: null,
        },
        include: {
          group: {
            include: {
              area: {
                include: {
                  sigg: {
                    include: {
                      sido: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: invitation.group.id,
          authority: 1,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 소유자만 삭제가 가능합니다");

      try {
        return await tx.invitation.update({
          data: {
            deletedAt: new Date(Date.now()),
          },
          where: {
            id: invitation.id,
            deletedAt: null,
          },
          include: {
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async useInvitation(link: string, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: {
          link,
          deletedAt: null,
        },
        include: {
          group: {
            include: {
              area: {
                include: {
                  sigg: {
                    include: {
                      sido: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");
      if (invitation.limitNumber <= invitation.useNumber)
        throw new NotFoundException("존재하지 않는 초대입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: invitation.group.id,
          deletedAt: null,
        },
      });
      if (registration) throw new ForbiddenException("이미 가입한 그룹입니다");

      try {
        return await tx.invitation.update({
          data: {
            useNumber: invitation.useNumber + 1,
          },
          where: {
            id: invitation.id,
            deletedAt: null,
          },
          include: {
            group: {
              include: {
                area: {
                  include: {
                    sigg: {
                      include: {
                        sido: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }
}