import { describe, expect, it } from "vitest";
import { SeededRandom } from "../src/sim/math";
import { scanRadar } from "../src/sim/radar";
import type { Obstacle, RadarConfig, RobotState } from "../src/sim/types";

const robot: RobotState = {
  id: "radar-platform",
  start: { x: 50, y: 50 },
  goal: { x: 100, y: 50 },
  position: { x: 50, y: 50 },
  velocity: { x: 1, y: 0 },
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

const config: RadarConfig = {
  maxRange: 100,
  fieldOfViewDegrees: 90,
  rangeNoiseStdDev: 0,
  bearingNoiseStdDev: 0,
  velocityNoiseStdDev: 0,
};

const dynamicObstacle = (x: number, y: number): Obstacle => ({
  id: "forklift",
  x: x - 5,
  y: y - 5,
  width: 10,
  height: 10,
  kind: "dynamic",
  motion: { velocity: { x: 0, y: 2 } },
});

describe("2D radar model", () => {
  it("reports range, relative bearing, and relative velocity", () => {
    const detections = scanRadar(
      robot,
      [dynamicObstacle(80, 50)],
      config,
      new SeededRandom(1),
    );

    expect(detections).toHaveLength(1);
    expect(detections[0].range).toBeCloseTo(30);
    expect(detections[0].bearing).toBeCloseTo(0);
    expect(detections[0].relativeVelocity).toEqual({ x: -1, y: 2 });
  });

  it("filters detections outside range and field of view", () => {
    expect(
      scanRadar(robot, [dynamicObstacle(180, 50)], config, new SeededRandom(1)),
    ).toEqual([]);
    expect(
      scanRadar(robot, [dynamicObstacle(50, 80)], config, new SeededRandom(1)),
    ).toEqual([]);
  });

  it("produces repeatable noisy detections for a fixed seed", () => {
    const noisyConfig = {
      ...config,
      rangeNoiseStdDev: 0.8,
      bearingNoiseStdDev: 0.01,
      velocityNoiseStdDev: 0.2,
    };
    const obstacles = [dynamicObstacle(80, 50)];
    const first = scanRadar(robot, obstacles, noisyConfig, new SeededRandom(42));
    const second = scanRadar(robot, obstacles, noisyConfig, new SeededRandom(42));

    expect(first).toEqual(second);
  });
});
