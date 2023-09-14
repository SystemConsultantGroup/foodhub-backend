import { ApiProperty } from "@nestjs/swagger";
import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

class File {
  @IsString()
  @IsNotEmpty()
  uuid: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: "유저 닉네임" })
  @IsOptional()
  @IsString()
  @IsAlphanumeric()
  @Length(3, 15)
  nickname?: string;

  @ApiProperty({ description: "유저 생년" })
  @IsOptional()
  @IsDateString()
  birthYear?: string;

  @ApiProperty({ description: "유저 활성화 여부" })
  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;

  @ApiProperty({ description: "유저 프로필 사진 정보" })
  @IsOptional()
  @ValidateNested({ each: true })
  file?: File;
}
