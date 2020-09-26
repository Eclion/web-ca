import Grid from "@/models/Grid"
import CellType from "@/models/CellType"
import RandomDistribution from '@/models/distributions/RandomDistribution';

describe("Grid tests", () => {
  it("tests grid initialization", () => {
    const height = 10;
    const width = 25;
    const depth = 3;
    const dishDimensions = {
      height: height,
      width: width,
      depth: depth
    };
    const grid = new Grid();
    grid.init(dishDimensions, []);
    expect(grid.length).toBe(width);
    expect(grid.width).toBe(width);
    expect(grid.height).toBe(height);
    expect(grid.depth).toBe(depth);
  })

  const gridTestDishSettings = {
    height: 100,
    width: 100,
    depth: 1
  };

  const gridTestCellTypes = [
    new CellType(),
    new CellType({
      id: 1,
      name: "live",
      initialCount: 500,
      distribution: new RandomDistribution()
    } as CellType)
  ];

  it("initialize the grid with 1 cell type randomly distributed", () => {
    const grid = new Grid()
    grid.init(gridTestDishSettings, gridTestCellTypes)

    const count = grid.cells.flat().flat().filter(x => x === 1).length
    const expected = 500
    expect(Math.abs(count - expected) / expected).toBeLessThanOrEqual(0.1)
  })

  // test("2 types with random distribution", assert => {})
  // test("1 type with radial random distribution", assert => {})
  // test("2 types with radial random distribution", assert => {})
  // test("2 types with radial random distribution, different radius", assert => {})
  // test("2 types with radial random distribution, one with ring radius", assert => {})
  // test("1 type with random & 1 type with radial random distribution", assert => {})
})

describe("Neighbor tests", () => {
  const grid = new Grid();

  it("counts '1'-type cell neighbors", () => {
    grid.cells = Array(
      Array([0, 0, 0], [0, 0, 0], [0, 0, 0]),
      Array([0, 0, 0], [0, 1, 0], [0, 0, 0]),
      Array([0, 0, 0], [0, 0, 0], [0, 0, 0])
    );
    expect(grid.countNeighbors(1, 1, 0)).toStrictEqual({0: 16, 1: 1, total: 1});
    expect(grid.countNeighbors(1, 1, 1)).toStrictEqual({0: 26, 1: 0, total: 0});

    grid.cells = Array(
      Array([1], [0], [1]),
      Array([0], [1], [0]),
      Array([0], [0], [1])
    );
    expect(grid.countNeighbors(0, 1, 0)).toStrictEqual({0: 2, 1: 3, total: 3});
    expect(grid.countNeighbors(1, 1, 0)).toStrictEqual({ 0: 5, 1: 3, total: 3 });
    
    grid.cells = Array(
      Array([0], [1], [0]),
      Array([0], [1], [0]),
      Array([0], [1], [0])
    );
    expect(grid.countNeighbors(0, 0, 0)).toStrictEqual({0: 1, 1: 2, total: 2});
    expect(grid.countNeighbors(1, 0, 0)).toStrictEqual({0: 2, 1: 3, total: 3});
    expect(grid.countNeighbors(0, 1, 0)).toStrictEqual({0: 4, 1: 1, total: 1});
    expect(grid.countNeighbors(1, 1, 0)).toStrictEqual({0: 6, 1: 2, total: 2});
  });
  // test("Neighbor count with 2 cell types")
})
