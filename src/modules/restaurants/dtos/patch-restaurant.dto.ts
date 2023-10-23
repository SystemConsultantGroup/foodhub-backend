import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
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

export class PatchRestaurantDto {
  @ApiPropertyOptional({ description: "맛집 이름" })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "맛집 공개 여부" })
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: "카테고리 id", example: 1 })
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @ApiPropertyOptional({ description: "태그 id 배열", example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({ description: "위치 정보" })
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "관련 링크" })
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: "배달 가능 여부" })
  @IsBoolean()
  delivery?: boolean;

  @ApiPropertyOptional({ description: "한줄평" })
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: "수용 인원", example: 30 })
  @IsInt()
  @IsPositive()
  capacity?: number;

  @ApiPropertyOptional({ description: "운영 시간 정보" })
  @IsString()
  openingHour?: string;

  @ApiPropertyOptional({ description: "추천 메뉴" })
  @IsString()
  recommendedMenu?: string;

  @ApiPropertyOptional({ description: "주문 팁" })
  @IsString()
  orderTip?: string;

  @ApiPropertyOptional({
    description: "맛집 사진 UUID 배열",
    example: [{ uuid: "11111111-1111-1111-1111-111111111111" }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => File)
  files?: File[];
}
