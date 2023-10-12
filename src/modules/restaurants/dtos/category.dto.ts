// Category의 Id 타입 변경으로 필요 없어짐 > 삭제 예정
import { Category } from "@prisma/client";

export class CategoryDto {
  constructor(category: Category) {
    this.id = Number(category.id);
    this.name = category.name;
  }
  /* todo
    validation pipe
    apiproperty
   **/
  id: number;
  name: string;
}
