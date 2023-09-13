import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { Oauth2Guard } from "src/modules/auth/guards/oauth2.guard";
import { VotesService } from "./votes.service";
import { ParseBigIntPipe } from "src/common/pipes/pipes";
import { CreateVoteDto } from "./dtos/create-vote.dto";
import { CurrentOauth2User } from "src/common/decorators/current-oauth2-user.decorator";

@Controller("groups")
@ApiTags("투표 API - 생성, 전체 조회")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
@UseGuards(Oauth2Guard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post(":groupId/votes")
  @ApiOperation({
    summary: "투표 생성 API",
    description: "그룹 내 투표를 생성합니다.",
  })
  async createVote(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() createVoteDto: CreateVoteDto,
    @CurrentOauth2User() oauthId
  ) {
    console.log("test");
  }

  @Get(":groupId/votes")
  @ApiOperation({
    summary: "투표 전체 조회 API",
    description: "그룹 내 투표 전체를 조회합니다.",
  })
  async getVotes(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Query("lastId", ParseBigIntPipe) pageNumber: bigint,
    @Query("pageSize", ParseIntPipe) pageSize: number,
    @CurrentOauth2User() oauthId
  ) {
    console.log("test");
  }
}
