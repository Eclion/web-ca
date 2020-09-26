import { performStep } from "@/workers/Simulation.worker.ts";
import Rule from "@/models/Rule";
import Grid from '@/models/Grid';

// conway's GoL
describe("Conway's GoL tests", () => {
  const rules = Array<Rule>(
    new Rule({
      id: 0,
      initialCellTypeId: 0,
      nextCellTypeId: 1,
      neighborCellTypeId: 1,
      neighborCount: 3,
      operator: "=="
    } as Rule),
    new Rule({
      id: 1,
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 2,
      operator: "<"
    } as Rule),
    new Rule({
      id: 2,
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 3,
      operator: ">"
    } as Rule)
  );

  const grid = new Grid();

  it("tests the survival rules", () => {
    grid.cells = Array(
      Array([0], [0], [0]),
      Array([0], [0], [0]),
      Array([0], [0], [0])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [0], [0]),
        Array([0], [0], [0]),
        Array([0], [0], [0])
      )
    );
    
    grid.cells = Array(
      Array([0], [0], [0]),
      Array([0], [1], [0]),
      Array([0], [0], [0])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [0], [0]),
        Array([0], [0], [0]),
        Array([0], [0], [0])
      )
    );
    
    grid.cells = Array(
      Array([1], [0], [0]),
      Array([0], [1], [0]),
      Array([0], [0], [1])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [0], [0]),
        Array([0], [1], [0]),
        Array([0], [0], [0])
      )
    );
    
    grid.cells = Array(
      Array([1], [0], [1]),
      Array([0], [1], [0]),
      Array([0], [0], [1])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [1], [0]),
        Array([0], [1], [1]),
        Array([0], [0], [0])
      )
    );

  });


  it("tests birth rules", () => {
    grid.cells = Array(
      Array([0], [1], [0]),
      Array([1], [0], [0]),
      Array([0], [1], [0])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [0], [0]),
        Array([1], [1], [0]),
        Array([0], [0], [0])
      )
    );
  });


  
  it("tests some patterns", () => {
    grid.cells = Array(
      Array([0], [1], [0]),
      Array([0], [1], [0]),
      Array([0], [1], [0])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([0], [0], [0]),
        Array([1], [1], [1]),
        Array([0], [0], [0])
      )
    );
    
    grid.cells = Array(
      Array([1], [1], [0]),
      Array([1], [1], [0]),
      Array([0], [0], [0])
    );
    
    expect(performStep(grid, rules)).toStrictEqual(
      Array(
        Array([1], [1], [0]),
        Array([1], [1], [0]),
        Array([0], [0], [0])
      )
    );
  });
})