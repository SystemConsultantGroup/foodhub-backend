import { ApiProperty } from "@nestjs/swagger";
import { Review } from "@prisma/client";

export class ReviewResponseDto {
  constructor(review: Review) {
    this.id = Number(review.id);
    this.userId = Number(review.userId);
    this.restaurantId = review.restaurantId;
    this.score = review.score;
    this.content = review.content;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.deletedAt = review.deletedAt;
  }

  id: number;
  userId: number;
  restaurantId: string;
  score: number;
  @ApiProperty({ required: false })
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  @ApiProperty({ required: false })
  deletedAt?: Date;
}
