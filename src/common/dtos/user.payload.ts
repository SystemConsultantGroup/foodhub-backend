import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class Payload {
  @ApiProperty({ description: "유저 id" })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: "유저 이메일" })
  @IsString()
  email: string;
}
