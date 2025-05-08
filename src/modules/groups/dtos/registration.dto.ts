import { UserDto } from "src/modules/users/dtos/user.dto";
import { GroupDto } from "./group.dto";

export class RegistrationDto {
  id: string;
  user: UserDto;
  group: GroupDto;
  nickname: string;
  authority: number;
  isActivated: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(registration) {
    this.id = registration.id.toString();
    this.user = new UserDto(registration.user);
    this.group = new GroupDto(registration.group);
    this.nickname = registration.nickname;
    this.authority = registration.authority;
    this.isActivated = registration.isActivated;
    this.createdAt = registration.createdAt;
    this.updatedAt = registration.updatedAt;
    this.deletedAt = registration.deletedAt;
  }
}
