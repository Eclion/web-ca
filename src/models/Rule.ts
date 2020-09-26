import {
  JsonProperty,
  Serializable,
  serialize,
  deserialize
} from "typescript-json-serializer";

@Serializable()
export default class Rule {
  @JsonProperty() id: number;
  @JsonProperty() initialCellTypeId: number;
  @JsonProperty() nextCellTypeId: number;
  @JsonProperty() neighborCellTypeId: number;
  @JsonProperty() neighborCount: number;
  @JsonProperty() operator: string;

  constructor(args: Rule = {} as Rule) {
    const {
      id = 0,
      operator = "",
      initialCellTypeId = -1,
      nextCellTypeId = -1,
      neighborCellTypeId = -1,
      neighborCount = -1
    } = args;

    this.id = id;
    this.initialCellTypeId = initialCellTypeId;
    this.nextCellTypeId = nextCellTypeId;
    this.neighborCellTypeId = neighborCellTypeId;
    this.neighborCount = neighborCount;
    this.operator = operator;
  }

  static get operators() {
    return ["==", ">", ">=", "<", "<="];
  }

  isValid() {
    return (
      Rule.operators.includes(this.operator) &&
      this.initialCellTypeId != -1 &&
      this.nextCellTypeId != -1 &&
      this.neighborCellTypeId != -1 &&
      this.neighborCount != -1
    );
  }

  apply(cellTypeId: number, neighborCounts: Record<string, number>) {
    if (cellTypeId !== this.initialCellTypeId) return cellTypeId;

    const neighborCount = neighborCounts[this.neighborCellTypeId] | 0;

    switch (this.operator) {
      case "==":
        if (neighborCount === this.neighborCount) return this.nextCellTypeId;
        break;
      case ">":
        if (neighborCount > this.neighborCount) return this.nextCellTypeId;
        break;
      case ">=":
        if (neighborCount >= this.neighborCount) return this.nextCellTypeId;
        break;
      case "<":
        if (neighborCount < this.neighborCount) return this.nextCellTypeId;
        break;
      case "<=":
        if (neighborCount <= this.neighborCount) return this.nextCellTypeId;
        break;
    }
    return cellTypeId;
  }

  toJSON(): string {
    const object = serialize(this);
    return JSON.stringify(object);
  }

  static fromJSON(jsonString: string): Rule {
    const object = JSON.parse(jsonString);
    return deserialize<Rule>(object, Rule);
  }
}
