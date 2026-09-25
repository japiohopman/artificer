# Jules Queue Orchestrator — Legacy Path Disabled

> **Migration status: Issue #306**
>
> The ROADMAP/TASK_BOARD-driven Jules dispatcher described by this document is retired.
> The GitHub Actions workflow remains as a safety kill-switch only and **must not dispatch Jules**.

## Current contract

The repository is migrating from a mixed ROADMAP/TASK_BOARD/Jules queue model to an **Issue-first execution workflow**.

During this migration:

- `ROADMAP.md` is **not** an execution queue for Jules.
- `docs/TASK_BOARD.md` is **not** an execution queue for Jules.
- `scripts/jules-orchestrator.mjs` is intentionally hard-disabled.
- `.github/workflows/jules-orchestrator.yml` performs no Jules API calls and makes no repository mutations.
- No legacy `### Ready` entry may be dispatched.

## Safety behavior

Running **Actions → Jules Queue Orchestrator → Run workflow** is safe during the migration. It only reports that the legacy dispatcher is disabled.

The workflow deliberately has no repository write permission and does not check out the repository or invoke the legacy orchestrator.

## Do not restore the old path

Do **not** re-enable the ROADMAP/TASK_BOARD dispatcher by restoring its API call, granting it write permissions, or reintroducing automatic mutation of `ROADMAP.md` / `.github/jules-queue-state.json`.

The replacement Issue-first orchestration contract is being implemented under **Issue #306** as independently reviewable steps.

## Historical reference

The previous v2 dispatcher operated on:

`ROADMAP.md` → `### Ready` → Jules session → PR → manual roadmap confirmation.

That workflow is historical context only. It is not an active execution mechanism.
