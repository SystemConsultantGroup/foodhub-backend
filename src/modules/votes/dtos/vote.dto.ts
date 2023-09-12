import { GroupDto } from "src/modules/groups/dtos/group.dto";
import { VoteItemDto } from "./vote-item.dto";

export class VoteDto {
  id: string;
  name: string;
  isDuplicatable: boolean;
  isSecret: boolean;
  isAppendable: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  voteItems: VoteItemDto[];
  group: GroupDto;

  constructor(vote) {
    this.id = vote.id.toString();
    this.name = vote.name;
    this.isDuplicatable = vote.isDuplicatable;
    this.isSecret = vote.isSecret;
    this.isAppendable = vote.isAppendable;
    this.isDraft = vote.isDraft;
    this.createdAt = vote.createdAt;
    this.updatedAt = vote.updatedAt;
    this.deletedAt = vote.deletedAt;
    this.voteItems = vote.voteItems.map((voteItem) => new VoteItemDto(voteItem));
    this.group = new GroupDto(vote.group);
  }
}
