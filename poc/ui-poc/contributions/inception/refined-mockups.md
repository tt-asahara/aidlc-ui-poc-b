---
target: refined-mockups
plugin: ui-poc
adds:
  scopes:
    - ui-poc-comparison
  produces:
    - ui-poc-refined-contract
  sensors:
    - ui-poc-evidence
  consumes:
    - artifact: ui-poc-rough-contract
      required: true
fragments:
  - anchor: after-step:4
    order: 100
---

## fragment: after-step:4

### UI PoC evidence handoff

Read the rough contract, actual wireframes and user-flow, requirements and stories. Produce refined HTML previews plus ui-poc-refined-contract.md without replacing mockups.md, interaction-spec.md, design-system-mapping.md or accessibility-checklist.md. Carry stable screen/state/AC IDs; explain changed mappings for review. Capture every referenced asset hash and explicit testing expectations. Use the actual selected design treatment. Do not claim the new draft is already human-approved; ordinary stage approval follows this check.

The plugin contract must have H2 sections Artifact References, Screen State Acceptance Mapping, Approval Evidence, and Testing Brief; exactly one fenced ui-poc-contract JSON object with schema=1, stage, arm A/B/C, assets [{path,sha256}], mappings [{screen,state,ac,asset,check}], and requiredMappings ["SCREEN-…/STATE-…/AC-…"]. Paths must remain inside this stage directory; hash every referenced local asset. For consuming code/test contracts include upstream {path,sha256,stage}, naming a byte-identical local copy of the prior contract, and require its real approval in the independently managed UI_POC_APPROVAL_LEDGER. Never fabricate that ledger. Rough/refined draft gates require no extra approval.

Read the installed runtime contract at {{HARNESS_DIR}}/tools/ui-poc/contract.md and the current arm’s {{HARNESS_DIR}}/tools/ui-poc/treatments/<arm>.json (lowercase a, b or c). Its source_lock resolves beside that JSON. Verify the selected commit and installed skill entrypoints before applying the treatment. These files are projected through the supported tools subtree; do not depend on uninstalled source docs or treatment directories.
