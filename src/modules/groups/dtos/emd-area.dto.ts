import { SidoAreaDto } from "./sido-area.dto";
import { SiggAreaDto } from "./sigg-area.dto";

export class EmdAreaDto {
  id: string;
  name: string;
  sigg: SiggAreaDto;

  constructor(area) {
    this.id = area.id.toString();
    this.name = area.name;
    this.sigg = new SiggAreaDto(area.sigg);
  }
}
