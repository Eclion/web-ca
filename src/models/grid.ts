import { rangeArray } from "@/models/utils";
import CellType from './CellType';

export class Grid {
  cells: Array<Array<Array<number>>> = Array<Array<Array<number>>>();
  width: number = -1;
  height: number = -1;
  depth: number = -1;

  constructor(cells:Array<Array<Array<number>>>) {
    if (cells != null) {
      this.cells = cells;
      this.width = cells.length;
      this.height = cells[0].length;
      this.depth = cells[0][0].length;

    }
    return new Proxy(this, {
      get: (obj, key) => {
        if (typeof key === "string" && Number.isInteger(Number(key))) {
          // key is an index
          return obj.cells[Number(key)];
        } else if (key === "length") {
          return obj.cells.length;
        } else if (key === "width") {
          return obj.width;
        } else if (key === "height") {
          return obj.height;
        } else if (key === "depth") {
          return obj.depth;
        } else if (key === "cells") {
          return obj.cells;
        } else {
          // return obj[key];
          console.error("Tried to get Grid." + String(key))
          return undefined;
        }
      },
      set: (obj, key, value) => {
        if (typeof key === "string" && Number.isInteger(Number(key))) {
          // key is an index
          obj.cells[Number(key)] = value;
          return true;
        } else {
          // obj[key] = value;
          console.error("Tried to set Grid." + String(key))
          return true;
        }
      }
    });
  }

  init(params: {
    dishSettings: { width: number, height: number, depth: number },
    cellTypes: Array<CellType>
  }) {
    const dimensions = params.dishSettings;
    if (dimensions === undefined) {
      return;
    }
    this.cells = Array(dimensions.width)
      .fill(Array(dimensions.height).fill(Array(dimensions.depth).fill(0)));
    
    if (!("cellTypes" in params)) {
      return;
    }

    const cellTypes = params.cellTypes;
    for (const index in cellTypes) {
      const cellType = cellTypes[index];
      if (cellType.name === "Empty") {
        continue;
      }
      cellType.distribute(this.cells);
    }
    // TODO: review performances between current implementation and
    //   Array(dimensions["height"] * dimensions["width"] * dimensions["depth"])
  }


  countNeighbors(x: number, y: number, z: number) {
    const dx = rangeArray(Math.max(0, x - 1), Math.min(this.width - 1, x + 1));
    const dy = rangeArray(Math.max(0, y - 1), Math.min(this.height - 1, y + 1));
    const dz = rangeArray(Math.max(0, z - 1), Math.min(this.depth - 1, z + 1));

    let cell = null;
    const count: Record<string, number>  = {};
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
      .fill(Array(this.height).fill(0));

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
