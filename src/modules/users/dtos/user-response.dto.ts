import { File, User } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  constructor(user: Partial<User> & { file?: Partial<File> }) {
    this.id = Number(user.id);
    this.nickname = user.nickname;
    this.defaultPhotoId = user.defaultPhotoId;
    this.file = user.file;
    this.birthYear = user.birthYear;
    this.isActivated = user.isActivated;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  @ApiProperty()
  id: number;
  @ApiProperty({ required: false })
  email?: string;
  @ApiProperty()
  nickname: string;
  @ApiProperty()
  defaultPhotoId: number;
  @ApiProperty({ required: false })
  file?: Partial<File>;
  @ApiProperty({ required: false })
  birthYear?: Date;
  @ApiProperty()
  isActivated: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({ required: false })
  updatedAt?: Date;
}
