import { describe, expect, it } from "vitest";
import { parseScenarioJson } from "../src/sim/scenarioImport";
import { scenarios } from "../src/sim/scenarios";

describe("scenario JSON import", () => {
  it("parses a valid scenario against the project schema", () => {
    const result = parseScenarioJson(JSON.stringify(scenarios[0]));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.scenario).toEqual(scenarios[0]);
  });

  it("returns a useful path for invalid scenario data", () => {
    const invalid = structuredClone(scenarios[0]) as Partial<(typeof scenarios)[number]>;
    delete invalid.robots;

    const result = parseScenarioJson(JSON.stringify(invalid));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("/robots");
  });

  it("rejects malformed JSON before schema validation", () => {
    const result = parseScenarioJson('{"id":');

    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors[0]).toContain("Invalid JSON");
  });

  it("rejects unknown properties", () => {
    const invalid = { ...structuredClone(scenarios[0]), unexpected: true };

    const result = parseScenarioJson(JSON.stringify(invalid));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("additional properties");
  });
});
