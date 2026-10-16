---
name: aidlc-setup
description: Set up this repository's pinned AI-DLC v2.11.0 Claude runtime, Arm B UI comparison plugin, routing companion, and fixed skills in another product repository while preserving existing product work.
argument-hint: "[B checkout path] [product repository path]"
user-invocable: true
---

# Set up AI-DLC B

Invoke from the B checkout containing this skill. Setup is a reviewable transfer; invocation permits inspection and dry-run only, not product writes.

## Establish boundaries

1. Resolve absolute `SRC` and `PRODUCT`. Confirm this B source, an isolated comparison target, project scope, trust/permissions, and whether only preview or the reviewed write set is authorized. Never change authentication, global/shared settings, or model configuration.
2. Inspect both repositories with `git -C <path> status --short --branch`. Preserve all tracked, untracked, ignored, and uncommitted product files. Never replace existing `CLAUDE.md`, `AGENTS.md`, `.claude`, skills, hooks, settings, or plugins.
3. Read [`../../../poc/ui-poc/README.md`](../../../poc/ui-poc/README.md), [`../../../poc/ui-poc/docs/verification.md`](../../../poc/ui-poc/docs/verification.md), [`../../../poc/ui-poc/docs/contract.md`](../../../poc/ui-poc/docs/contract.md), [`../../../poc/ui-poc/docs/b-stage-skill-matrix.md`](../../../poc/ui-poc/docs/b-stage-skill-matrix.md), [`../../../poc/ui-poc/treatments/b.json`](../../../poc/ui-poc/treatments/b.json), its [`source-lock.json`](../../../poc/ui-poc/treatments/source-lock.json), and [`../../../poc/skill-installation.json`](../../../poc/skill-installation.json). Do not relax comparison conditions or assume greenfield.

## Build and preview

From `SRC`, stop on failure:

```bash
bun install --frozen-lockfile
bun scripts/package.ts claude
bun dist/claude/.claude/tools/aidlc-plugin-build.ts poc/ui-poc claude --json
bun "$SRC/dist/claude/.claude/tools/aidlc.ts" config --from "$SRC/dist/claude" --harness claude --project-dir "$PRODUCT" --mcp none --dry-run
```

The runtime source is exactly `SRC/dist/claude`; the marketplace is `SRC/poc/ui-poc/dist/claude`. Confirm the plugin contains `tools/ui-poc-b-routing.cjs`, `tools/ui-poc/b-stage-routing.json`, treatment/source-lock/runtime-contract copies, and the sensor adapter. Never pass `dist` or `.claude` to `--from`, edit generated output, or use `--force`.

Show the target, writes, and collisions. Stop for review on a dirty target, differing path, or effect on existing settings/hooks/skills/plugins. A successful dry run is not authorization. Apply only after explicit approval by rerunning the identical config command without `--dry-run`.

## Place the fixed B payload without clobbering

Compare complete source and product-relative directories: `.agents/skills/{prototype,grilling,domain-modeling,to-spec,frontend-design}` and `.agents/skills/LICENSES/mattpocock-skills`. If absent, include a complete copy in the reviewed write set; if byte-identical, leave it; if different, stop for user resolution. Never merge or overwrite. Verify paths, bytes, commits, and licenses against the installation manifest, treatment B, and source lock. Do not fetch latest or substitute implementations.

## Install and verify

Give a handoff with resolved paths, approved writes, exact commands, and first checks. Shell `cd` does not switch Claude Code projects. Open a new Claude session rooted at `PRODUCT`; verify the host root and `git rev-parse --show-toplevel` both equal `PRODUCT`, then run at project scope:

```text
/plugin marketplace add <SRC>/poc/ui-poc/dist/claude
/plugin install aidlc-ui-poc@aidlc-plugins
```

Preserve existing plugins. Start another PRODUCT-rooted session for composition, inspect `/plugin` **Installed** (or `claude plugin list`), then `/aidlc --doctor`. Confirm `ui-poc-comparison`, zero unexpected compose drops, B treatment, routing verifier/config, runtime companion, sensor, and every fixed skill/license. `/plugin list` is not the installed-plugin check.

Record Arm B, read installed treatment/source lock/routing/config/skills, invoke `/aidlc --scope ui-poc-comparison`, preserve the user's brownfield/greenfield decision, and stop after rough-mockups review absent separate authorization. Never fabricate approval ledger entries or treat routing logs as proof of model cognition.

Report resolved paths, builds, dry-run, authorized writes, preserved collisions, payload/license checks, plugin/doctor/compose/routing checks, and stop point. Separate static/synthetic evidence from live execution and human approval.
