import Distribution from "@/models/distributions/Distribution";
import RandomDistribution from "./distributions/RandomDistribution";

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
    if (distribution !== null && typeof distribution === "object") {
      switch (distribution.type) {
        case "random":
          this.distribution = new RandomDistribution();
          break;
        default:
          this.distribution = null as any;
          break;
      }
    } else {
      this.distribution = distribution;
    }
  }

  public distribute(
    cells: Array<Array<Array<number>>>
  ): Array<Array<Array<number>>> {
    if (this.distribution === null || this.initialCount <= 0) {
      return cells;
    }
    return this.distribution.apply(cells, this.id, this.initialCount);
  }
}
