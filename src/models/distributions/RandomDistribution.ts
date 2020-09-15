import Distribution from './Distribution'
export default class RandomDistribution implements Distribution {
  type: string = 'random';

  apply(cells: Array<Array<Array<number>>>, cellCount: number): Array<Array<Array<number>>> {
    // TODO: take in account the non empty places
    const width = cells.length;
    const height = cells[0].length;
    const depth = cells[0][0].length;
    const ratio = cellCount / (width * height);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        cells[i][j][0] = Math.random() <= ratio ? 1 : 0;
      }
    }
    return cells;
  }
}