# Jules Queue Orchestrator — Setup (v3)

## Canonical roadmap architecture

Artificer now has **one roadmap only**:

```text
ROADMAP.md
```

The root `ROADMAP.md` is the authoritative source for:

- current priority
- `### Active`
- `### Ready`
- `### Blocked`
- `### Human Review`
- Jules dispatch state
- phase acceptance status

The detailed implementation checklist lives in:

```text
 docs/TASK_BOARD.md
```

Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` and the relevant module/system documentation.

There must be **no second roadmap copy** under `docs/` or `.github/workflows/`.

## Jules queue contract

The orchestrator reads only:

```text
ROADMAP.md → ## Now
```

Flow:

1. Jules dispatches the first unchecked task under `### Ready`.
2. The task moves to `### Active`.
3. Jules works from `main` and creates a PR.
4. The PR is reviewed and merged manually.
5. The human reviewer checks the corresponding task as `[x]` only after runtime, architecture and documentation verification.
6. The next orchestrator run removes the confirmed task from `### Active` and dispatches the next `### Ready` task.

`### Blocked` and `### Human Review` are never auto-dispatched.

## File tree

```text
ROADMAP.md

docs/
  TASK_BOARD.md
  ARCHITECTURE_STATUS.md
  modules/
  systems/

.github/
  jules-queue-state.json
  workflows/
    jules-orchestrator.yml
    ci.yml
```

`.github/workflows/` contains executable automation and its supporting setup documentation only. It is **not** a roadmap location.

## Orchestrator implementation

`scripts/jules-orchestrator.mjs` uses:

```text
const ROADMAP_PATH = 'ROADMAP.md';
```

This is intentional. Do not change the orchestrator to read a generated or duplicated roadmap file.

## Controlled workflow

The workflow currently uses manual `workflow_dispatch` and keeps the scheduled heartbeat disabled until the full queue cycle has been manually verified.

When enabled, the heartbeat must continue to operate against the root `ROADMAP.md`.

## What the orchestrator will never do

- Read or write a roadmap copy under `docs/`.
- Read or write a roadmap copy under `.github/workflows/`.
- Dispatch tasks from `### Blocked` or `### Human Review`.
- Mark a task `[x]` merely because Jules reports completion.
- Treat a merged PR as sufficient proof of completion.
- Create a second task queue to work around the canonical roadmap.

## Maintenance rule

If a future change needs roadmap automation, modify the orchestrator against the root `ROADMAP.md` rather than creating another roadmap representation.

*Last Updated: 2026-08-31*
