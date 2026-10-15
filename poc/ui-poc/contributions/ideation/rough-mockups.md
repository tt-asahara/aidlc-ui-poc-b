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
  - anchor: before-step:4
    order: 100
---

## fragment: before-step:4

### UI PoC evidence handoff

Run `node {{HARNESS_DIR}}/tools/ui-poc-b-routing.cjs plan --stage rough-mockups --facts <stage-facts.json>` and follow only the returned `use` entries. Generate self-contained, low-fidelity HTML rough previews and ui-poc-rough-contract.md as additional artifacts, following {{HARNESS_DIR}}/tools/ui-poc/contract.md. Preserve wireframes.md, user-flow.md and questions. Establish stable screen/state/AC IDs from the approved common scope; mark treatment-discovered requirements and provisional choices separately. Capture hashes for every HTML/CSS/JS/image/font asset. Record `skill-read` and `skill-applied` separately in ui-poc-skill-evidence.json and verify it before handoff. The evidence is an auditable stage attestation, not proof of model cognition. Do not perform the prototype skill's throwaway-branch workflow or apply its no-tests rule outside the isolated prototype assets. Unresolved routing, missing entrypoints, or an unrecorded required application blocks completion.

The plugin contract must have H2 sections Artifact References, Screen State Acceptance Mapping, Approval Evidence, and Testing Brief; exactly one fenced ui-poc-contract JSON object with schema=1, stage, arm A/B/C, assets [{path,sha256}], mappings [{screen,state,ac,asset,check}], and requiredMappings ["SCREEN-…/STATE-…/AC-…"]. Paths must remain inside this stage directory; hash every referenced local asset. For consuming code/test contracts include upstream {path,sha256,stage}, naming a byte-identical local copy of the prior contract, and require its real approval in the independently managed UI_POC_APPROVAL_LEDGER. Never fabricate that ledger. Rough/refined draft gates require no extra approval.

Read the installed runtime contract at {{HARNESS_DIR}}/tools/ui-poc/contract.md and the current arm’s {{HARNESS_DIR}}/tools/ui-poc/treatments/<arm>.json (lowercase a, b or c). Its source_lock resolves beside that JSON. Verify the selected commit and installed skill entrypoints before applying the treatment. These files are projected through the supported tools subtree; do not depend on uninstalled source docs or treatment directories.
