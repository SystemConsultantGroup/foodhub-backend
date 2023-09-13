import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Payload } from "src/common/dtos/user.payload";
import { PrismaService } from "src/config/database/prisma.service";
import { CreateGroupDto } from "./dtos/create-group.dto";
import { CreateInvitationDto } from "./dtos/create-invitation.dto";
import { CreateRegistrationDto } from "./dtos/create-registration.dto";
import { PatchMyRegistrationDto } from "./dtos/patch-my-registration.dto";
import { PatchRegistrationDto } from "./dtos/patch-registration.dto";
import { PatchInvitationDto } from "./dtos/patch-invitation.dto";
import { PatchGroupDto } from "./dtos/patch-group.dto";
import { randomBytes } from "crypto";
import { genSalt, hash, compare } from "bcrypt";

@Injectable()
export class GroupsService {
  constructor(private readonly prismaService: PrismaService) {}

  async hash(password: string) {
    if (!password) return null;
    const saltRound = 10;
    const salt = await genSalt(saltRound);
    return await hash(password, salt);
  }

  async createGroup(createGroupDto: CreateGroupDto, oauthId: string) {
    const { name, type, areaId, isPublic, password, nickname } = createGroupDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");
    const hashedPassword = await this.hash(password);

    try {
      const group = await this.prismaService.group.create({
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

      const registration = await this.prismaService.registration.create({
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
  }

  async patchGroup(groupId: bigint, patchGroupDto: PatchGroupDto, oauthId: string) {
    const { name, type, areaId, isPublic, password } = patchGroupDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });
    if (!group) throw new NotFoundException("그룹이 존재하지 않습니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        user: {
          oauthId,
          deletedAt: null,
        },
        authority: 1,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 소유자만 그룹 정보 수정이 가능합니다");

    try {
      return await this.prismaService.group.update({
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
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getGroup(groupId: bigint) {
    const group = await this.prismaService.group.findUnique({
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
  }

  async createRegistration(
    groupId: bigint,
    createRegistrationDto: CreateRegistrationDto,
    oauthId: string
  ) {
    const { password } = createRegistrationDto;
    const hashedPassword = await this.hash(password);

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });

    if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");
    if (!(await compare(group.password, hashedPassword)))
      throw new UnauthorizedException("그룹 가입 비밀번호가 일치하지 않습니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId,
        deletedAt: null,
      },
    });

    if (registration) throw new BadRequestException("이미 가입한 그룹입니다");

    try {
      return await this.prismaService.registration.create({
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
  }

  async patchMyRegistration(
    groupId: bigint,
    patchMyRegistrationDto: PatchMyRegistrationDto,
    oauthId: string
  ) {
    const { nickname } = patchMyRegistrationDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId,
        deletedAt: null,
      },
    });

    if (!registration) throw new NotFoundException("가입 정보가 존재하지 않습니다");

    try {
      return await this.prismaService.registration.update({
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
  }

  async getRegistration(groupId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });
    if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId,
        deletedAt: null,
      },
    });

    if (!registration) throw new ForbiddenException("그룹 멤버가 아닙니다");

    try {
      return await this.prismaService.registration.findMany({
        where: {
          groupId,
          deletedAt: null,
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
  }

  async patchRegistration(
    groupId: bigint,
    userId: bigint,
    patchRegistrationDto: PatchRegistrationDto,
    oauthId: string
  ) {
    const { authority } = patchRegistrationDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId,
        authority: 1,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 소유자만 수정이 가능합니다");

    const registrationToPatch = await this.prismaService.registration.findFirst({
      where: {
        userId,
        groupId,
        deletedAt: null,
      },
    });
    if (!registrationToPatch) throw new NotFoundException("가입 정보가 존재하지 않습니다");
    try {
      return await this.prismaService.registration.update({
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
  }

  async deleteRegistration(groupId: bigint, userId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const registration = await this.prismaService.registration.findFirst({
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

    const registrationToDelete = await this.prismaService.registration.findFirst({
      where: {
        userId,
        groupId,
        deletedAt: null,
      },
    });
    if (!registrationToDelete) throw new NotFoundException("가입 정보가 존재하지 않습니다");
    try {
      return await this.prismaService.registration.update({
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
  }

  async createInvitation(
    groupId: bigint,
    createInvitationDto: CreateInvitationDto,
    oauthId: string
  ) {
    const { expireAt, limitNumber } = createInvitationDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });
    if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

    const registration = await this.prismaService.registration.findFirst({
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
      return await this.prismaService.invitation.create({
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
  }

  async getInvitation(groupId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });
    if (!group) throw new NotFoundException("존재하지 않는 그룹입니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 멤버만 조회가 가능합니다");

    try {
      return await this.prismaService.invitation.findMany({
        where: {
          groupId,
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
  }

  async patchInvitation(
    invitationId: bigint,
    patchInvitationDto: PatchInvitationDto,
    oauthId: string
  ) {
    const { expireAt, limitNumber } = patchInvitationDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        id: invitationId,
        deletedAt: null,
      },
      include: {
        group: true,
      },
    });
    if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");

    const registration = await this.prismaService.registration.findFirst({
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
      return await this.prismaService.invitation.update({
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
  }

  async deleteInvitation(invitationId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        id: invitationId,
        deletedAt: null,
      },
      include: {
        group: true,
      },
    });
    if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId: invitation.group.id,
        authority: 1,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 소유자만 삭제가 가능합니다");

    try {
      return await this.prismaService.invitation.update({
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
  }

  async useInvitation(link: string, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const invitation = await this.prismaService.invitation.findFirst({
      where: {
        link,
        deletedAt: null,
      },
      include: {
        group: true,
      },
    });
    if (!invitation) throw new NotFoundException("존재하지 않는 초대입니다");
    if (invitation.limitNumber <= invitation.useNumber)
      throw new NotFoundException("존재하지 않는 초대입니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId: invitation.group.id,
        deletedAt: null,
      },
    });
    if (registration) throw new ForbiddenException("이미 가입한 그룹입니다");

    try {
      return await this.prismaService.invitation.update({
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
  }
}
