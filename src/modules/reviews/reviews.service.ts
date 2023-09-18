import { Injectable } from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/patch-review.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createReview(restaurantId: number, user: User, createReviewDto: CreateReviewDto) {
    return "This action adds a new review";
  }

  async readAllReviews(restaurantId: number, user: User) {
    return `This action returns all reviews`;
  }

  async updateReview(reviewId: number, user: User, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${reviewId} review`;
  }

  async deleteReview(reviewId: number, user: User) {
    return `This action removes a #${reviewId} review`;
  }
}
