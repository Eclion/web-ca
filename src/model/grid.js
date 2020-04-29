import { rangeArray } from '@/model/utils'

export class Grid {
  cells = []

  constructor (cells) {
    if (cells != null) {
      this.cells = cells
    }
    return new Proxy(this, {
      get: (obj, key) => {
        if (typeof (key) === 'string' && (Number.isInteger(Number(key)))) { // key is an index
          return obj.cells[key]
        } else if (key === 'length') {
          return obj.cells.length
        } else if (key === 'width') {
          return obj.cells.length
        } else if (key === 'height') {
          return obj.cells.length === 0 ? undefined : obj.cells[0].length
        } else if (key === 'depth') {
          return (obj.cells.length === 0 || obj.cells[0].length === 0)
            ? undefined : obj.cells[0][0].length
        } else {
          return obj[key]
        }
      },
      set: (obj, key, value) => {
        if (typeof (key) === 'string' && (Number.isInteger(Number(key)))) { // key is an index
          obj.cells[key] = value
          return true
        } else {
          obj[key] = value
          return true
        }
      }
    })
  }

  init (params) {
    var dimensions = params.dish_settings
    this.cells = Array(dimensions.width).fill()
      .map(() => Array(dimensions.height).fill()
        .map(() => Array(dimensions.depth).fill(0))
      )
    if (!('cell_types' in params)) {
      return
    }
    var cellTypes = params.cell_types
    for (var index in cellTypes) {
      var cellType = cellTypes[index]
      if (cellType.name === 'empty') { continue }
      if (!('distribution' in cellType)) { continue }
      var distribution = cellType.distribution
      switch (distribution.type) {
        case ('random'): this.randomDistribution(index, distribution); break
      }
    }
    // TODO: review performances between current implementation and
    //   Array(dimensions["height"] * dimensions["width"] * dimensions['depth'])
  }

  randomDistribution (cellId, distribution) {
    var ratio = distribution.count / (this.width * this.height)
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        this.cells[i][j][0] = Math.random() <= ratio ? 1 : 0
      };
    };
  }

  countNeighbors (x, y, z) {
    var dx = rangeArray(Math.max(0, x - 1), Math.min(this.width - 1, x + 1))
    var dy = rangeArray(Math.max(0, y - 1), Math.min(this.height - 1, y + 1))
    var dz = rangeArray(Math.max(0, z - 1), Math.min(this.depth - 1, z + 1))

    var cell = null
    var count = {}
    for (var _x of dx) {
      for (var _y of dy) {
        for (var _z of dz) {
          cell = this[_x][_y][_z]
          if (!(cell in count)) { count[cell] = 0 }
          count[cell] += 1
        }
      }
    };

    cell = this[x][y][z]
    if (!(cell in count)) {
      count[cell] = 0
    } else {
      count[cell] -= 1
    }

    var tempTotal = Object.keys(count)
      .filter(k => k !== 0)
      .map(k => count[k])

    if (tempTotal.length === 0) {
      count.total = 0
    } else if (tempTotal.length === 1) {
      count.total = tempTotal.slice(0, 1)[0]
    } else {
      count.total = tempTotal
        .reduce((a, b) => a + b)
    }

    return count
  }
}
