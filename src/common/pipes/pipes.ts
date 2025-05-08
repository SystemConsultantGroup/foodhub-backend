import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseBigIntPipe implements PipeTransform {
  async transform(value: string) {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException("형변환이 불가능한 형식입니다.");
    }
    return BigInt(value);
  }
}
