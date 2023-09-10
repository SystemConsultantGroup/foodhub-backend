import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRegistrationDto {
  @ApiProperty({ description: "비밀번호" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  password: string;
}
