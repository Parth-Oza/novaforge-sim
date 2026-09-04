import { describe, expect, it } from "vitest";
import { castLidar } from "../src/sim/lidar";
import { SeededRandom } from "../src/sim/math";
import type { RobotState } from "../src/sim/types";

const robot: RobotState = {
  id: "test-robot",
  start: { x: 50, y: 50 },
  goal: { x: 90, y: 50 },
  position: { x: 50, y: 50 },
  heading: 0,
  radius: 5,
  maxSpeed: 10,
  color: "#72f1ff",
  status: "moving",
  path: [],
  waypointIndex: 0,
  distanceTravelled: 0,
  replans: 0,
};

describe("LiDAR model", () => {
  it("detects a rectangular obstacle", () => {
    const hits = castLidar(
      robot,
      [{ id: "box", x: 80, y: 40, width: 10, height: 20, kind: "rack" }],
      200,
      100,
      { rays: 4, maxRange: 100, noiseStdDev: 0 },
      new SeededRandom(1),
    );
    expect(hits[0].distance).toBeCloseTo(30, 5);
  });

  it("produces the same noisy scan for the same seed", () => {
    const config = { rays: 16, maxRange: 100, noiseStdDev: 0.8 };
    const first = castLidar(robot, [], 200, 100, config, new SeededRandom(42));
    const second = castLidar(robot, [], 200, 100, config, new SeededRandom(42));
    expect(first).toEqual(second);
  });
});
