import { Controller, Delete, Get, Param, Patch, Query, Res, UseGuards } from "@nestjs/common";
import { RestaurantsService } from "./restaurants.service";
import { PageResponseDto } from "src/common/dtos/page-response.dto";
import { Oauth2Guard } from "../auth/guards/oauth2.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "@prisma/client";
import { GetRestaurantsQueryDto } from "./dtos/get-restaurants-query.dto";
import { RestaurantDto } from "./dtos/restaurant.dto";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("맛집 API")
@Controller("restaurants")
@ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @UseGuards(Oauth2Guard({ strict: false, isSignUp: false }))
  @ApiOperation({
    summary: "전체 맛집 조회 API",
    description: "공개 맛집과 소속된 단체의 맛집을 조회할 수 있다.",
  })
  @ApiOkResponse({ type: PageResponseDto, description: "전체 맛집 조회 성공" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async getRestaurants(
    @Query() getRestaurantsQueryDto: GetRestaurantsQueryDto,
    @CurrentUser() user: User | undefined
  ) {
    const { totalCount, restaurants } = await this.restaurantsService.getRestaurants(
      getRestaurantsQueryDto,
      user
    );
    const contents = restaurants.map((restaurant) => new RestaurantDto(restaurant));
    return new PageResponseDto(
      getRestaurantsQueryDto.pageNumber,
      getRestaurantsQueryDto.pageSize,
      totalCount,
      contents
    );
  }

  @Get(":restaurantId")
  @UseGuards(Oauth2Guard({ strict: false, isSignUp: false }))
  async getRestaurant(@Param() restaurantId: number, @CurrentUser() user: User | undefined) {
    return "Read Single Restuarant";
  }

  @Patch(":restaurantId")
  async patchRestaurant() {
    return "Modify Restaurant";
  }

  @Delete(":restaurantId")
  async deleteRestaurant() {
    return "Delete Restaurant";
  }
}
