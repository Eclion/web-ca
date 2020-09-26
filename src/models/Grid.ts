import { rangeArray } from "@/models/Utils";
import CellType from "./CellType";

export default class Grid {
  public cells: Array<Array<Array<number>>> = Array<Array<Array<number>>>();

  get length(): number {
    return this.cells.length;
  }

  get width(): number {
    if (this.length === 0) return -1;
    return this.length;
  }

  get height(): number {
    if (this.width === 0) return -1;
    return this.cells[0].length;
  }

  get depth(): number {
    if (this.height <= 0) return -1;
    return this.cells[0][0].length;
  }

  get(x: number, y: number, z: number) {
    if (this.width === -1 || this.height == -1 || this.depth == -1) return -1;
    return this.cells[x][y][z];
  }

  init(
    dishDimensions: { width: number; height: number; depth: number },
    cellTypes: Array<CellType>
  ) {
    const dimensions = dishDimensions;
    if (dimensions === undefined) {
      return;
    }

    this.cells = Array(dishDimensions.width)
      .fill(0)
      .map(() =>
        Array(dishDimensions.height)
          .fill(0)
          .map(() => Array(dishDimensions.depth).fill(0))
      );

    if (cellTypes === undefined) {
      return;
    }

    for (const index in cellTypes) {
      const cellType = new CellType(cellTypes[index]);
      if (cellType.name === "Empty") {
        continue;
      }
      this.cells = cellType.distribute(this.cells);
    }
    // TODO: review performances between current implementation and
    //   Array(dimensions["height"] * dimensions["width"] * dimensions["depth"])
  }

  countNeighbors(x: number, y: number, z: number) {
    const dx = rangeArray(Math.max(0, x - 1), Math.min(this.width - 1, x + 1));
    const dy = rangeArray(Math.max(0, y - 1), Math.min(this.height - 1, y + 1));
    const dz = rangeArray(Math.max(0, z - 1), Math.min(this.depth - 1, z + 1));

    let cell = null;
    const count: Record<string, number> = {};
    for (const _x of dx) {
      for (const _y of dy) {
        for (const _z of dz) {
          cell = this.cells[_x][_y][_z];
          if (!(cell in count)) {
            count[cell] = 0;
          }
          count[cell] += 1;
        }
      }
    }

    cell = this.cells[x][y][z];
    if (!(cell in count)) {
      count[cell] = 0;
    } else {
      count[cell] -= 1;
    }

    const tempTotal = Object.keys(count)
      .filter(k => k !== "0")
      .map(k => count[k]);

    if (tempTotal.length === 0) {
      count.total = 0;
    } else if (tempTotal.length === 1) {
      count.total = tempTotal.slice(0, 1)[0];
    } else {
      count.total = tempTotal.reduce((a, b) => a + b);
    }

    return count;
  }

  flatten() {
    const flattenedCells = Array(this.width)
      .fill(0)
      .map(() => Array(this.height).fill(0));

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.cells[i][j].length; k++) {
          const cell = this.cells[i][j][k];
          if (cell !== 0) {
            flattenedCells[i][j] = cell;
            break;
          }
        }
      }
    }

    return flattenedCells;
  }
}
