---
target: rough-mockups
plugin: ui-poc
adds:
  scopes:
    - ui-poc-comparison
  produces:
    - ui-poc-rough-contract
  sensors:
    - ui-poc-evidence
fragments:
  - anchor: after-step:4
    order: 100
---

## fragment: after-step:4

### UI PoC evidence handoff

Generate self-contained HTML rough previews and ui-poc-rough-contract.md as additional artifacts, following {{HARNESS_DIR}}/tools/ui-poc/contract.md. Preserve wireframes.md, user-flow.md and questions. Establish stable screen/state/AC IDs from the approved scope; mark provisional requirements clearly. Capture hashes for every HTML/CSS/JS/image/font asset. Use the arm’s actually pinned design treatment and record actual entrypoint reads; unresolved treatment means blocked, not simulated invocation.

The plugin contract must have H2 sections Artifact References, Screen State Acceptance Mapping, Approval Evidence, and Testing Brief; exactly one fenced ui-poc-contract JSON object with schema=1, stage, arm A/B/C, assets [{path,sha256}], mappings [{screen,state,ac,asset,check}], and requiredMappings ["SCREEN-…/STATE-…/AC-…"]. Paths must remain inside this stage directory; hash every referenced local asset. For consuming code/test contracts include upstream {path,sha256,stage}, naming a byte-identical local copy of the prior contract, and require its real approval in the independently managed UI_POC_APPROVAL_LEDGER. Never fabricate that ledger. Rough/refined draft gates require no extra approval.

Read the installed runtime contract at {{HARNESS_DIR}}/tools/ui-poc/contract.md and the current arm’s {{HARNESS_DIR}}/tools/ui-poc/treatments/<arm>.json (lowercase a, b or c). Its source_lock resolves beside that JSON. Verify the selected commit and installed skill entrypoints before applying the treatment. These files are projected through the supported tools subtree; do not depend on uninstalled source docs or treatment directories.
