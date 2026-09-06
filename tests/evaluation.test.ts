import { describe, expect, it } from "vitest";
import { evaluateScenario } from "../src/sim/evaluation";
import type { SimulationMetrics } from "../src/sim/types";

const metrics: SimulationMetrics = {
  simTime: 45,
  safetyHolds: 12,
  replans: 30,
  sensorFrames: 500,
  arrived: 3,
  totalRobots: 4,
  completionPercent: 92,
};

describe("scenario acceptance evaluation", () => {
  it("passes when every configured threshold is satisfied", () => {
    const result = evaluateScenario(metrics, {
      minCompletionPercent: 90,
      minArrivalPercent: 75,
      maxSafetyHolds: 12,
      maxReplans: 40,
    });

    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(4);
  });

  it("reports each failed threshold with its observed value", () => {
    const result = evaluateScenario(metrics, {
      minCompletionPercent: 95,
      minArrivalPercent: 100,
      maxSafetyHolds: 10,
    });

    expect(result.passed).toBe(false);
    expect(result.checks.filter((check) => !check.passed)).toMatchObject([
      { id: "minCompletionPercent", actual: 92 },
      { id: "minArrivalPercent", actual: 75 },
      { id: "maxSafetyHolds", actual: 12 },
    ]);
  });
});
