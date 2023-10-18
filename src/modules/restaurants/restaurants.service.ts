import { GetRestaurantsQueryDto } from "./dtos/get-restaurants-query.dto";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma.service";
import { User } from "@prisma/client";
import { PageQueryDto } from "src/common/dtos/page-query.dto";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";

@Injectable()
export class RestaurantsService {
  constructor(private prismaService: PrismaService) {}

  async getRestaurants(getRestaurantsQueryDto: GetRestaurantsQueryDto, user: User | undefined) {
    let restaurants;
    const { sort } = getRestaurantsQueryDto;
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

    let whereQuery: any = { isPublic: true, deletedAt: null };
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
    const registration = await this.prismaService.registration.findFirst({
      where: {
        userId: user.id,
        groupId: restaurant.groupId,
        deletedAt: null,
      },
    });
    if (!registration) throw new UnauthorizedException("조회 권한이 없습니다.");
    return restaurant;
  }

  async getRestaurantsOfGroup(groupId: bigint, pageQueryDto: PageQueryDto, user: User | undefined) {
    const pageOffset = pageQueryDto.getOffset();
    const pageSize = pageQueryDto.getLimit();

    const group = await this.prismaService.group.findFirst({
      where: {
        id: groupId,
        deletedAt: null,
      },
    });
    if (!group) throw new BadRequestException(`존재하지 않는 그룹입니다.`);

    let whereQuery: any = {
      groupId: groupId,
      isPublic: true,
      deletedAt: null,
    };
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
      if (groupIds.includes(groupId)) {
        whereQuery = {
          groupId: groupId,
          deletedAt: null,
        };
      }
    }

    const restaurants = await this.prismaService.restaurant.findMany({
      where: whereQuery,
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
      skip: pageOffset,
      take: pageSize,
    });
    if (restaurants.length === 0)
      throw new NotFoundException(`해당 그룹의 맛집 데이터가 없습니다.`);

    const totalCount = await this.prismaService.restaurant.count({ where: whereQuery });

    return { totalCount, restaurants };
  }

  async createRestaurant(groupId: bigint, createRestaurantDto: CreateRestaurantDto, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
      const group = await tx.group.findFirst({
        where: {
          id: groupId,
          deletedAt: null,
        },
      });
      if (!group) throw new BadRequestException("존재하지 않는 그룹입니다.");

      const registration = await tx.registration.findFirst({
        where: {
          groupId: groupId,
          userId: user.id,
          deletedAt: null,
        },
      });
      if (!registration) throw new UnauthorizedException("그룹 멤버만 맛집 생성이 가능합니다.");

      let restaurant;
      const {
        name,
        isPublic,
        categoryId,
        address,
        link,
        delivery,
        comment,
        capacity,
        openingHour,
        recommendedMenu,
        orderTip,
        tagIds,
        files,
      } = createRestaurantDto;
      try {
        restaurant = await tx.restaurant.create({
          data: {
            name,
            address,
            link,
            delivery,
            comment,
            capacity,
            openingHour,
            recommendedMenu,
            orderTip,
            isPublic,
            isActivated: true,
            user: {
              connect: {
                id: user.id,
              },
            },
            group: {
              connect: {
                id: groupId,
              },
            },
            category: {
              connect: {
                id: categoryId,
              },
            },
          },
        });
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException("맛집 생성에 문제가 발생하였습니다.");
      }

      try {
        await tx.restaurantTagA.createMany({
          data: tagIds.map((tagId) => ({
            restaurantId: restaurant.id,
            tagId: tagId,
          })),
        });
      } catch (e) {
        throw new InternalServerErrorException("태그 생성에 문제가 발생했습니다.");
      }

      if (files) {
        try {
          const updateResponse = await tx.file.updateMany({
            where: {
              uuid: {
                in: files.map((file) => file.uuid),
              },
              deletedAt: null,
            },
            data: {
              restaurantId: restaurant.id,
            },
          });
          if (updateResponse.count !== files.length) {
            throw new BadRequestException("존재하지 않는 file uuid가 전달되었습니다");
          }
        } catch (e) {
          console.log(e);
          throw new InternalServerErrorException("파일 업데이트에 문제가 발생했습니다.");
        }
      }

      return tx.restaurant.findUnique({
        where: {
          id: restaurant.id,
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
    });
  }
}
