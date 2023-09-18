import { User, VoteItem } from "@prisma/client";
import { VoteItemDto } from "./vote-item.dto";

export class VoteItemUserADto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  voteItem: VoteItemDto;
  //userId: string;
  //user: UserDto;

  constructor(voteItemUserA) {
    this.id = voteItemUserA.id.toString();
    this.createdAt = voteItemUserA.createdAt;
    this.updatedAt = voteItemUserA.updatedAt;
    this.deletedAt = voteItemUserA.deletedAt;
    this.voteItem = new VoteItemDto(voteItemUserA.voteItem);
    //this.userId = voteItemUserA.userId.toString();
  }
}
