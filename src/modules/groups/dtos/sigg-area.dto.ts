import { SidoAreaDto } from "./sido-area.dto";

export class SiggAreaDto {
  id: string;
  name: string;
  sido: SidoAreaDto;

  constructor(siggArea) {
    this.id = siggArea.id.toString();
    this.name = siggArea.name;
    this.sido = new SidoAreaDto(siggArea.sido);
  }
}
