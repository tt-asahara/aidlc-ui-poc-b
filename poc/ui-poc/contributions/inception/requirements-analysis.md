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

Read ui-poc-rough-contract.md and its actual HTML assets alongside the core wireframes/user-flow. Carry stable screen/state identifiers into requirements and subsequent acceptance criteria. Separate provisional prototype decisions from explicitly approved scope and requirements; do not silently turn a visual placeholder into a settled requirement. Record unresolved decisions for the normal question flow and retain all core requirements outputs.
