import { JsonProperty, Serializable } from "typescript-json-serializer";

@Serializable()
export default abstract class Distribution {
  @JsonProperty() type: string;

  constructor(type: string) {
    this.type = type;
  }

  apply(
    cells: Array<Array<Array<number>>>,
    cellId: number,
    cellCount: number
  ): Array<Array<Array<number>>> {
    return cells;
  }
}
