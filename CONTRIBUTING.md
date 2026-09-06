# Contributing to NovaForge Sim

Thank you for helping build an approachable autonomy simulation lab. Contributions of code, scenarios, tests, documentation, and design feedback are welcome.

## Start here

1. Fork and clone the repository.
2. Install Node.js 20+ and pnpm 9+.
3. Run `pnpm install`.
4. Run `pnpm test` and `pnpm typecheck`.
5. Start the interface with `pnpm dev`.

## Find work

- Issues labeled `good first issue` should be independently approachable.
- Issues labeled `help wanted` have a defined direction but may require design discussion.
- For a large feature, open an issue before implementation so the interface can be agreed on early.

## Project conventions

- Keep the simulation core independent from React and browser APIs.
- Preserve deterministic behavior. Randomness must come from `SeededRandom`.
- Add a test for new planners, sensors, state transitions, and bug fixes.
- Prefer small modules with explicit types over large frameworks.
- Document units in names or comments when they are not obvious.
- Do not present simulation output as proof of real-world safety.

## Pull-request checklist

- [ ] The change has a focused purpose.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] New behavior includes tests or a clear explanation of why tests are not applicable.
- [ ] User-facing behavior is documented.
- [ ] Visual changes include a screenshot in the pull request.
- [ ] No generated build output is committed.

## Scenario contributions

A good scenario explains the behavior it is intended to test. Include:

- A stable seed
- Start and goal positions that do not intersect obstacles
- A short description of the risk or behavior being tested
- Expected completion or safety metrics
- Explicit `acceptance` thresholds that describe a passing run
- At least one deterministic batch run in the pull-request description

Validate the file against `schema/scenario.schema.json` before submission.

## Commit messages

Use short, imperative messages, for example:

```text
Add radar occlusion model
Fix diagonal planner corner cutting
Document scenario acceptance metrics
```

## Community standards

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Please report security issues through the process in [SECURITY.md](SECURITY.md), not through a public issue.
