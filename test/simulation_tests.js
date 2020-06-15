import Grid from '../src/model/grid'
import Simulation from '../src/model/simulation'
import { test, module } from 'QUnit'
// var { test, module } = QUnit;

module('Game of Life', () => {
  var dish2DSettings = {
    height: 5,
    width: 5,
    depth: 1
  }

  test('lone cell dies', assert => {
    const grid = new Grid()
    grid.init({
      dish_settings: dish2DSettings
    })
    grid[1][1][0] = 1
    const simulation = new Simulation()
    simulation.apply_rules(grid)
    assert.equal(grid[1][1][0], 0)
  })

  test('cell with 2 neighbors stays alive', assert => {
    const grid = new Grid()
    grid.init({
      dish_settings: dish2DSettings
    })
    grid[1][1][0] = 1
    grid[1][2][0] = 1
    grid[1][0][0] = 1

    const simulation = new Simulation()
    simulation.apply_rules(grid)
    assert.equal(grid[1][1][0], 1)
  })

  test('cell with 3 neighbors stays alive', assert => {
    const grid = new Grid()
    grid.init({
      dish_settings: dish2DSettings
    })
    grid[1][1][0] = 1
    grid[1][2][0] = 1
    grid[1][0][0] = 1
    grid[2][1][0] = 1

    const simulation = new Simulation()
    simulation.apply_rules(grid)
    assert.equal(grid[1][1][0], 1)
  })

  test('cell with more than 3 neighbors dies', assert => {
    const grid = new Grid()
    grid.init({
      dish_settings: dish2DSettings
    })
    grid[1][1][0] = 1
    grid[1][2][0] = 1
    grid[1][0][0] = 1
    grid[2][1][0] = 1
    grid[0][1][0] = 1

    const simulation = new Simulation()
    simulation.apply_rules(grid)
    assert.equal(grid[1][1][0], 0)
  })

  test('space with 3 neighbors becomes alive', assert => {
    const grid = new Grid()
    grid.init({
      dish_settings: dish2DSettings
    })
    grid[1][2][0] = 1
    grid[1][0][0] = 1
    grid[2][1][0] = 1

    const simulation = new Simulation()
    simulation.apply_rules(grid)
    assert.equal(grid[1][1][0], 1)
  })
})
