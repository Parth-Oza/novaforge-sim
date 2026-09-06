# Scenario Acceptance Gates

NovaForge scenarios carry their own measurable definition of success. This keeps the world,
seed, mission, and expected behavior together in one reviewable artifact.

## Configure a gate

Add one or more supported thresholds to a scenario:

```json
{
  "acceptance": {
    "minCompletionPercent": 95,
    "minArrivalPercent": 100,
    "maxSafetyHolds": 120,
    "maxReplans": 150
  }
}
```

| Field | Pass condition | What it measures |
| --- | --- | --- |
| `minCompletionPercent` | observed value ≥ threshold | Mean geometric mission progress across the fleet |
| `minArrivalPercent` | observed value ≥ threshold | Percentage of robots that reached their goals |
| `maxSafetyHolds` | observed value ≤ threshold | Control steps blocked by a collision guard |
| `maxReplans` | observed value ≤ threshold | Global planner calls across all robots |

Only configured fields are evaluated. The JSON Schema rejects unknown acceptance fields so a
misspelled metric cannot silently weaken a test.

## Run the evidence gate

```bash
pnpm batch aurora-warehouse 10
```

The command prints JSON containing the scenario thresholds, pass rate, metrics for every seed,
and a `failedChecks` list. It exits with status `1` when any run fails, so no custom CI wrapper is
required.

## Choose useful thresholds

1. Run a representative seed range and record the baseline distribution.
2. Set a strict mission outcome first, such as 100% fleet arrival.
3. Set operational limits above the known-good baseline with a documented margin.
4. Add a regression test when a threshold exposes a simulation defect.
5. Recalibrate thresholds only when the intended scenario behavior changes.

Acceptance gates are regression evidence, not a real-world safety claim. Validate controllers on
hardware and with the safety process appropriate to the robot and environment.

## Add a new criterion

Contributors can add a metric without changing the batch reporting format:

1. Extend `AcceptanceCriteria` in `src/sim/types.ts`.
2. Add its calculation to the definition table in `src/sim/evaluation.ts`.
3. Add the field and limits to `schema/scenario.schema.json`.
4. Cover the passing and failing boundaries in `tests/evaluation.test.ts`.

The telemetry panel renders the evaluator's structured checks automatically.
