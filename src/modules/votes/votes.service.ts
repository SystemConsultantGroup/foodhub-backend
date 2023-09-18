import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "src/config/database/prisma.service";
import { CreateVoteItemDto } from "./dtos/create-vote-item.dto";
import { CreateVoteDto } from "./dtos/create-vote.dto";
import { PatchVoteItemDto } from "./dtos/patch-vote-item.dto";
import { PatchVoteDto } from "./dtos/patch-vote.dto";
import { User } from "@prisma/client";

@Injectable()
export class VotesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createVote(groupId: bigint, createVoteDto: CreateVoteDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { name, isDuplicatable, isSecret, isAppendable, isDraft } = createVoteDto;

      const registration = await tx.registration.findFirst({
        where: {
          user,
          groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 생성이 가능합니다");

      try {
        return await tx.vote.create({
          data: {
            name,
            isDuplicatable,
            isSecret,
            isAppendable,
            isDraft,
            isFixed: false,
            groupId,
            userId: user.id,
          },
          include: {
            VoteItems: true,
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

  async getVotes(groupId: bigint, lastId: bigint, pageSize: number, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const registration = await tx.registration.findFirst({
        where: {
          user,
          groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 목록 조회가 가능합니다");

      return await tx.vote.findMany({
        where: {
          groupId,
          deletedAt: null,
        },
        take: pageSize ? pageSize : 10,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
        include: {
          VoteItems: true,
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
    });
  }

  async getVote(voteId: bigint, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const vote = await tx.vote.findFirst({
        where: {
          id: voteId,
          deletedAt: null,
        },
        include: {
          VoteItems: true,
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
      if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");

      const registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: vote.groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 조회가 가능합니다");

      return vote;
    });
  }

  async patchVote(voteId: bigint, patchVoteDto: PatchVoteDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { name, isDuplicatable, isSecret, isAppendable, isDraft } = patchVoteDto;

      const vote = await tx.vote.findFirst({
        where: {
          id: voteId,
          deletedAt: null,
        },
        include: {
          VoteItems: true,
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

      const registration = await tx.registration.findFirst({
        where: {
          user,
          groupId: vote.groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 수정이 가능합니다");

      if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
      if (vote.userId != user.id)
        throw new ForbiddenException("투표 제작자만 투표를 수정할 수 있습니다");
      if (vote.isFixed)
        throw new ForbiddenException("이미 참여자가 있는 투표는 수정할 수 없습니다");

      try {
        return await tx.vote.update({
          where: {
            id: voteId,
            deletedAt: null,
          },
          data: {
            ...(name && { name }),
            ...(isDuplicatable && { isDuplicatable }),
            ...(isSecret && { isSecret }),
            ...(isAppendable && { isAppendable }),
            ...(isDraft && { isDraft }),
          },
          include: {
            VoteItems: true,
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

  async deleteVote(voteId: bigint, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const vote = await tx.vote.findFirst({
        where: {
          id: voteId,
          deletedAt: null,
        },
        include: {
          VoteItems: true,
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
      if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
      if (vote.userId != user.id) {
        const registration = await tx.registration.findFirst({
          where: {
            userId: user.id,
            groupId: vote.groupId,
            authority: {
              lte: 2,
            },
          },
        });
        if (!registration)
          throw new ForbiddenException(
            "투표 제작자 혹은 그룹 관리자 이상만 투표를 삭제할 수 있습니다"
          );
      }
      if (vote.isFixed)
        throw new ForbiddenException("이미 참여자가 있는 투표는 삭제할 수 없습니다");

      try {
        return await tx.vote.update({
          where: {
            id: voteId,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(Date.now()),
          },
          include: {
            VoteItems: true,
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

  async createVoteItem(voteId: bigint, createVoteItemDto: CreateVoteItemDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { restaurantName, restaurantId } = createVoteItemDto;

      const vote = await tx.vote.findFirst({
        where: {
          id: voteId,
          deletedAt: null,
        },
      });
      if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
      if (vote.userId != user.id) {
        if (vote.isAppendable) {
          const registration = await tx.registration.findFirst({
            where: {
              userId: user.id,
              groupId: vote.groupId,
              deletedAt: null,
            },
          });
          if (!registration)
            throw new ForbiddenException("그룹 멤버만 투표 항목 생성이 가능합니다");
        } else throw new ForbiddenException("투표 제작자만 투표를 수정할 수 있습니다");
      }

      if ((!restaurantName && !restaurantId) || (restaurantName && restaurantId))
        throw new BadRequestException("식당 이름과 아이디 중 하나의 값을 가져야 합니다");

      try {
        const item = await tx.voteItem.create({
          data: {
            ...(restaurantName && { restaurantName }),
            ...(restaurantId && { restaurantId }),
            score: 0,
            voteId,
          },
        });

        if (!vote.isFixed && vote.userId != user.id) {
          await tx.vote.update({
            where: {
              id: voteId,
              deletedAt: null,
            },
            data: {
              isFixed: true,
            },
          });
        }

        return item;
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async patchVoteItem(itemId: bigint, patchVoteItemDto: PatchVoteItemDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const { restaurantName, restaurantId } = patchVoteItemDto;

      const item = await tx.voteItem.findFirst({
        where: {
          id: itemId,
          deletedAt: null,
        },
        include: {
          vote: {
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
          },
        },
      });
      const vote = item.vote;
      if (!item) throw new NotFoundException("존재하지 않는 투표 항목입니다");
      if (vote.userId != user.id)
        throw new ForbiddenException("투표 제작자만 투표를 수정할 수 있습니다");
      if (vote.isFixed)
        throw new ForbiddenException("이미 참여자가 있는 투표는 수정할 수 없습니다");
      if ((!restaurantName && !restaurantId) || (restaurantName && restaurantId))
        throw new BadRequestException("식당 이름과 아이디 중 하나의 값을 가져야 합니다");
      try {
        return await tx.voteItem.update({
          where: {
            id: itemId,
            deletedAt: null,
          },
          data: {
            ...(restaurantName && { restaurantName }),
            ...(restaurantId && { restaurantId }),
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async createVoteItemUserA(itemId: bigint, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const item = await tx.voteItem.findUnique({
        where: {
          id: itemId,
          deletedAt: null,
        },
        include: {
          vote: true,
        },
      });
      const registration = await tx.registration.findFirst({
        where: {
          user,
          groupId: item.vote.groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 참여가 가능합니다");
      if (item.vote.isDraft) throw new ForbiddenException("임시저장본에는 투표가 불가합니다");
      if (!item) throw new NotFoundException("존재하지 않는 투표항목입니다");
      const voteItemUserA = await tx.voteItemUserA.findFirst({
        where: {
          userId: user.id,
          voteItem: {
            id: itemId,
          },
        },
      });
      if (voteItemUserA) throw new ForbiddenException("이미 투표한 항목입니다");
      if (!item.vote.isDuplicatable) {
        const voteItemUserA = await tx.voteItemUserA.findFirst({
          where: {
            userId: user.id,
            voteItem: {
              voteId: item.voteId,
            },
          },
        });
        if (voteItemUserA) throw new ForbiddenException("이미 참여한 투표입니다");
      }

      try {
        await tx.vote.update({
          where: {
            id: item.vote.id,
          },
          data: {
            isFixed: true,
          },
        });

        await tx.voteItem.update({
          where: {
            id: itemId,
            deletedAt: null,
          },
          data: {
            score: item.score + 1,
          },
        });

        return await tx.voteItemUserA.create({
          data: {
            itemId,
            userId: user.id,
          },
          include: {
            voteItem: {
              include: {
                restaurant: true,
              },
            },
            user: true,
          },
        });
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    });
  }

  async getVoteItemUserAs(itemId: bigint, lastId: bigint, pageSize: number, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const item = await tx.voteItem.findUnique({
        where: {
          id: itemId,
          deletedAt: null,
        },
        include: {
          vote: true,
        },
      });
      const registration = await tx.registration.findFirst({
        where: {
          user,
          groupId: item.vote.groupId,
          deletedAt: null,
        },
      });
      if (!registration) throw new ForbiddenException("그룹 멤버만 투표 참여가 가능합니다");

      return await tx.voteItemUserA.findMany({
        where: {
          userId: user.id,
          itemId,
        },
        take: pageSize ? pageSize : 10,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
        include: {
          voteItem: {
            include: {
              restaurant: true,
            },
          },
          user: true,
        },
      });
    });
  }
}
