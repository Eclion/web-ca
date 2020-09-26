import {
  JsonProperty,
  Serializable,
  serialize,
  deserialize
} from "typescript-json-serializer";
import CellType from "./CellType";
import Rule from "./Rule";

@Serializable()
export default class WorkerMessage {
  @JsonProperty() action: string;
  @JsonProperty() dishDimensions: {
    width: number;
    height: number;
    depth: number;
  };
  @JsonProperty({ type: CellType }) cellTypes: Array<CellType>;
  @JsonProperty({ type: Rule }) rules: Array<Rule>;

  constructor(args: WorkerMessage = {} as WorkerMessage) {
    const {
      action = "",
      dishDimensions = { width: -1, height: -1, depth: -1 },
      cellTypes = [],
      rules = []
    } = args;

    this.action = action;
    this.dishDimensions = dishDimensions;
    this.cellTypes = cellTypes;
    this.rules = rules;
  }

  toJSON(): string {
    const object = serialize(this);
    return JSON.stringify(object);
  }

  static fromJSON(jsonString: string): WorkerMessage {
    const object = JSON.parse(jsonString);
    return deserialize<WorkerMessage>(object, WorkerMessage);
  }
}
