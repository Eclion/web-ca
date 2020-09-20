export default interface Distribution {
  type: string;

  apply(
    cells: Array<Array<Array<number>>>,
    cellId: number,
    cellCount: number
  ): Array<Array<Array<number>>>;
}
