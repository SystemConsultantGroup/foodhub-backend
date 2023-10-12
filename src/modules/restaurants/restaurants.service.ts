import { GetRestaurantsQueryDto } from "./dtos/get-restaurants-query.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class RestaurantsService {
  constructor(private prismaService: PrismaService) {}

  async getRestaurants(getRestaurantsQueryDto: GetRestaurantsQueryDto, user: User | undefined) {
    return this.prismaService.$transaction(async (tx) => {
      let restaurants;
      const { sort, pageNumber } = getRestaurantsQueryDto;
      const pageOffset = getRestaurantsQueryDto.getOffset();
      const pageSize = getRestaurantsQueryDto.getLimit();

      const includeQuery = {
        category: true,
        Files: {
          select: {
            uuid: true,
            name: true,
            mimeType: true,
            size: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        RestaurantTagAs: {
          select: {
            tag: true,
          },
        },
        ...(sort === "topRated" ? { Reviews: true } : {}),
      };

      let whereQuery = {};
      if (user) {
        const userGroups = await tx.registration.findMany({
          where: {
            userId: user.id,
            deletedAt: null,
          },
          select: {
            groupId: true,
          },
        });
        const groupIds = userGroups.map((registration) => registration.groupId);

        whereQuery = {
          OR: [{ isPublic: true }, { groupId: { in: groupIds } }],
          deletedAt: null,
        };
      } else {
        whereQuery = {
          isPublic: true,
          deletedAt: null,
        };
      }

      if (sort === "latest") {
        restaurants = await tx.restaurant.findMany({
          include: includeQuery,
          orderBy: { createdAt: "desc" },
          where: whereQuery,
          skip: pageOffset,
          take: pageSize,
        });
      } else if (sort === "topRated") {
        const allRestaurants = await tx.restaurant.findMany({
          include: includeQuery,
          where: whereQuery,
        });

        allRestaurants.sort((a, b) => {
          const avgScoreA = a.Reviews.length
            ? a.Reviews.reduce((acc, review) => acc + review.score, 0) / a.Reviews.length
            : 0;
          const avgScoreB = b.Reviews.length
            ? b.Reviews.reduce((acc, review) => acc + review.score, 0) / b.Reviews.length
            : 0;
          return avgScoreB - avgScoreA;
        });

        restaurants = allRestaurants.slice(pageOffset, pageOffset + pageSize);
      } else if (!sort) {
        restaurants = await tx.restaurant.findMany({
          include: includeQuery,
          where: whereQuery,
          skip: pageOffset,
          take: pageSize,
        });
      }
      if (restaurants.length === 0) throw new NotFoundException("맛집 데이터가 없습니다.");

      const totalCount = await tx.restaurant.count({ where: whereQuery });
      const totalPages = Math.ceil(totalCount / pageSize);
      if (totalPages < pageNumber)
        throw new BadRequestException("범위 밖의 페이지를 요청하였습니다.");

      return { totalCount, restaurants };
    });
  }
}
