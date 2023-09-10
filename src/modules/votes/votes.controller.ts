import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { Oauth2Guard } from "src/modules/auth/guards/oauth2.guard";
import { VotesService } from "./votes.service";

@Controller("votes")
@ApiTags("투표 API")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
@UseGuards(Oauth2Guard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}
}
