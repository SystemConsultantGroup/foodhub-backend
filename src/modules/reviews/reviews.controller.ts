import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/patch-review.dto";
import { ApiInternalServerErrorResponse, ApiOperation } from "@nestjs/swagger";
import { Oauth2Guard } from "../auth/guards/oauth2.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":restaurantId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 생성",
    description: "해당 맛집에 리뷰를 추가",
  })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  createReview(
    @Param("restaurantId") id: number,
    @CurrentUser() user: User,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.createReview(id, user, createReviewDto);
  }

  @Get(":restuarantId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 조회",
    description: "해당 맛집의 리뷰들을 조회",
  })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  getAllReviews(@Param("restaurantId") id: number, @CurrentUser() user: User) {
    return this.reviewsService.readAllReviews(id, user);
  }

  @Patch(":reviewId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 수정",
    description: "본인이 작성한 리뷰 수정",
  })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  updateReview(
    @Param("reviewId") id: number,
    @CurrentUser() user: User,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.updateReview(id, user, updateReviewDto);
  }

  @Delete(":reviewId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 삭제",
    description: "본인이 작성한 리뷰 삭제",
  })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  deleteReview(@Param("reviewId") id: number, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(id, user);
  }
}
