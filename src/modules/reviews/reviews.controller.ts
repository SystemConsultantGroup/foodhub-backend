import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Oauth2Guard } from "../auth/guards/oauth2.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";
import { ReviewResponseDto } from "./dto/review-response.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":restaurantId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 생성",
    description: "해당 맛집에 리뷰를 추가",
  })
  @ApiUnauthorizedResponse({ description: "권한 없음" })
  @ApiBadRequestResponse({ description: "존재하지 않는 맛집" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async createReview(
    @Param("restaurantId", ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() createReviewDto: CreateReviewDto
  ) {
    const review = await this.reviewsService.createReview(id, user, createReviewDto);
    return new ReviewResponseDto(review);
  }

  @Get(":restuarantId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 조회",
    description: "해당 맛집의 리뷰들을 조회",
  })
  @ApiBadRequestResponse({ description: "존재하지 않는 맛집" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async getAllReviews(
    @Param("restaurantId", ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Query("pageNumber", ParseIntPipe) pageNumber: number,
    @Query("pageSize", ParseIntPipe) pageSize: number
  ) {
    const reviewList = await this.reviewsService.readAllReviews(id, user);
    return reviewList;
  }

  @Patch(":reviewId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 수정",
    description: "본인이 작성한 리뷰 수정",
  })
  @ApiUnauthorizedResponse({ description: "권한 없음" })
  @ApiBadRequestResponse({ description: "존재하지 않는 리뷰" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async updateReview(
    @Param("reviewId") id: number,
    @CurrentUser() user: User,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    const review = await this.reviewsService.updateReview(id, user, updateReviewDto);
    return new ReviewResponseDto(review);
  }

  @Delete(":reviewId")
  @UseGuards(Oauth2Guard({ strict: true }))
  @ApiOperation({
    summary: "리뷰 삭제",
    description: "본인이 작성한 리뷰 삭제",
  })
  @ApiUnauthorizedResponse({ description: "권한 없음" })
  @ApiBadRequestResponse({ description: "존재하지 않는 리뷰" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async deleteReview(@Param("reviewId") id: number, @CurrentUser() user: User) {
    await this.reviewsService.deleteReview(id, user);
  }
}
