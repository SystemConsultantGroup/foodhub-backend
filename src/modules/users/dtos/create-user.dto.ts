import { IsAlphanumeric, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: "유저 닉네임" })
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @Length(3, 15)
  nickname: string;
}
