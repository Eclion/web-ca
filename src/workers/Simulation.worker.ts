/* eslint-disable */

import { rangeArray } from "@/models/Utils"
import Grid from "@/models/Grid"
import Rule from "@/models/Rule"
import WorkerMessage from '@/models/WorkerMessage';

// TODO:
// - parse functions
// - provide only once

const performStep = function (grid: Grid, rules: Rule[]) {
  var nextCells = Array(grid.width).fill(0)
    .map(() => Array(grid.height).fill(0)
      .map(() => Array(grid.depth).fill(0)))

  for (var x of rangeArray(0, grid.width - 1)) {
    for (var y of rangeArray(0, grid.height - 1)) {
      for (var z of rangeArray(0, grid.depth - 1)) {
        var cell = grid.get(x, y, z)
        nextCells[x][y][z] = cell;

        if (cell === -1) continue; // TODO: throw exception somewhere instead?
        var neighbors = grid.countNeighbors(x, y, z)

        for (const rule of rules) {
          const nextCell = rule.apply(cell, neighbors);
          if (nextCell === cell) continue;
          nextCells[x][y][z] = nextCell;
          break;
        }
      }
    }
  }

  return nextCells
}

// TODO: refactor here?
const state = {
  grid: new Grid(),
  rules: [] as Rule[]
}

const ctx: Worker = self as any;

addEventListener("message", event => {
  var message = WorkerMessage.fromJSON(event.data);

  if (message.rules !== undefined && message.rules.length > 0) {
    state.rules = message.rules;
  }

  switch (message.action) {
    case ("init"): {
      state.grid.init(message.dishDimensions, message.cellTypes)
      ctx.postMessage({
        cells: state.grid.flatten()
      });
      break
    }
    case ("run"): {
      var startDate = new Date()
      var newCells = performStep(state.grid, state.rules)
      var endDate = new Date()
      state.grid.cells = newCells
      ctx.postMessage({
        cells: state.grid.flatten(),
        processTime: (endDate.getTime() - startDate.getTime()) / 1000
      });
      break
    }
  }
})

export {
  performStep
}
