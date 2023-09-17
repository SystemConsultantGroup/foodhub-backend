import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Delete,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { Oauth2Guard } from "src/modules/auth/guards/oauth2.guard";
import { VotesService } from "./votes.service";
import { ParseBigIntPipe } from "src/common/pipes/pipes";
import { CreateVoteDto } from "./dtos/create-vote.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { VoteDto } from "./dtos/vote.dto";
import { PatchVoteDto } from "./dtos/patch-vote.dto";
import { CreateVoteItemDto } from "./dtos/create-vote-item.dto";
import { VoteItemDto } from "./dtos/vote-item.dto";
import { PatchVoteItemDto } from "./dtos/patch-vote-item.dto";
import { VoteItemUserADto } from "./dtos/vote-item-user-a.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { User } from "@prisma/client";

@Controller("groups")
@ApiTags("투표 API - 생성, 전체 조회")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
export class VotesControllerGroups {
  constructor(private readonly votesService: VotesService) { }

  @Post(":groupId/votes")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 생성 API",
    description: "그룹 내 투표를 생성합니다.",
  })
  async createVote(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() createVoteDto: CreateVoteDto,
    @CurrentUser() user: User
  ) {
    const vote = await this.votesService.createVote(groupId, createVoteDto, user);
    return new VoteDto(vote);
  }

  @Get(":groupId/votes")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 전체 조회 API",
    description: "그룹 내 투표 전체를 조회합니다.",
  })
  async getVotes(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto,
    @CurrentUser() user: User
  ) {
    const { lastId, pageSize } = paginationDto;
    const votes = await this.votesService.getVotes(groupId, lastId, pageSize, user);
    return votes.map((vote) => new VoteDto(vote));
  }
}

@Controller("votes")
@UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
@ApiTags("투표 API")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
export class VotesControllerVotes {
  constructor(private readonly votesService: VotesService) { }

  @Get(":voteId")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 조회 API",
    description: "그룹 내 단일 투표를 조회합니다.",
  })
  async getVote(@Param("voteId", ParseBigIntPipe) voteId: bigint, @CurrentUser() user: User) {
    const vote = await this.votesService.getVote(voteId, user);
    return new VoteDto(vote);
  }

  @Patch(":voteId")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 수정 API",
    description: "그룹 내 단일 투표를 수정합니다.",
  })
  async patchVote(
    @Param("voteId", ParseBigIntPipe) voteId: bigint,
    @Body() patchVoteDto: PatchVoteDto,
    @CurrentUser() user: User
  ) {
    const vote = await this.votesService.patchVote(voteId, patchVoteDto, user);
    return new VoteDto(vote);
  }

  @Delete(":voteId")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 삭제 API",
    description: "그룹 내 단일 투표를 삭제합니다.",
  })
  async deleteVote(@Param("voteId", ParseBigIntPipe) voteId: bigint, @CurrentUser() user: User) {
    const vote = await this.votesService.deleteVote(voteId, user);
    return new VoteDto(vote);
  }

  @Post(":voteId/items")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 항목 생성 API",
    description: "그룹 내 투표에 투표 항목을 생성합니다.",
  })
  async createVoteItem(
    @Param("voteId", ParseBigIntPipe) voteId: bigint,
    @Body() createVoteItemDto: CreateVoteItemDto,
    @CurrentUser() user: User
  ) {
    const item = await this.votesService.createVoteItem(voteId, createVoteItemDto, user);
    return new VoteItemDto(item);
  }
}

@Controller("items")
@ApiTags("투표 API")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
@UseGuards(Oauth2Guard)
export class VotesControllerItems {
  constructor(private readonly votesService: VotesService) { }

  @Patch(":itemId")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표 항목 수정 API",
    description: "단일 투표 항목을 수정합니다.",
  })
  async patchVoteItem(
    @Param("itemId", ParseBigIntPipe) itemId: bigint,
    @Body() patchVoteItemDto: PatchVoteItemDto,
    @CurrentUser() user: User
  ) {
    const item = await this.votesService.patchVoteItem(itemId, patchVoteItemDto, user);
    return new VoteItemDto(item);
  }

  @Post(":itemId/users")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표항목-사용자 생성 API",
    description: "단일 투표항목-사용자를 생성합니다.",
  })
  async createVoteItemUserA(
    @Param("itemId", ParseBigIntPipe) voteId: bigint,
    @CurrentUser() user: User
  ) {
    const voteItemUserA = await this.votesService.createVoteItemUserA(voteId, user);
    return new VoteItemUserADto(voteItemUserA);
  }

  @Get(":itemId/users")
  @UseGuards(Oauth2Guard({ strict: true, isSignUp: true }))
  @ApiOperation({
    summary: "투표항목-사용자 조회 API",
    description: "단일 투표항목-사용자를 조회합니다.",
  })
  async getVoteItemUserA(
    @Param("itemId", ParseBigIntPipe) voteId: bigint,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto,
    @CurrentUser() user: User
  ) {
    const { lastId, pageSize } = paginationDto;
    const voteItemUserA = await this.votesService.getVoteItemUserAs(
      voteId,
      lastId,
      pageSize,
      user
    );
    return voteItemUserA.map((voteItemUserA) => new VoteItemUserADto(voteItemUserA));
  }
}
