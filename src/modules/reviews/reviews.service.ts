import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { Registration, Restaurant, Review, User } from "@prisma/client";
import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createReview(restaurantId: string, user: User, createReviewDto: CreateReviewDto) {
    const { score, content } = createReviewDto;
    // 해당 restaurantId (string) 을 가진 맛집 존재 여부 확인
    // 어떤 restaurant 에 Review 를 쓸 때 해당 유저가 해당 restaurant 가 속해있는 그룹에 속해 있는 지 확인해야 함
    return this.prismaService.$transaction(async (tx) => {
      const restuarant: Restaurant = await tx.restaurant.findUnique({
        where: {
          id: restaurantId,
          deletedAt: null,
        },
      });
      if (!restuarant) {
        throw new BadRequestException("존재하지 않는 맛집");
      }
      const registration: Registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: restuarant.groupId,
          deletedAt: null,
        },
      });
      if (!registration) {
        throw new UnauthorizedException("권한 없음");
      }
      return tx.review.create({
        data: {
          score: score,
          content: content,
          userId: user.id,
          restaurantId: restaurantId,
        },
      });
    });
  }
  // 해당 그룹에 속해 있는 지 확인 필요
  async readAllReviews(restaurantId: string, user: User) {
    return this.prismaService.$transaction(async (tx) => {
      const restuarant: Restaurant = await tx.restaurant.findUnique({
        where: {
          id: restaurantId,
          deletedAt: null,
        },
      });
      if (!restuarant) {
        throw new BadRequestException("존재하지 않는 맛집");
      }
      const registration: Registration = await tx.registration.findFirst({
        where: {
          userId: user.id,
          groupId: restuarant.groupId,
          deletedAt: null,
        },
      });
      if (!registration) {
        throw new UnauthorizedException("권한 없음");
      }

      const stat = await tx.review.groupBy({
        by: "score",
        _count: {
          score: true,
        },
      });
    });
  }

  async updateReview(reviewId: number, user: User, updateReviewDto: UpdateReviewDto) {
    const { score, content } = updateReviewDto;

    return this.prismaService.$transaction(async (tx) => {
      const review: Review = await tx.review.findFirst({
        where: {
          id: reviewId,
          deletedAt: null,
        },
      });
      if (!review) {
        throw new BadRequestException("존재하지 않는 리뷰");
      }
      if (review.userId !== user.id) {
        throw new UnauthorizedException("권한이 없음");
      }
      return await tx.review.update({
        where: {
          id: reviewId,
          deletedAt: null,
        },
        data: {
          score: score,
          content: content,
        },
      });
    });
  }

  async deleteReview(reviewId: number, user: User) {
    this.prismaService.$transaction(async (tx) => {
      const review: Review = await tx.review.findFirst({
        where: {
          id: reviewId,
          deletedAt: null,
        },
      });
      if (!review) {
        throw new BadRequestException("존재하지 않는 리뷰");
      }
      if (review.userId !== user.id) {
        throw new UnauthorizedException("권한이 없음");
      }
      return await tx.review.update({
        where: {
          id: reviewId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(Date.now()),
        },
      });
    });
    return true;
  }
}
