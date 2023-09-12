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
} from "class-validator";

export class CreateVoteDto {
  @ApiProperty({ description: "투표 이름" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  //@MaxLength()
  name: string;

  @ApiProperty({ description: "중복 투표 가능 여부" })
  @IsBoolean()
  @Type(() => Boolean)
  isDuplicatable: boolean;

  @ApiProperty({ description: "익명 투표 여부" })
  @IsBoolean()
  @Type(() => Boolean)
  isSecret: boolean;

  @ApiProperty({ description: "투표 항목 추가 가능 여부" })
  @IsBoolean()
  @Type(() => Boolean)
  isAppendable: boolean;

  @ApiProperty({ description: "임시저장본 여부" })
  @IsBoolean()
  @Type(() => Boolean)
  isDraft: boolean;

  @ApiProperty({ description: "투표를 추가할 그룹 id" })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  groupId: number;
}
