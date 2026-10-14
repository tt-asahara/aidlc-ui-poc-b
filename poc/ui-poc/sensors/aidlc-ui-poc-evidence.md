---
id: ui-poc-evidence
kind: deterministic
command: bun {{HARNESS_DIR}}/tools/aidlc-sensor-ui-poc-evidence.ts
default_severity: blocking
fire_on: gate
description: Verify UI contract asset hashes and stable mapping coverage; consumers require upstream approval evidence
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

No matches filter: every existing declared stage deliverable triggers verification of its sibling plugin contract, so an unrelated Markdown artifact cannot bypass the check. The core gate must still verify declared artifacts exist; this sensor cannot fire when no deliverable is dispatched. Rough and refined producer gates validate new evidence without adding a second approval. Code Generation requires the approved refined contract, and Build and Test requires the approved implementation contract. The ordinary engine gate remains the source of stage approval; the detached ledger captures its independently verified provenance.

The pinned dispatcher resolves a .ts basename, runs it with its own runtime, and consumes JSON `pass` plus `findings_count`. It does not execute an arbitrary shell prefix. Never replace this adapter with a guessed command API. Runtime composition/gate integration remains untested.
