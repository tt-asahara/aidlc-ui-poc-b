---
id: ui-poc-evidence
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-ui-poc-evidence.ts
default_severity: blocking
fire_on: gate
description: Verify UI contract chains plus Arm B routing facts, pinned skill payloads, and read/application evidence
category: ui-evidence
input_schema:
  output_path: string
  stage_slug: string
output_schema:
  pass: boolean
  findings_count: integer
  findings: string[]
timeout_seconds: 30
---

# UI evidence gate

No matches filter: every existing declared stage deliverable triggers verification. For Rough Mockups, Refined Mockups, Code Generation, and Build and Test it validates the sibling plugin contract. For every B stage with routing rules it also requires `ui-poc-routing-facts.json` when conditional facts exist and validates `ui-poc-skill-evidence.json` through the pinned router. Requirements Analysis and Domain Design bind this sensor specifically for that routing gate. If either conditional stage is skipped by the engine, it emits no deliverable and the sensor creates no requirement. The core gate must still verify declared artifacts exist; this sensor cannot fire when no deliverable is dispatched.

Rough and refined producer gates validate new evidence without adding a second approval. Code Generation requires the approved refined contract, and Build and Test requires the approved implementation contract. The ordinary engine gate remains the source of stage approval; the detached ledger captures its independently verified provenance. Routing logs cannot contain application/read evidence for an unselected or disabled skill, and installed entrypoint bytes must match the repository, commit, byte size, and Git blob SHA in `source-lock.json`.

The pinned dispatcher resolves a .ts basename, runs it with its own runtime, and consumes JSON `pass` plus `findings_count`. It does not execute an arbitrary shell prefix. Never replace this adapter with a guessed command API.
