import { GetRestaurantsQueryDto } from "./dtos/get-restaurants-query.dto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class RestaurantsService {
  constructor(private prismaService: PrismaService) {}

  async getRestaurants(getRestaurantsQueryDto: GetRestaurantsQueryDto, user: User | undefined) {
    let restaurants;
    const { sort, pageNumber } = getRestaurantsQueryDto;
    const pageOffset = getRestaurantsQueryDto.getOffset();
    const pageSize = getRestaurantsQueryDto.getLimit();

    const includeQuery = {
      category: true,
      Files: {
        where: {
          deletedAt: null,
        },
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
        where: {
          deletedAt: null,
        },
        select: {
          tag: true,
        },
      },
      ...(sort === "topRated"
        ? {
            Reviews: {
              where: { deletedAt: null },
            },
          }
        : {}),
    };

    let whereQuery = {};
    if (user) {
      const userGroups = await this.prismaService.registration.findMany({
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
      restaurants = await this.prismaService.restaurant.findMany({
        include: includeQuery,
        orderBy: { createdAt: "desc" },
        where: whereQuery,
        skip: pageOffset,
        take: pageSize,
      });
    } else if (sort === "topRated") {
      const allRestaurants = await this.prismaService.restaurant.findMany({
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
      restaurants = await this.prismaService.restaurant.findMany({
        include: includeQuery,
        where: whereQuery,
        skip: pageOffset,
        take: pageSize,
      });
    }
    if (restaurants.length === 0) throw new NotFoundException("맛집 데이터가 없습니다.");

    const totalCount = await this.prismaService.restaurant.count({ where: whereQuery });
    const totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages < pageNumber)
      throw new BadRequestException("범위 밖의 페이지를 요청하였습니다.");

    return { totalCount, restaurants };
  }

  async getRestaurant(restaurantId: string, user: User | undefined) {
    const restaurant = await this.prismaService.restaurant.findUnique({
      where: {
        id: restaurantId,
        deletedAt: null,
      },
      include: {
        category: true,
        Files: {
          where: {
            deletedAt: null,
          },
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
          where: {
            deletedAt: null,
          },
          select: {
            tag: true,
          },
        },
      },
    });
    if (!restaurant) throw new NotFoundException("해당하는 맛집이 없습니다.");
    if (restaurant.isPublic) return restaurant;

    if (!user) throw new UnauthorizedException("로그인 후 이용해주세요.");
    const userGroups = await this.prismaService.registration.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      select: {
        groupId: true,
      },
    });
    const userGroupIds = userGroups.map((registration) => registration.groupId);
    if (userGroupIds.includes(restaurant.groupId)) return restaurant;
    throw new UnauthorizedException("조회 권한이 없습니다.");
  }
}
