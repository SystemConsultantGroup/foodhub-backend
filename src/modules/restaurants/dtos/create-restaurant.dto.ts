import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

class File {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  uuid: string;
}

export class CreateRestaurantDto {
  @ApiProperty({ description: "맛집 이름" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "맛집 공개 여부" })
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ description: "카테고리 id", example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty({ description: "태그 id 배열", example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  tagIds: number[];

  @ApiProperty({ description: "위치 정보", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: "관련 링크", required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: "배달 가능 여부", required: false })
  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @ApiProperty({ description: "한줄평", required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: "수용 인원", required: false, example: 30 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  capacity?: number;

  @ApiProperty({ description: "운영 시간 정보", required: false })
  @IsOptional()
  @IsString()
  openingHour?: string;

  @ApiProperty({ description: "추천 메뉴", required: false })
  @IsOptional()
  @IsString()
  recommendedMenu?: string;

  @ApiProperty({ description: "주문 팁", required: false })
  @IsOptional()
  @IsString()
  orderTip?: string;

  @ApiProperty({
    description: "맛집 사진 UUID 배열",
    required: false,
    example: [{ uuid: "11111111-1111-1111-1111-111111111111" }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => File)
  files?: File[];
}
