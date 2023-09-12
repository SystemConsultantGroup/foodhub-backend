import { Controller, Delete, Get, Patch } from "@nestjs/common";
import { RestaurantsService } from "./restaurants.service";

@Controller("restaurants")
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  readAllRestaurants() {
    return "Read All Restaurants";
  }

  @Get(":restaurantId")
  readSingleRestaurant() {
    return "Read Single Restuarant";
  }

  @Patch(":restaurantId")
  modifyRestaurant() {
    return "Modify Restaurant";
  }

  @Delete(":restaurantId")
  deleteRestaurant() {
    return "Delete Restaurant";
  }
}
