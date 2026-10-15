---
target: domain-design
plugin: ui-poc
adds:
  scopes:
    - ui-poc-comparison
fragments:
  - anchor: after-step:1
    order: 100
---

## fragment: after-step:1

### B domain-language adapter

Run the B routing plan with explicit `unresolved_domain_terms_or_boundaries`. When true, use domain-modeling only to challenge canonical terms, entity ownership, and bounded-context/component boundaries and to identify ADR candidates that satisfy its three tests. Do not move types, validation, allowed values, cardinality, detailed state machines, framework code, or SQL into Domain Design. AI-DLC's component catalogue, decision records, traceability, question flow, and approval remain authoritative. Record and verify read/application evidence; a missing fact blocks completion.
