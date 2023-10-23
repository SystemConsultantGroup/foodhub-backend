import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { PageQueryDto } from "src/common/dtos/page-query.dto";

export class GetRestaurantsQueryDto extends PageQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(["latest", "topRated"])
  @ApiProperty({ description: "정렬 기준", required: false, enum: ["latest", "topRated"] })
  sort?: string;
}
