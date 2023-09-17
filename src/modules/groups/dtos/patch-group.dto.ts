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
  IsUUID,
} from "class-validator";

export class PatchGroupDto {
  @ApiProperty({ description: "단체 이름" })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsOptional()
  name: string;

  @ApiProperty({ description: "단체 종류" })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(4)
  @IsOptional()
  type: number;

  @ApiProperty({ description: "지역 id" })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  areaId: number;

  @ApiProperty({ description: "직접 가입 가능 여부" })
  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic: boolean;

  @ApiProperty({ description: "비밀번호" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: "단체 이미지 파일 uuid" })
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  fileUUID: string;
}
