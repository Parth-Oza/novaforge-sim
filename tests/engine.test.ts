import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../src/sim/engine";
import { scenarios } from "../src/sim/scenarios";

describe("simulation engine", () => {
  it("replays deterministically with the same seed", () => {
    const first = new SimulationEngine(scenarios[0]);
    const second = new SimulationEngine(scenarios[0]);
    for (let index = 0; index < 180; index += 1) {
      first.step();
      second.step();
    }
    expect(first.snapshot()).toEqual(second.snapshot());
  });

  it("advances mission time and sensor frames", () => {
    const engine = new SimulationEngine(scenarios[1]);
    engine.step(0.1);
    const snapshot = engine.snapshot();
    expect(snapshot.metrics.simTime).toBeCloseTo(0.1);
    expect(snapshot.metrics.sensorFrames).toBeGreaterThan(0);
  });
});
