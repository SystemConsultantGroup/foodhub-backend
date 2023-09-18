import { VoteDto } from "./vote.dto";
import { VoteItemUserADto } from "./vote-item-user-a.dto";

export class VoteItemDto {
  id: string;
  restaurantName: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  voteItemUserAs: VoteItemUserADto[];
  vote: VoteDto;
  //restaurant: RestaurantDto;

  constructor(voteItem) {
    this.id = voteItem.id.toString();
    this.restaurantName = voteItem.restaurantName;
    this.score = voteItem.score;
    this.createdAt = voteItem.createdAt;
    this.updatedAt = voteItem.updatedAt;
    this.deletedAt = voteItem.deletedAt;
    if (voteItem.voteItemUserAs)
      this.voteItemUserAs = voteItem.voteItemUserAs.map(
        (voteItemUserA) => new VoteItemUserADto(voteItemUserA)
      );
    if (voteItem.vote) this.vote = new VoteDto(voteItem.vote);
  }
}
