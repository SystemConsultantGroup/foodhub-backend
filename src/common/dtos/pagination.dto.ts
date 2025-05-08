import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
  @ApiProperty({ description: "커서 id" })
  @Transform((val) => BigInt(val.value))
  @IsOptional()
  lastId: bigint;

  @ApiProperty({ description: "페이지 사이즈" })
  @Transform((val) => parseInt(val.value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  pageSize: number;
}
