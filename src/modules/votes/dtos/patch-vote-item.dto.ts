import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class PatchVoteItemDto {
  @ApiProperty({ description: "투표 항목 레스토랑 이름" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  //@MaxLength()
  @IsOptional()
  restaurantName: string;

  @ApiProperty({ description: "투표 항목 레스토랑 아이디" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  //@MaxLength()
  @IsOptional()
  restaurantId: string;
}
