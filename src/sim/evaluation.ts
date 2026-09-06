import type {
  AcceptanceCheck,
  AcceptanceCriteria,
  ScenarioEvaluation,
  SimulationMetrics,
} from "./types";

type CheckDefinition = Omit<AcceptanceCheck, "actual" | "threshold" | "passed"> & {
  read: (metrics: SimulationMetrics) => number;
};

const definitions: Record<keyof AcceptanceCriteria, CheckDefinition> = {
  minCompletionPercent: {
    id: "minCompletionPercent",
    label: "Mission completion",
    direction: "at-least",
    unit: "percent",
    read: (metrics) => metrics.completionPercent,
  },
  minArrivalPercent: {
    id: "minArrivalPercent",
    label: "Fleet arrival",
    direction: "at-least",
    unit: "percent",
    read: (metrics) =>
      metrics.totalRobots === 0 ? 100 : (metrics.arrived / metrics.totalRobots) * 100,
  },
  maxSafetyHolds: {
    id: "maxSafetyHolds",
    label: "Safety holds",
    direction: "at-most",
    unit: "count",
    read: (metrics) => metrics.safetyHolds,
  },
  maxReplans: {
    id: "maxReplans",
    label: "Planner replans",
    direction: "at-most",
    unit: "count",
    read: (metrics) => metrics.replans,
  },
};

const orderedCriteria: (keyof AcceptanceCriteria)[] = [
  "minCompletionPercent",
  "minArrivalPercent",
  "maxSafetyHolds",
  "maxReplans",
];

export const evaluateScenario = (
  metrics: SimulationMetrics,
  criteria: AcceptanceCriteria,
): ScenarioEvaluation => {
  const checks = orderedCriteria.flatMap((id): AcceptanceCheck[] => {
    const threshold = criteria[id];
    if (threshold === undefined) return [];
    const definition = definitions[id];
    const actual = definition.read(metrics);
    const passed =
      definition.direction === "at-least" ? actual >= threshold : actual <= threshold;
    return [{ ...definition, actual, threshold, passed }];
  });

  return {
    passed: checks.length > 0 && checks.every((check) => check.passed),
    checks,
  };
};
