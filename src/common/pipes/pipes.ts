import { PipeTransform, Injectable } from "@nestjs/common";

@Injectable()
export class ParseBigIntPipe implements PipeTransform {
  async transform(value: string) {
    return BigInt(value);
  }
}
