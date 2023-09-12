import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ description: "리뷰 점수" })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({ description: "리뷰 내용" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;
}
