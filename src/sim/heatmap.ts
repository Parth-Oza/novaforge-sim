import type { WaitSample } from "./types";

export type HeatmapCell = {
  x: number;
  y: number;
  count: number;
  intensity: number;
};

export const buildWaitHeatmap = (
  samples: readonly WaitSample[],
  cellSize = 30,
): HeatmapCell[] => {
  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new RangeError("cellSize must be finite and positive");
  }
  const counts = new Map<string, { x: number; y: number; count: number }>();
  for (const sample of samples) {
    const cellX = Math.floor(sample.position.x / cellSize);
    const cellY = Math.floor(sample.position.y / cellSize);
    const key = `${cellX}:${cellY}`;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { x: cellX * cellSize + cellSize / 2, y: cellY * cellSize + cellSize / 2, count: 1 });
  }
  const maximum = Math.max(0, ...[...counts.values()].map((cell) => cell.count));
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, cell]) => ({
      ...cell,
      intensity: maximum > 0 ? cell.count / maximum : 0,
    }));
};
