import { GroupDto } from "src/modules/groups/dtos/group.dto";
import { VoteItemDto } from "./vote-item.dto";
import { UserDto } from "src/modules/users/dtos/user.dto";

export class VoteDto {
  id: string;
  name: string;
  isDuplicatable: boolean;
  isSecret: boolean;
  isAppendable: boolean;
  isDraft: boolean;
  isFixed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  voteItems: VoteItemDto[];
  user: UserDto;
  group: GroupDto;

  constructor(vote) {
    this.id = vote.id.toString();
    this.name = vote.name;
    this.isDuplicatable = vote.isDuplicatable;
    this.isSecret = vote.isSecret;
    this.isAppendable = vote.isAppendable;
    this.isDraft = vote.isDraft;
    this.isFixed = vote.isFixed;
    this.createdAt = vote.createdAt;
    this.updatedAt = vote.updatedAt;
    this.deletedAt = vote.deletedAt;
    if (vote.voteItems)
      this.voteItems = vote.voteItems.map((voteItem) => new VoteItemDto(voteItem));
    //this.user = new UserDto(vote.user);
    this.group = new GroupDto(vote.group);
  }
}
