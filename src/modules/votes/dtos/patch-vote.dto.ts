import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  IsPositive,
  IsOptional,
} from "class-validator";

export class PatchVoteDto {
  @ApiProperty({ description: "투표 이름" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  //@MaxLength()
  @IsOptional()
  name: string;

  @ApiProperty({ description: "중복 투표 가능 여부" })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDuplicatable: boolean;

  @ApiProperty({ description: "익명 투표 여부" })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isSecret: boolean;

  @ApiProperty({ description: "투표 항목 추가 가능 여부" })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isAppendable: boolean;

  @ApiProperty({ description: "임시저장본 여부" })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDraft: boolean;
}
