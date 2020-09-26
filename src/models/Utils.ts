// from https://stackoverflow.com/a/25098884
export function rangeArray(min: number, max: number): Array<number> {
  const len = max - min + 1;
  const arr = new Array<number>(len);
  for (let i = 0; i < len; i++) {
    arr[i] = min + i;
  }
  return arr;
}
