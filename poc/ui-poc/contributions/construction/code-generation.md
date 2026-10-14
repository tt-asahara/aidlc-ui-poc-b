---
target: code-generation
plugin: ui-poc
adds:
  scopes:
    - ui-poc-comparison
  produces:
    - ui-poc-implementation-contract
  sensors:
    - ui-poc-evidence
  consumes:
    - artifact: ui-poc-refined-contract
      required: true
fragments:
  - anchor: before-step:1
    order: 100
---

## fragment: before-step:1

### UI PoC evidence handoff

Read the approved refined contract, its assets and core UI specifications, stable state/AC mapping, unit definition/story map, functional design, and the engine-produced developer/testing brief. Preserve the exact core Testing Contract and its hash. Include the real selected Matt treatment when this arm calls for it. Before completion create ui-poc-implementation-contract.md, carrying a bounded local evidence copy and exact SHA-256 of the refined contract in upstream; require its independently captured stage-approval receipt. Preserve source-manifest.json, traceability, plan, unit-test-instructions and code-summary. Do not report missing inputs as read or unexecuted tests as passed.

The plugin contract must have H2 sections Artifact References, Screen State Acceptance Mapping, Approval Evidence, and Testing Brief; exactly one fenced ui-poc-contract JSON object with schema=1, stage, arm A/B/C, assets [{path,sha256}], mappings [{screen,state,ac,asset,check}], and requiredMappings ["SCREEN-…/STATE-…/AC-…"]. Paths must remain inside this stage directory; hash every referenced local asset. For consuming code/test contracts include upstream {path,sha256,stage}, naming a byte-identical local copy of the prior contract, and require its real approval in the independently managed UI_POC_APPROVAL_LEDGER. Never fabricate that ledger. Rough/refined draft gates require no extra approval.

Read the installed runtime contract at {{HARNESS_DIR}}/tools/ui-poc/contract.md and the current arm’s {{HARNESS_DIR}}/tools/ui-poc/treatments/<arm>.json (lowercase a, b or c). Its source_lock resolves beside that JSON. Verify the selected commit and installed skill entrypoints before applying the treatment. These files are projected through the supported tools subtree; do not depend on uninstalled source docs or treatment directories.
