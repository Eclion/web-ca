export default class Rule {
  id: number;

  constructor(args: Rule = {} as Rule) {
    const { id = 0 } = args;

    this.id = id;
  }

  static get operators() {
    return ["==", ">", ">=", "<", "<="];
  }
}
