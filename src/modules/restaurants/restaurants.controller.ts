import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
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
  @ApiOperation({
    summary: "맛집 상세 정보 조회 API",
    description: "Restaurant ID에 해당하는 맛집의 상세 정보를 조회한다.",
  })
  @ApiOkResponse({ type: RestaurantDto, description: "맛집 상세 정보 조회 성공" })
  @ApiInternalServerErrorResponse({ description: "서버 내부 오류" })
  async getRestaurant(
    @Param("restaurantId", new ParseUUIDPipe()) restaurantId: string,
    @CurrentUser() user: User | undefined
  ) {
    const restaurantInfo = await this.restaurantsService.getRestaurant(restaurantId, user);
    return new RestaurantDto(restaurantInfo);
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
