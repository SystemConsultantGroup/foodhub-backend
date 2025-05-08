import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min, Max } from "class-validator";

export class PatchRegistrationDto {
  @ApiProperty({ description: "닉네임" })
  @IsInt()
  @Min(2)
  @Max(3)
  authority: number;
}
