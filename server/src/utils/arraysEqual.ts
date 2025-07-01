export function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].map(a => a.trim().toLowerCase()).sort();
  const sorted2 = [...arr2].map(a => a.trim().toLowerCase()).sort();
  return sorted1.every((val, index) => val === sorted2[index]);
}
