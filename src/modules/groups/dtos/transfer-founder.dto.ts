import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class TransferFounderDto {
  @ApiProperty({ description: "소유자 권한을 양도할 유저 id" })
  @Transform((val) => BigInt(val.value))
  userId: bigint;
}
