# Shared A/B/C AI-DLC UI PoC foundation

Initial integration scaffold, prepared for version-controlled A/B/C repositories. This checkpoint contains locally tested plugin source and provenance records; it does not establish upstream installation, a live model run, treatment invocation in a lifecycle stage, or human artifact approval. Repository-level WORKLOG.md records publication checkpoints.

Pinned API research: awslabs/aidlc-workflows v2.11.0, commit `6a378b53c0a4fe0641ed7d8de8dfff94264d5b6a`. Only selected source files are available, not a complete buildable checkout. Source manifest and validation limitations are in docs/verification.md.

The source plugin is named `ui-poc` and is intended for `poc/ui-poc/` in each comparison repository, preserving directory/manifest identity. The shared source is byte-identical across A/B/C; repository-level `poc/arm.json` selects the intended treatment through its config path. That file records selection only and is not an upstream runtime configuration API. Actual build, compose, and stage invocation remain unverified. Treatment definitions are in `treatments/a.json`, `b.json`, and `c.json`. Do not copy ad-hoc changes into core.

## Local verification

```
node --test tests/evidence.test.cjs
python3 tests/check-source-contract.py --source-root /path/to/pinned-source --tree /path/to/tree.json
node tools/ui-poc-evidence.cjs --stage refined-mockups --output-path /actual/stage/mockups.md
```

The source-contract check needs the inspected pinned source directory and corresponding Git tree JSON. You may set UI_POC_SOURCE_ROOT and UI_POC_UPSTREAM_TREE instead of its CLI flags. The sensor command is an invocation example, not a completed live check. Without valid evidence and an independently managed `UI_POC_APPROVAL_LEDGER`, the sensor fails closed. See docs/contract.md for the format and trust assumptions.

## Treatment status

A: frontend-design. B: Matt custom extension plus frontend-design. C: Matt custom extension plus Impeccable. Public Anthropic and Matt sources are now pinned in treatments/source-lock.json; that separate research is not evidence that any lifecycle stage invoked them. C is selected as Matt plus the historical official Impeccable frontend-design component at 209444a9d552c18bcaa74e26bf66a25fc568a767, including its seven reference files, conditional teach-impeccable dependency, LICENSE and NOTICE.md. It is explicitly a historical component comparison, not latest full Impeccable. The full latest runtime/hooks and historical critique script are excluded. The user’s previous custom stage-2.5 HTML extension is unavailable; obtaining it is necessary only to reproduce that exact implementation. This new integration does not claim to reproduce it. Do not silently substitute generic prompts or a differently configured C arm.

## Required remaining verification

1. Obtain the complete pinned upstream build through an authorized route; run its actual plugin validate, build and compose tests. No archive fetch or dependency installation was performed here.
2. Verify emitted sensor command resolution and blocking gate behavior in each chosen harness, including missing declared deliverable handling and scope membership. Confirm no compose drops and idempotent second compose.
3. Verify the pinned public treatment payloads and actual stage entrypoint reads, preserving license/provenance. Use C’s selected historical component and exact dependency/license list; do not install the latest runtime/hooks. Obtain the old custom HTML extension only if exact reproduction is required.
4. Provision trusted human approval capture/ledger outside the agent-writable workspace. Confirm engine gate approval separately.
5. Resolve live CLI runtime's read-only-home blocker through an authorized environment/configuration. No auth or security settings were changed.
6. Run actual A/B/C lifecycle sessions on the same approved request and unit/screen/state/AC inventory, with recorded stage directives, handoffs, asset hashes, source manifests, testing briefs, audit events and measured UI results.
7. Only then compare outcomes. Local synthetic checker fixtures cannot establish skill invocation, harness integration, design quality or user approval.

## Installation boundary

Enable this plugin only in the isolated A/B/C comparison repositories. Contributions modify their target stages whenever the plugin is enabled: adds.scopes adds scope membership, but it does not condition the other additions on that scope. Disable/remove the plugin before unrelated stock-scope workflows. Runtime guidance and treatment configs live under the projected tools/ui-poc/ subtree; root docs/treatments are source/research copies. Official build/compose validation is still required.
