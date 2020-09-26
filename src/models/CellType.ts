import Distribution from "@/models/distributions/Distribution";
import RandomDistribution from "./distributions/RandomDistribution";
import {
  JsonProperty,
  Serializable,
  serialize,
  deserialize
} from "typescript-json-serializer";

const distributionPredicate = (distribution: Distribution) => {
  if (!distribution || !distribution["type"]) {
    console.error("Unable to determine the distribution type.");
    return Distribution;
  } else if (distribution["type"] === "random") {
    return RandomDistribution;
  } else {
    console.error("Unkwon distribution type: " + distribution["type"]);
    return Distribution;
  }
};

@Serializable()
export default class CellType {
  @JsonProperty() id: number;
  @JsonProperty() name: string;
  @JsonProperty() color: string;
  @JsonProperty() initialCount: number;
  @JsonProperty({ predicate: distributionPredicate })
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

  toJSON(): string {
    const object = serialize(this);
    return JSON.stringify(object);
  }

  static fromJSON(jsonString: string): CellType {
    const object = JSON.parse(jsonString);
    return deserialize<CellType>(object, CellType);
  }
}
