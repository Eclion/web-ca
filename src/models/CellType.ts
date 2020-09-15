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
      name = "Empty",
      color = "#333333",
      initialCount = -1,
      distribution = null as any
    } = params;

    this.id = id;
    this.name = name;
    this.color = color;
    this.initialCount = initialCount;
    this.distribution = distribution;
  }

  distribute(cells: Array<Array<Array<number>>>): Array<Array<Array<number>>> {
    if (this.distribution === null || this.initialCount <= 0) {
      return cells;
    }
    return this.distribution.apply(cells, this.initialCount);
  }
}
