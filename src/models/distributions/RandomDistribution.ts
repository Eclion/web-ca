import Distribution from "./Distribution";
export default class RandomDistribution implements Distribution {
  type = "random";

  apply(
    cells: Array<Array<Array<number>>>,
    id: number,
    cellCount: number
  ): Array<Array<Array<number>>> {
    // TODO: take in account the non empty places
    const width = cells.length;
    const height = cells[0].length;
    const emptyCount = cells
      .flatMap(column => column)
      .map(depth => depth[0])
      .filter(value => value === 0).length;

    const ratio = cellCount / emptyCount;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (cells[i][j][0] === 0) {
          cells[i][j][0] = Math.random() <= ratio ? id : 0;
        }
      }
    }
    return cells;
  }
}
