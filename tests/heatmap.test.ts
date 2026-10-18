import { describe, expect, it } from "vitest";
import { buildWaitHeatmap } from "../src/sim/heatmap";
import type { WaitSample } from "../src/sim/types";

const samples: WaitSample[] = [
  {
    robotId: "r1",
    position: { x: 10, y: 10 },
    simTime: 1,
    reason: "safety-hold",
  },
  {
    robotId: "r2",
    position: { x: 14, y: 12 },
    simTime: 2,
    reason: "no-path",
  },
  {
    robotId: "r1",
    position: { x: 70, y: 10 },
    simTime: 3,
    reason: "safety-hold",
  },
];

describe("wait heatmap aggregation", () => {
  it("groups samples deterministically and normalizes intensity", () => {
    const cells = buildWaitHeatmap(samples, 30);

    expect(cells).toEqual([
      { x: 15, y: 15, count: 2, intensity: 1 },
      { x: 75, y: 15, count: 1, intensity: 0.5 },
    ]);
  });

  it("does not mutate samples while preparing rendering data", () => {
    const before = structuredClone(samples);

    buildWaitHeatmap(samples, 30);

    expect(samples).toEqual(before);
  });

  it("rejects invalid cell sizes", () => {
    expect(() => buildWaitHeatmap(samples, 0)).toThrow(RangeError);
  });
});
