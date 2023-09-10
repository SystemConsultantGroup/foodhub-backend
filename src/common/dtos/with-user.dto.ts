import { Payload } from "./user.payload";
import { CreateGroupDto } from "src/modules/groups/dtos/create-group.dto";
import { CreateRegistrationDto } from "src/modules/groups/dtos/create-registration.dto";
import { PatchMyRegistrationDto } from "src/modules/groups/dtos/patch-my-registration.dto";
import { PatchRegistrationDto } from "src/modules/groups/dtos/patch-registration.dto";
import { PatchInvitationDto } from "src/modules/groups/dtos/patch-invitation.dto";
import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateInvitationDto } from "src/modules/groups/dtos/create-invitation.dto";

export class WithUserDto {
  @Type(() => CreateGroupDto)
  @ValidateNested()
  @IsOptional()
  createGroupDto: CreateGroupDto;

  @Type(() => CreateRegistrationDto)
  @ValidateNested()
  @IsOptional()
  createRegistrationDto: CreateRegistrationDto;

  @Type(() => PatchMyRegistrationDto)
  @ValidateNested()
  @IsOptional()
  patchMyRegistrationDto: PatchMyRegistrationDto;

  @Type(() => PatchRegistrationDto)
  @ValidateNested()
  @IsOptional()
  patchRegistrationDto: PatchRegistrationDto;

  @Type(() => CreateInvitationDto)
  @ValidateNested()
  @IsOptional()
  createInvitationDto: CreateInvitationDto;

  @Type(() => PatchInvitationDto)
  @ValidateNested()
  @IsOptional()
  patchInvitationDto: PatchInvitationDto;

  @Type(() => Payload)
  @ValidateNested()
  user: Payload;
}
