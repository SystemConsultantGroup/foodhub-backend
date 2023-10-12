// Tag의 Id 타입 변경으로 필요 없어짐 > 삭제 예정

import { Tag } from "@prisma/client";

export class TagDto {
  constructor(tag: Tag) {
    this.id = Number(tag.id);
    this.name = tag.name;
  }
  /* todo
    validation pipe
    apiproperty
   **/
  id: number;
  name: string;
}
