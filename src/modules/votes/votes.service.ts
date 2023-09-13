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
import { PatchVoteDto } from "./dtos/patch-vote.dto";

@Injectable()
export class VotesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createVote(groupId: bigint, createVoteDto: CreateVoteDto, oauthId: string) {
    const { name, isDuplicatable, isSecret, isAppendable, isDraft } = createVoteDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        user,
        groupId,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 멤버만 투표 생성이 가능합니다");

    try {
      return await this.prismaService.vote.create({
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
          group: true,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getVotes(groupId: bigint, lastId: bigint, pageSize: number, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        user,
        groupId,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 멤버만 투표 목록 조회가 가능합니다");

    return await this.prismaService.vote.findMany({
      where: {
        groupId,
        deletedAt: null,
      },
      take: pageSize,
      skip: lastId ? 1 : 0,
      ...(lastId && { cursor: { id: lastId } }),
      include: {
        VoteItems: true,
        //user: true,
        group: true,
      },
    });
  }

  async getVote(voteId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const vote = await this.prismaService.vote.findFirst({
      where: {
        id: voteId,
        deletedAt: null,
      },
      include: {
        VoteItems: true,
        //user: true,
        group: true,
      },
    });
    if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");

    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId: vote.groupId,
        deletedAt: null,
      },
    });
    if (!registration) throw new ForbiddenException("그룹 멤버만 투표 조회가 가능합니다");

    return vote;
  }

  async patchVote(voteId: bigint, patchVoteDto: PatchVoteDto, oauthId: string) {
    const { name, isDuplicatable, isSecret, isAppendable, isDraft } = patchVoteDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const vote = await this.prismaService.vote.findFirst({
      where: {
        id: voteId,
        deletedAt: null,
      },
      include: {
        VoteItems: true,
        //user: true,
        group: true,
      },
    });
    if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
    if (vote.userId != user.id)
      throw new ForbiddenException("투표 제작자만 투표를 수정할 수 있습니다");
    if (vote.isFixed) throw new ForbiddenException("이미 참여자가 있는 투표는 수정할 수 없습니다");

    try {
      return await this.prismaService.vote.update({
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
          group: true,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async deleteVote(voteId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const vote = await this.prismaService.vote.findFirst({
      where: {
        id: voteId,
        deletedAt: null,
      },
      include: {
        VoteItems: true,
        //user: true,
        group: true,
      },
    });
    if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
    if (vote.userId != user.id) {
      const registration = await this.prismaService.registration.findFirst({
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
    if (vote.isFixed) throw new ForbiddenException("이미 참여자가 있는 투표는 삭제할 수 없습니다");

    try {
      return await this.prismaService.vote.update({
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
          group: true,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async createVoteItem(voteId: bigint, createVoteItemDto: CreateVoteItemDto, oauthId: string) {
    const { restaurantName, restaurantId } = createVoteItemDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const vote = await this.prismaService.vote.findFirst({
      where: {
        id: voteId,
        deletedAt: null,
      },
    });
    if (!vote) throw new NotFoundException("존재하지 않는 투표입니다");
    if (vote.isFixed)
      throw new ForbiddenException("이미 참여자가 있는 투표에는 항목을 추가할 수 없습니다");
    if (vote.userId != user.id) {
      if (!vote.isAppendable) throw new ForbiddenException("항목 추가가 가능한 투표가 아닙니다");
      else throw new ForbiddenException("투표 제작자만 투표를 수정할 수 있습니다");
    }
    if ((!restaurantName && !restaurantId) || (restaurantName && restaurantId))
      throw new BadRequestException("식당 이름과 아이디 중 하나의 값을 가져야 합니다");

    try {
      return await this.prismaService.voteItem.create({
        data: {
          ...(restaurantName && { restaurantName }),
          ...(restaurantId && { restaurantId }),
          score: 0,
          voteId,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async createVoteItemUserA(itemId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const item = await this.prismaService.voteItem.findUnique({
      where: {
        id: itemId,
        deletedAt: null,
      },
      include: {
        vote: true,
      },
    });
    if (item.vote.isDraft) throw new ForbiddenException("");
    if (!item) throw new NotFoundException("존재하지 않는 투표항목입니다");
    if (!item.vote.isAppendable && item.vote.isFixed && item.vote.userId != user.id)
      throw new ForbiddenException("투표 항목을 추가할 수 없는 투표입니다");
    if (!item.vote.isAppendable && !item.vote.isFixed)
      throw new ForbiddenException("투표 소유자만 투표 항목을 추가할 수 있습니다");
    if (!item.vote.isDuplicatable) {
      const voteItemUserA = await this.prismaService.voteItemUserA.findFirst({
        where: {
          userId: user.id,
          voteItem: {
            voteId: item.voteId,
          },
        },
        include: {
          user: true,
        },
      });
      if (voteItemUserA) throw new ForbiddenException("이미 참여한 투표입니다");
    }

    try {
      await this.prismaService.vote.update({
        where: {
          id: item.vote.id,
        },
        data: {
          isFixed: true,
        },
      });

      return await this.prismaService.voteItemUserA.create({
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
  }

  async getVoteItemUserAs(itemId: bigint, oauthId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException("Invalid Authorization");

    const voteItemUserA = await this.prismaService.voteItemUserA.findMany({
      where: {
        userId: user.id,
        itemId,
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
  }
}

/*

TODO:
그룹 멤버인지 확인 부분 다 추가하기
투표 항목 수정 api 추가
투표 항목 참여자 조회 api 추가

*/
