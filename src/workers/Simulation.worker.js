import { rangeArray } from '@/model/utils'
import { Grid } from '@/model/grid'

// TODO:
// - parse functions
// - provide only once
const rules = {
  0: [
    n => (n[1] === 3) ? 1 : 0
  ],
  1: [
    n => (n[1] < 2) ? 0 : 1,
    n => (n[1] > 3) ? 0 : 1
  ]
}

const performStep = function (grid, rules) {
  var nextCells = Array(grid.width).fill()
    .map(() => Array(grid.height).fill()
      .map(() => Array(grid.depth).fill(0)))

  for (var x of rangeArray(0, grid.width - 1)) {
    for (var y of rangeArray(0, grid.height - 1)) {
      for (var z of rangeArray(0, grid.depth - 1)) {
        var cell = grid[x][y][z]
        var neighbors = grid.countNeighbors(x, y, z)
        for (var rule of rules[cell]) {
          var nextCell = rule(neighbors)
          if (nextCell !== cell) { break }
        }
        nextCells[x][y][z] = nextCell
      }
    }
  }

  return nextCells
}

addEventListener('message', event => {
  var payload = JSON.parse(event.data)
  var newCells = performStep(new Grid(payload.cells), rules)
  postMessage(newCells)
  // postMessage(performStep(event.data.grid, event.data.rules))
})
