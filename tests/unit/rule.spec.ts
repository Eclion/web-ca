import Rule from "@/models/Rule";

describe("Rule test", () => {
  it("tests rule validity", () => {
    expect(
      new Rule({
      operator: "",
      initialCellTypeId: -1,
        nextCellTypeId: -1,
      neighborCellTypeId: -1,
      neighborCount: -1
    } as Rule).isValid()
    ).toBe(false)

    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: -1,
      nextCellTypeId: -1,
      neighborCellTypeId: -1,
      neighborCount: -1
    } as Rule).isValid()
    ).toBe(false)

    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: -1,
      neighborCount: -1
    } as Rule).isValid()
    ).toBe(false)
    
    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: -1,
      nextCellTypeId: 0,
      neighborCellTypeId: -1,
      neighborCount: 1
    } as Rule).isValid()
    ).toBe(false)

    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: -1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).isValid()
    ).toBe(false)

    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: -1,
      neighborCount: 1
    } as Rule).isValid()
    ).toBe(false)

    expect(
      new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).isValid()
    ).toBe(true)
  })

  it("test rule application", () => {
    expect(new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).apply(1, { 1: 2 })
    ).toBe(1)
    
    expect(new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).apply(1, { 1: 1 })
    ).toBe(0)
    
    expect(new Rule({
      operator: ">",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).apply(1, { 1: 2 })
    ).toBe(2)
    
    expect(new Rule({
      operator: ">",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 1
    } as Rule).apply(1, { 1: 1 })
    ).toBe(1)
    
    expect(new Rule({
      operator: ">=",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, { 1: 2 })
    ).toBe(2)
    
    expect(new Rule({
      operator: ">=",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, { 1: 1 })
    ).toBe(1)
    
    expect(new Rule({
      operator: "<",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, { 1: 1 })
    ).toBe(2)
    
    expect(new Rule({
      operator: "<",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, { 1: 2 })
    ).toBe(1)
    
    expect(new Rule({
      operator: "<=",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, { 1: 2 })
    ).toBe(2)
    
    expect(new Rule({
      operator: "<=",
      initialCellTypeId: 1,
      nextCellTypeId: 2,
      neighborCellTypeId: 1,
      neighborCount: 2
    } as Rule).apply(1, {1: 3})
    ).toBe(1)

    expect(new Rule({
      operator: ">=",
      initialCellTypeId: 0,
      nextCellTypeId: 1,
      neighborCellTypeId: 1,
      neighborCount: 0
    } as Rule).apply(0, {0: 8})
    ).toBe(1)
  })

  it("tests rule ser/deserialization", () => {
    const rule = new Rule({
      operator: "==",
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 2,
      neighborCount: 1
    } as Rule);

    const ruleJson = rule.toJSON();

    expect(ruleJson).toBe(
      "{" +
      "\"id\":0," +
      "\"initialCellTypeId\":1," +
      "\"nextCellTypeId\":0," +
      "\"neighborCellTypeId\":2," +
      "\"neighborCount\":1," +
      "\"operator\":\"==\"}"
    )

    const deserRule = Rule.fromJSON(ruleJson);

    expect(deserRule).toStrictEqual(rule)
    expect(deserRule.apply(1, { 1: 2 })).toBe(1)
  })

  it("tests Conway's GoL rules", () => {
    const birth = new Rule({
      id: 0,
      initialCellTypeId: 0,
      nextCellTypeId: 1,
      neighborCellTypeId: 1,
      neighborCount: 3,
      operator: "=="
    } as Rule);
    
    const underpop = new Rule({
      id: 1,
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 2,
      operator: "<"
    } as Rule);
    
    const overpop = new Rule({
      id: 2,
      initialCellTypeId: 1,
      nextCellTypeId: 0,
      neighborCellTypeId: 1,
      neighborCount: 3,
      operator: ">"
    } as Rule);

    expect(birth.apply(1, {0:5, 1:3})).toBe(1)
    expect(underpop.apply(1, {0:5, 1:3})).toBe(1)
    expect(overpop.apply(1, {0:5, 1:3})).toBe(1)
  
    expect(birth.apply(1, {0:6, 1:2})).toBe(1)
    expect(underpop.apply(1, {0:6, 1:2})).toBe(1)
    expect(overpop.apply(1, {0:6, 1:2})).toBe(1)
  });
})