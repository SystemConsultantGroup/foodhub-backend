import { GroupDto } from "./group.dto";

export class InviationDto {
  id: string;
  group: GroupDto;
  link: string;
  expireAt: Date;
  limitNumber: number;
  useNumber: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(invitation) {
    this.id = invitation.id.toString();
    this.group = new GroupDto(invitation.group);
    this.link = invitation.link;
    this.expireAt = invitation.expireAt;
    this.limitNumber = invitation.limitNumber;
    this.useNumber = invitation.useNumber;
    this.createdAt = invitation.createdAt;
    this.updatedAt = invitation.updatedAt;
    this.deletedAt = invitation.deletedAt;
  }
}
