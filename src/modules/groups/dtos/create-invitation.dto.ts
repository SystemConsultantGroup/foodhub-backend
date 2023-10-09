import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsOptional, Min, MinDate } from "class-validator";
import { Type } from "class-transformer";

export class CreateInvitationDto {
  @ApiProperty({ description: "유효기간" })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date())
  expireAt: Date;

  @ApiProperty({ description: "유효횟수" })
  @IsOptional()
  @IsInt()
  @Min(0)
  limitNumber: number;
}
