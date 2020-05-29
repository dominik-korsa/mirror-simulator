export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) ** 2 + Math.abs(y2 - y1) ** 2;
}
