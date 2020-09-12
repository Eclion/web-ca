import Distribution from "@/models/distributions/Distribution";

export default class CellType {
  id: number;
  name: string;
  color: string;
  initialCount: number;
  distribution: Distribution;

  constructor(params: CellType = {} as CellType) {
    const {
      id = 0,
      name = "empty",
      color = "#000000",
      initialCount = -1,
      distribution = null as any
    } = params;

    this.id = id;
    this.name = name;
    this.color = color;
    this.initialCount = initialCount;
    this.distribution = distribution;
  }
}
