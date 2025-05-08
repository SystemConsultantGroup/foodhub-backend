import { EmdAreaDto } from "./emd-area.dto";

export class GroupDto {
  id: string;
  name: string;
  type: number;
  area: EmdAreaDto;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(group) {
    this.id = group.id.toString();
    this.name = group.name;
    this.type = group.type;
    this.area = new EmdAreaDto(group.area);
    this.isPublic = group.isPublic;
    this.createdAt = group.createdAt;
    this.updatedAt = group.updatedAt;
    this.deletedAt = group.deletedAt;
  }
}

// export class GroupDtoBuilder {

//     id: string;
//     name: string;
//     type: number;
//     area: EmdAreaDto;
//     isPublic: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//     deletedAt: Date;

//     build() {
//         return new GroupDto(
//             this.id,
//             this.name,
//             this.type,
//             this.area,
//             this.isPublic,
//             this.createdAt,
//             this.updatedAt,
//             this.deletedAt
//         )
//     }
// }
