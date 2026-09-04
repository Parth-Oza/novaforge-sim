import type { Obstacle, Vec2 } from "./types";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const distance = (a: Vec2, b: Vec2): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const pointInExpandedObstacle = (
  point: Vec2,
  obstacle: Obstacle,
  padding = 0,
): boolean =>
  point.x >= obstacle.x - padding &&
  point.x <= obstacle.x + obstacle.width + padding &&
  point.y >= obstacle.y - padding &&
  point.y <= obstacle.y + obstacle.height + padding;

export const circleIntersectsObstacle = (
  center: Vec2,
  radius: number,
  obstacle: Obstacle,
): boolean => {
  const closestX = clamp(center.x, obstacle.x, obstacle.x + obstacle.width);
  const closestY = clamp(center.y, obstacle.y, obstacle.y + obstacle.height);
  return Math.hypot(center.x - closestX, center.y - closestY) <= radius;
};

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed || 0x6d2b79f5;
  }

  next(): number {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x1_0000_0000;
  }

  gaussian(): number {
    const u = Math.max(this.next(), Number.EPSILON);
    const v = Math.max(this.next(), Number.EPSILON);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}
