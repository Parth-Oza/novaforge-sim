import Ajv2020 from "ajv/dist/2020";
import scenarioSchema from "../../schema/scenario.schema.json";
import type { ErrorObject } from "ajv";
import type { Scenario } from "./types";

export type ScenarioImportResult =
  | { ok: true; scenario: Scenario }
  | { ok: false; errors: string[] };

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateScenario = ajv.compile<Scenario>(scenarioSchema);

const formatValidationError = (error: ErrorObject): string => {
  let path = error.instancePath || "/";
  if (error.keyword === "required") {
    const missingProperty = String(error.params.missingProperty);
    path = `${path === "/" ? "" : path}/${missingProperty}`;
  }
  return `${path || "/"}: ${error.message ?? "is invalid"}`;
};

export const parseScenarioJson = (source: string): ScenarioImportResult => {
  let candidate: unknown;
  try {
    candidate = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown JSON error";
    return { ok: false, errors: [`Invalid JSON: ${message}`] };
  }

  if (!validateScenario(candidate)) {
    return {
      ok: false,
      errors: (validateScenario.errors ?? []).map(formatValidationError),
    };
  }
  return { ok: true, scenario: structuredClone(candidate) };
};
