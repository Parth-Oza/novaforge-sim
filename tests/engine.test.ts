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

  it("keeps explicit A* selection equivalent to the default", () => {
    const explicit = new SimulationEngine({ ...scenarios[0], planner: "astar" });
    const implicitScenario = structuredClone(scenarios[0]);
    delete implicitScenario.planner;
    const implicit = new SimulationEngine(implicitScenario);

    for (let index = 0; index < 120; index += 1) {
      explicit.step();
      implicit.step();
    }

    const explicitSnapshot = explicit.snapshot();
    const implicitSnapshot = implicit.snapshot();
    expect(explicitSnapshot.robots).toEqual(implicitSnapshot.robots);
    expect(explicitSnapshot.metrics).toEqual(implicitSnapshot.metrics);
  });

  it("records deterministic wait transitions and clears them on reset", () => {
    const first = new SimulationEngine(scenarios[0]);
    const second = new SimulationEngine(scenarios[0]);
    for (let index = 0; index < 2_700; index += 1) {
      first.step();
      second.step();
    }

    expect(first.snapshot().waitSamples.length).toBeGreaterThan(0);
    expect(first.snapshot().waitSamples).toEqual(second.snapshot().waitSamples);

    first.reset();
    expect(first.snapshot().waitSamples).toEqual([]);
  });
});
