# UI PoC B engineering work log

## 2026-10-15 — Deterministic Matt-skill stage harness

- Based work on `feature/ui-poc-foundation` at `2957057207c3a9d4471838492ccafe3dc0770596`; core remains unchanged.
- Re-read all core stage frontmatter/protocol surfaces, plugin contribution implementation, pinned Matt entrypoints, frontend-design, and the source lock.
- Added an explicit all-stage use / do-not-use / conditional matrix, machine-readable B routing, and a fail-closed evidence verifier that separates entrypoint-read attestations from applied inputs/outputs.
- Bounded prototype, grilling, and domain-modeling behavior so AI-DLC remains the sole owner of questions, artifacts, Testing Contracts, and approvals; disabled lifecycle `to-spec` publication.
- Local checks: 43 Node tests passed; official plugin validate passed; Claude plugin build passed; disposable compose had zero drops, compiled the graph, and was idempotent on its second pass.
- No live AI-DLC stage, human approval, approval receipt, tracker publication, or Claude model run is claimed by these checks.
- Review hardening: the router now rejects unselected/disabled skill events, validates installed entrypoints against source-lock Git blob SHA and byte size, binds facts and scope/record/attempt/Unit context, and requires bounded input values or real hashed files plus real hashed output files. Requirements Analysis and Domain Design now receive the blocking routing sensor through the supported additive sensor seam; skipped conditional stages create no sensor obligation.
- Negative and integration coverage now includes forbidden `to-spec`, modified vendored payload with matching self-reported SHA-256, retry-context reuse, symbolic-only outputs, missing routing logs through the adapter, and a real `aidlc-sensor.ts fire` producing `result: failed`. Combined local Node tests: 51 passed.

## 2026-10-14 — Pinned foundation and treatment payload

- Started `feature/ui-poc-foundation` from the unmodified AI-DLC v2.11.0 baseline at `6a378b53c0a4fe0641ed7d8de8dfff94264d5b6a`.
- Added the byte-identical shared `poc/ui-poc/` plugin scaffold from `tt-asahara/aidlc-ui-poc-a` commit `ad6afd9e2dd3901e09b17cb77713bf2a4ffe181b`. No official `core/`, `harness/`, build, or hook file was changed.
- Selected arm B through `poc/arm.json`.
- Installed Matt Pocock's pinned prototype (`UI.md` and `LOGIC.md`), grilling, domain-modeling, and to-spec skills from `mattpocock/skills@49dd158d1076134a641b33efb035946536778336`.
- Installed Anthropic's pinned frontend-design skill from `anthropics/skills@dbd4588f9e1033efb41dad4bef2f7947c8993d44`.
- Preserved the Matt MIT license and Anthropic Apache-2.0 license. All 15 installed payload files matched the Git blob SHA and byte size recorded in `poc/ui-poc/treatments/source-lock.json`; no extra skill files were present.

### Verification

- `node --test poc/ui-poc/tests/evidence.test.cjs`: 35 passed, 0 failed, 0 skipped.
- Dependency-free static source-contract check against the complete local AI-DLC v2.11.0 tree: 23 contribution targets and supported anchors passed; projected runtime documentation and treatment configs matched their source copies.
- Official AI-DLC plugin validate/build/compose, generated graph inspection, live model or CLI execution, real treatment invocation, browser evaluation, and approval-ledger trust controls were not run or claimed.
- No dependencies were installed, Bun was not introduced or invoked, and no approval or hook result was fabricated.
