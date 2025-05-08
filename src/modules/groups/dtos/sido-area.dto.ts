export class SidoAreaDto {
  id: string;
  name: string;

  constructor(sidoArea) {
    this.id = sidoArea.id.toString();
    this.name = sidoArea.name;
  }
}
