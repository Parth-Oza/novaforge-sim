import { distance, pointInExpandedObstacle } from "./math";
import type { Obstacle, Vec2 } from "./types";

type GridPoint = { x: number; y: number };

type NodeRecord = {
  key: string;
  point: GridPoint;
  g: number;
  f: number;
};

const directions = [
  { x: 1, y: 0, cost: 1 },
  { x: -1, y: 0, cost: 1 },
  { x: 0, y: 1, cost: 1 },
  { x: 0, y: -1, cost: 1 },
  { x: 1, y: 1, cost: Math.SQRT2 },
  { x: 1, y: -1, cost: Math.SQRT2 },
  { x: -1, y: 1, cost: Math.SQRT2 },
  { x: -1, y: -1, cost: Math.SQRT2 },
] as const;

const keyOf = (point: GridPoint): string => `${point.x}:${point.y}`;

const heuristic = (a: GridPoint, b: GridPoint): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

const toGrid = (point: Vec2, gridSize: number): GridPoint => ({
  x: Math.floor(point.x / gridSize),
  y: Math.floor(point.y / gridSize),
});

const toWorld = (point: GridPoint, gridSize: number): Vec2 => ({
  x: point.x * gridSize + gridSize / 2,
  y: point.y * gridSize + gridSize / 2,
});

const lineIsClear = (
  start: Vec2,
  end: Vec2,
  obstacles: Obstacle[],
  padding: number,
): boolean => {
  const steps = Math.max(2, Math.ceil(distance(start, end) / 8));
  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    const point = {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    };
    if (obstacles.some((obstacle) => pointInExpandedObstacle(point, obstacle, padding))) {
      return false;
    }
  }
  return true;
};

const simplifyPath = (
  path: Vec2[],
  obstacles: Obstacle[],
  padding: number,
): Vec2[] => {
  if (path.length < 3) return path;
  const simplified: Vec2[] = [path[0]];
  let anchor = 0;
  while (anchor < path.length - 1) {
    let candidate = path.length - 1;
    while (
      candidate > anchor + 1 &&
      !lineIsClear(path[anchor], path[candidate], obstacles, padding)
    ) {
      candidate -= 1;
    }
    simplified.push(path[candidate]);
    anchor = candidate;
  }
  return simplified;
};

export const planPath = (
  start: Vec2,
  goal: Vec2,
  width: number,
  height: number,
  gridSize: number,
  obstacles: Obstacle[],
  padding: number,
): Vec2[] => {
  const columns = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  const startGrid = toGrid(start, gridSize);
  const goalGrid = toGrid(goal, gridSize);
  const startKey = keyOf(startGrid);
  const goalKey = keyOf(goalGrid);
  const open: NodeRecord[] = [
    { key: startKey, point: startGrid, g: 0, f: heuristic(startGrid, goalGrid) },
  ];
  const bestCost = new Map<string, number>([[startKey, 0]]);
  const parents = new Map<string, string>();
  const points = new Map<string, GridPoint>([[startKey, startGrid]]);
  const closed = new Set<string>();

  const isBlocked = (point: GridPoint): boolean => {
    if (point.x < 0 || point.y < 0 || point.x >= columns || point.y >= rows) return true;
    const worldPoint = toWorld(point, gridSize);
    if (
      worldPoint.x < padding ||
      worldPoint.y < padding ||
      worldPoint.x > width - padding ||
      worldPoint.y > height - padding
    ) {
      return true;
    }
    return obstacles.some((obstacle) => pointInExpandedObstacle(worldPoint, obstacle, padding));
  };

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f || a.g - b.g);
    const current = open.shift()!;
    if (closed.has(current.key)) continue;
    if (current.key === goalKey) {
      const reversed: Vec2[] = [goal];
      let cursor = goalKey;
      while (cursor !== startKey) {
        const point = points.get(cursor);
        const parent = parents.get(cursor);
        if (!point || !parent) return [];
        reversed.push(toWorld(point, gridSize));
        cursor = parent;
      }
      reversed.push(start);
      return simplifyPath(reversed.reverse(), obstacles, padding);
    }

    closed.add(current.key);
    for (const direction of directions) {
      const neighbor = {
        x: current.point.x + direction.x,
        y: current.point.y + direction.y,
      };
      const neighborKey = keyOf(neighbor);
      if (closed.has(neighborKey) || (neighborKey !== goalKey && isBlocked(neighbor))) continue;

      if (direction.x !== 0 && direction.y !== 0) {
        const sideA = { x: current.point.x + direction.x, y: current.point.y };
        const sideB = { x: current.point.x, y: current.point.y + direction.y };
        if (isBlocked(sideA) || isBlocked(sideB)) continue;
      }

      const nextCost = current.g + direction.cost;
      if (nextCost >= (bestCost.get(neighborKey) ?? Number.POSITIVE_INFINITY)) continue;
      bestCost.set(neighborKey, nextCost);
      parents.set(neighborKey, current.key);
      points.set(neighborKey, neighbor);
      open.push({
        key: neighborKey,
        point: neighbor,
        g: nextCost,
        f: nextCost + heuristic(neighbor, goalGrid),
      });
    }
  }

  return [];
};
