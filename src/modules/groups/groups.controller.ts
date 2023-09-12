import { Controller, Get, Post } from "@nestjs/common";
import { GroupsService } from "./groups.service";

@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post(":groupId/restaurants")
  createRestaurant() {
    return "Create Reestaurant";
  }

  @Get(":groupId/restaurants")
  readAllRestaurantsOfGroup() {
    return "Read All Restaurants of Group";
  }
}
