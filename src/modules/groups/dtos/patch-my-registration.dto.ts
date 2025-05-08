import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PatchMyRegistrationDto {
  @ApiProperty({ description: "닉네임" })
  @IsNotEmpty()
  @IsString()
  nickname: string;
}
