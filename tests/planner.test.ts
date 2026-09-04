import { describe, expect, it } from "vitest";
import { planPath } from "../src/sim/planner";
import type { Obstacle } from "../src/sim/types";

describe("A* planner", () => {
  it("finds a route around an obstacle", () => {
    const obstacles: Obstacle[] = [
      { id: "wall", x: 80, y: 0, width: 30, height: 150, kind: "wall" },
    ];
    const path = planPath(
      { x: 30, y: 40 },
      { x: 170, y: 40 },
      220,
      220,
      10,
      obstacles,
      4,
    );
    expect(path.length).toBeGreaterThan(2);
    expect(path.at(-1)).toEqual({ x: 170, y: 40 });
  });

  it("returns no path when the world is divided", () => {
    const obstacles: Obstacle[] = [
      { id: "wall", x: 95, y: 0, width: 30, height: 220, kind: "wall" },
    ];
    const path = planPath(
      { x: 35, y: 100 },
      { x: 180, y: 100 },
      220,
      220,
      10,
      obstacles,
      4,
    );
    expect(path).toEqual([]);
  });
});
