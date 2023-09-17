import { Controller, Get, Post, Patch, Body, Param, Query, ValidationPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { CreateGroupDto } from "./dtos/create-group.dto";
import { GroupDto } from "./dtos/group.dto";
import { GroupsService } from "./groups.service";
import { CreateRegistrationDto } from "./dtos/create-registration.dto";
import { RegistrationDto } from "./dtos/registration.dto";
import { PatchRegistrationDto } from "./dtos/patch-registration.dto";
import { Delete, UseGuards } from "@nestjs/common/decorators";
import { CreateInvitationDto } from "./dtos/create-invitation.dto";
import { InviationDto } from "./dtos/invitation.dto";
import { Oauth2Guard } from "src/modules/auth/guards/oauth2.guard";
import { CurrentOauth2User } from "src/common/decorators/current-oauth2-user.decorator";
import { ParseBigIntPipe } from "src/common/pipes/pipes";
import { PatchMyRegistrationDto } from "./dtos/patch-my-registration.dto";
import { PatchInvitationDto } from "./dtos/patch-invitation.dto";
import { PatchGroupDto } from "./dtos/patch-group.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { TransferFounderDto } from "./dtos/transfer-founder.dto";

@Controller("groups")
@ApiTags("그룹 API")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
@UseGuards(Oauth2Guard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({
    summary: "그룹 생성 API",
    description: "그룹을 생성한다.",
  })
  async createGroup(
    //@Body() withUser: WithUserDto,
    @Body() createGroupDto: CreateGroupDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const group = await this.groupsService.createGroup(createGroupDto, oauthId);
    return new GroupDto(group);
  }

  @Get(":groupId")
  @ApiOperation({
    summary: "그룹 조회 API",
    description: "그룹 정보를 조회한다.",
  })
  async getGroup(@Param("groupId", ParseBigIntPipe) groupId: bigint) {
    const group = await this.groupsService.getGroup(groupId);
    return new GroupDto(group);
  }

  @Patch(":groupId")
  @ApiOperation({
    summary: "그룹 수정 API",
    description: "그룹 정보를 수정한다.",
  })
  async patchGroup(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() patchGroupDto: PatchGroupDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const group = await this.groupsService.patchGroup(groupId, patchGroupDto, oauthId);
    return new GroupDto(group);
  }

  @Post(":groupId/users")
  @ApiOperation({
    summary: "그룹 가입 API",
    description: "그룹 가입 정보를 생성한다.",
  })
  async createRegistration(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() createRegistrationDto: CreateRegistrationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const registration = await this.groupsService.createRegistration(
      groupId,
      createRegistrationDto,
      oauthId
    );
    return new RegistrationDto(registration);
  }

  @Patch(":groupId/users")
  @ApiOperation({
    summary: "그룹 내 닉네임 설정 API",
    description: "그룹 가입 정보를 수정하여 그룹 내 닉네임을 설정한다.",
  })
  async patchMyRegistration(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() patchMyRegistrationDto: PatchMyRegistrationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const registration = await this.groupsService.patchMyRegistration(
      groupId,
      patchMyRegistrationDto,
      oauthId
    );
    return new RegistrationDto(registration);
  }

  @Get(":groupId/users")
  @ApiOperation({
    summary: "그룹 멤버 조회 API",
    description: "그룹 멤버를 조회한다.",
  })
  async getRegistration(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const { lastId, pageSize } = paginationDto;
    const registrations = await this.groupsService.getRegistrations(
      groupId,
      lastId,
      pageSize,
      oauthId
    );
    return registrations.map((registration) => new RegistrationDto(registration));
  }

  @Patch(":groupId/users/:userId")
  @ApiOperation({
    summary: "그룹 멤버 수정 API",
    description: "그룹 멤버의 권한을 수정한다.",
  })
  async patchRegistration(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Param("userId", ParseBigIntPipe) userId: bigint,
    @Body() patchRegistrationDto: PatchRegistrationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const registration = await this.groupsService.patchRegistration(
      groupId,
      userId,
      patchRegistrationDto,
      oauthId
    );
    return new RegistrationDto(registration);
  }

  @Delete(":groupId/users/:userId")
  @ApiOperation({
    summary: "그룹 멤버 삭제 API",
    description: "그룹 멤버를 삭제한다.",
  })
  async deleteRegistration(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Param("userId", ParseBigIntPipe) userId: bigint,
    @CurrentOauth2User() oauthId: string
  ) {
    const registration = await this.groupsService.deleteRegistration(groupId, userId, oauthId);
    return new RegistrationDto(registration);
  }

  @Post(":groupId/transfer")
  @ApiOperation({
    summary: "그룹 소유권 이전 API",
    description: "그룹 소유권을 다른 멤버에게 이전한다.",
  })
  async transferFounder(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() transferFounderDto: TransferFounderDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const registration = await this.groupsService.transferFounder(
      groupId,
      transferFounderDto,
      oauthId
    );
    return new RegistrationDto(registration);
  }

  @Post(":groupId/invitations")
  @ApiOperation({
    summary: "초대 링크 생성 API",
    description: "초대 링크를 생성한다.",
  })
  async createInvitation(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const invitation = await this.groupsService.createInvitation(
      groupId,
      createInvitationDto,
      oauthId
    );
    return new InviationDto(invitation);
  }

  @Get(":groupId/invitations")
  @ApiOperation({
    summary: "초대 링크 조회 API",
    description: "초대 링크를 조회한다.",
  })
  async getInvitation(
    @Param("groupId", ParseBigIntPipe) groupId: bigint,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const { lastId, pageSize } = paginationDto;
    const invitations = await this.groupsService.getInvitation(groupId, lastId, pageSize, oauthId);
    return invitations.map((invitation) => new InviationDto(invitation));
  }
}

@Controller("invitations")
@ApiTags("그룹의 초대 API")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
export class InvitationsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Patch(":invitationId")
  @ApiOperation({
    summary: "초대 링크 수정 API",
    description: "초대 링크를 수정한다.",
  })
  async patchInvitation(
    @Param("invitationId", ParseBigIntPipe) invitationId: bigint,
    @Body() patchInvitationDto: PatchInvitationDto,
    @CurrentOauth2User() oauthId: string
  ) {
    const invitation = await this.groupsService.patchInvitation(
      invitationId,
      patchInvitationDto,
      oauthId
    );
    return new InviationDto(invitation);
  }

  @Delete(":invitationId")
  @ApiOperation({
    summary: "초대 링크 삭제 API",
    description: "초대 링크를 삭제한다.",
  })
  async deleteInvitation(
    @Param("invitationId", ParseBigIntPipe) invitationId: bigint,
    @CurrentOauth2User() oauthId: string
  ) {
    const invitation = await this.groupsService.deleteInvitation(invitationId, oauthId);
    return new InviationDto(invitation);
  }

  @Post(":link")
  @ApiOperation({
    summary: "초대 사용 API",
    description: "초대 사용 횟수를 증가시킵니다.",
  })
  async useInvitation(@Param("link") link: string, @CurrentOauth2User() oauthId: string) {
    const invitation = await this.groupsService.useInvitation(link, oauthId);
    return new InviationDto(invitation);
  }
}
