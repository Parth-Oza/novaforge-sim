import { SimulationEngine } from "../sim/engine";
import { scenarios } from "../sim/scenarios";

const requestedId = process.argv[2] ?? scenarios[0].id;
const requestedRuns = Number.parseInt(process.argv[3] ?? "5", 10);
const template = scenarios.find((scenario) => scenario.id === requestedId);

if (!template) {
  console.error(`Unknown scenario: ${requestedId}`);
  console.error(`Available scenarios: ${scenarios.map((scenario) => scenario.id).join(", ")}`);
  process.exit(1);
}

const runs = Math.min(Math.max(Number.isFinite(requestedRuns) ? requestedRuns : 5, 1), 100);
const results = [];

for (let run = 0; run < runs; run += 1) {
  const scenario = structuredClone(template);
  scenario.seed += run;
  const engine = new SimulationEngine(scenario);
  const steps = Math.ceil(scenario.durationSeconds / engine.fixedStep);
  for (let step = 0; step < steps; step += 1) engine.step();
  const { metrics, evaluation } = engine.snapshot();
  results.push({
    run: run + 1,
    seed: scenario.seed,
    completionPercent: Number(metrics.completionPercent.toFixed(2)),
    arrived: `${metrics.arrived}/${metrics.totalRobots}`,
    safetyHolds: metrics.safetyHolds,
    passed: evaluation.passed,
    replans: metrics.replans,
    failedChecks: evaluation.checks
      .filter((check) => !check.passed)
      .map((check) => check.id),
  });
}

const summary = {
  scenario: template.id,
  acceptance: template.acceptance,
  runs,
  passRate: `${Math.round(
    (results.filter((result) => result.passed).length / runs) * 100,
  )}%`,
  results,
};

console.log(JSON.stringify(summary, null, 2));

if (results.some((result) => !result.passed)) {
  process.exitCode = 1;
}
