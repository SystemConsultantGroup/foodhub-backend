import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateGroupDto {
  @ApiProperty({ description: "단체 이름" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  @ApiProperty({ description: "단체 종류" })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(4)
  type: number;

  @ApiProperty({ description: "지역 id" })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  areaId: number;

  @ApiProperty({ description: "직접 가입 가능 여부" })
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic: boolean;

  @ApiProperty({ description: "비밀번호" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: "단체 생성자의 단체 내 닉네임" })
  @IsNotEmpty()
  @IsString()
  @MinLength(0)
  @MaxLength(100)
  nickname: string;
}
