export default interface Distribution {
  type: string;

  apply(
    cells: Array<Array<Array<number>>>,
    cellCount: number
  ): Array<Array<Array<number>>>;
}
