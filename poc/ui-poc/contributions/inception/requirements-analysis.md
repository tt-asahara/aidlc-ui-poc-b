---
target: requirements-analysis
plugin: ui-poc
adds:
  scopes:
    - ui-poc-comparison
  consumes:
    - artifact: ui-poc-rough-contract
      required: true
fragments:
  - anchor: after-step:1
    order: 100
---

## fragment: after-step:1

### Rough UI evidence as requirements input

Read ui-poc-rough-contract.md and its actual HTML assets alongside the core wireframes/user-flow. Run the B routing plan with explicit `unresolved_requirement_decisions` and `domain_language_conflict` facts. Apply returned methods only inside this stage's existing question rounds: grilling may organize the current frontier, but AI-DLC asks, records, and resumes it; domain-modeling may sharpen canonical language and boundaries, but not types, validation, allowed values, cardinality, or implementation. Do not add a separate interview, shared-understanding confirmation, approval, or tracker publication. Carry stable screen/state identifiers into requirements and subsequent acceptance criteria. Separate the approved common comparison brief from treatment-discovered requirements and provisional prototype decisions; do not silently turn a visual placeholder into a settled requirement. Record and verify read/application evidence before handoff; missing facts or required evidence block completion.
