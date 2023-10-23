import { ApiProperty } from "@nestjs/swagger";
import { Category, Restaurant, RestaurantTagA, Tag } from "@prisma/client";

export class RestaurantResponseDto {
  constructor(
    restaurant: Restaurant & {
      category: Category;
      Files?: Partial<File>[];
      RestaurantTagAs: (Partial<RestaurantTagA> & { tag: Tag })[];
    }
  ) {
    this.id = restaurant.id;
    this.category = restaurant.category;
    this.files = restaurant.Files;
    this.tags = restaurant.RestaurantTagAs.map((restaurantTagA) => restaurantTagA.tag);
    this.userId = restaurant.userId.toString();
    this.groupId = restaurant.groupId.toString();
    this.name = restaurant.name;
    this.address = restaurant.address;
    this.link = restaurant.link;
    this.delivery = restaurant.delivery;
    this.comment = restaurant.comment;
    this.capacity = restaurant.capacity;
    this.openingHour = restaurant.openingHour;
    this.recommendedMenu = restaurant.recommendedMenu;
    this.orderTip = restaurant.orderTip;
    this.isActivated = restaurant.isActivated;
    this.isPublic = restaurant.isPublic;
    this.createdAt = restaurant.createdAt;
    this.updatedAt = restaurant.updatedAt;
    this.deletedAt = restaurant.deletedAt;
  }

  @ApiProperty()
  id: string;
  @ApiProperty()
  category: Category;
  @ApiProperty()
  files?: Partial<File>[];
  @ApiProperty()
  tags: Tag[];
  @ApiProperty()
  userId: string;
  @ApiProperty()
  groupId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false })
  address?: string;
  @ApiProperty({ required: false })
  link?: string;
  @ApiProperty({ required: false })
  delivery?: boolean;
  @ApiProperty({ required: false })
  comment?: string;
  @ApiProperty({ required: false })
  capacity?: number;
  @ApiProperty({ required: false })
  openingHour?: string;
  @ApiProperty({ required: false })
  recommendedMenu?: string;
  @ApiProperty({ required: false })
  orderTip?: string;
  @ApiProperty()
  isActivated: boolean;
  @ApiProperty()
  isPublic: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({ required: false })
  updatedAt?: Date;
  @ApiProperty({ required: false })
  deletedAt?: Date;
}
