import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/patch-review.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":restaurantId")
  createReview(@Param("restaurantId") id: number, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get(":restuarantId")
  getAllReviews(@Param("restaurantId") id: number) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(":reviewId")
  updateReview(@Param("reviewId") id: number, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(":reviewId")
  deleteReview(@Param("reviewId") id: number) {
    return this.reviewsService.remove(+id);
  }
}
