import { User } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserResponseDto {
  constructor(user: User) {
    this.id = user.id.toString();
    this.nickname = user.nickname;
  }

  @ApiProperty()
  id: string;
  @ApiProperty()
  nickname: string;
}
