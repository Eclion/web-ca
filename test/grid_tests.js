import { test, module } from 'QUnit'
import Grid from '../src/model/grid'

module('Grid tests', () => {
  test('Grid initialization', assert => {
    var height = 10
    var width = 25
    var depth = 3
    var params = {
      dish_settings: {
        height: height,
        width: width,
        depth: depth
      }
    }
    var grid = new Grid()
    grid.init(params)
    assert.equal(grid.length, width, 'Correct width!')
    assert.equal(grid.width, width, 'Correct width! (bis)')
    assert.equal(grid[0].length, height, 'Correct height!')
    assert.equal(grid.height, height, 'Correct height! (bis)')
    assert.equal(grid[0][0].length, depth, 'Correct depth!')
    assert.equal(grid.depth, depth, 'Correct depth! (bis)')
  })

  var gridTestDishSettings = {
    height: 100,
    width: 100,
    depth: 1
  }

  var gridTestCellTypes = [
    {
      name: 'empty'
    },
    {
      name: 'live',
      distribution: {
        type: 'random',
        count: 500
      }
    }
  ]

  test('1 type with random distribution', assert => {
    var grid = new Grid()
    grid.init({
      dish_settings: gridTestDishSettings,
      cell_types: gridTestCellTypes
    })

    var count = grid.cells.flat().flat().filter(x => x === 1).length
    var expected = 500
    assert.ok(
      Math.abs(count - expected) / expected < 0.1,
      'Correct number of cells at init! (+/- 10%): ' + count
    )
  })

  // test("2 types with random distribution", assert => {})
  // test("1 type with radial random distribution", assert => {})
  // test("2 types with radial random distribution", assert => {})
  // test("2 types with radial random distribution, different radius", assert => {})
  // test("2 types with radial random distribution, one with ring radius", assert => {})
  // test("1 type with random & 1 type with radial random distribution", assert => {})
})

module('Neighbor', () => {
  test('Neighbor count with 1 cell type', assert => {
    var grid = new Grid()
    var dishSettings = { height: 3, width: 3, depth: 3 }
    grid.init({ dish_settings: dishSettings })
    grid[1][1][1] = 1
    assert.equal(grid.count_neighbors(1, 1, 0).total, 1, 'First count at (1, 1, 0)')
    assert.equal(grid.count_neighbors(1, 1, 1).total, 0, 'First count at (1, 1, 1)')
  })
  // test("Neighbor count with 2 cell types")
})
