import { describe, expect, it } from "vitest";
import { planPath, planWithPlanner } from "../src/sim/planner";
import type { Obstacle, PlannerRequest } from "../src/sim/types";

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

  it("supports a worker-safe direct-line example planner", () => {
    const request: PlannerRequest = {
      start: { x: 20, y: 20 },
      goal: { x: 180, y: 180 },
      width: 200,
      height: 200,
      gridSize: 10,
      obstacles: [],
      padding: 4,
    };

    const result = planWithPlanner("direct-line", structuredClone(request));

    expect(structuredClone(result)).toEqual({
      status: "found",
      path: [request.start, request.goal],
    });
  });

  it("reports a blocked direct route without falling back to A*", () => {
    const result = planWithPlanner("direct-line", {
      start: { x: 20, y: 100 },
      goal: { x: 180, y: 100 },
      width: 200,
      height: 200,
      gridSize: 10,
      obstacles: [
        { id: "wall", x: 90, y: 50, width: 20, height: 100, kind: "wall" },
      ],
      padding: 4,
    });

    expect(result).toEqual({ status: "blocked", path: [] });
  });
});
