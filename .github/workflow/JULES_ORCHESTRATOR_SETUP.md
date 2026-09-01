# Jules Queue Orchestrator — Setup (v2)

## Canonical roadmap

The repository has one canonical current-priority roadmap:

```text
ROADMAP.md
```

The Jules orchestrator reads the `## Now` / `### Ready` section from that file. Do not maintain a second roadmap copy under `.github/workflows/` or `docs/`.

`docs/TASK_BOARD.md` is the detailed execution checklist behind the canonical roadmap. Architecture/design details belong in `docs/modules/` and `docs/systems/`.

The orchestrator rules are:
1. Jules only dispatches from `### Ready`.
2. `### Active` contains at most one task in v1.
3. `### Blocked` and `### Human Review` are never auto-dispatched.
4. A task is not complete because Jules says "done"; completion requires human review, testing and architecture/doc checks.
5. A merge alone does not count as completion; the roadmap checkbox is deliberately human-confirmed before the queue advances.

## File tree

```text
.github/workflows/jules-orchestrator.yml
.github/jules-queue-state.json
scripts/jules-orchestrator.mjs
ROADMAP.md
```

The old roadmap snapshots:

```text
.github/workflows/ROADMAP_Now_section_v2.md
docs/ROADMAP.md
```

are intentionally retired. Their content must not be recreated. The root `ROADMAP.md` is the single dispatch source.

## One-time manual setup

1. Install the Jules GitHub app on this repo (jules.google.com), if not already installed.
2. Create an API key in Jules settings.
3. Add it as the repository secret `JULES_API_KEY`. Never commit the key.
4. Confirm/update `JULES_SOURCE` in the workflow if the configured source differs from `sources/github/japiohopman/artificer`.

## Controlled test cycle

1. Keep the canonical `ROADMAP.md` `### Ready` queue reviewed and ordered.
2. Actions → Jules Queue Orchestrator → Run workflow manually.
3. Confirm it moves the first Ready task to Active and starts the Jules session.
4. Review the resulting PR.
5. Merge the PR when verified.
6. Manually mark the corresponding Active roadmap task `[x]` only after verification.
7. Run the workflow again to advance the queue.
8. Keep the cron disabled until the controlled cycle has been observed end to end.

## What the orchestrator will never do

- Touch anything under `### Blocked` or `### Human Review`.
- Mark a roadmap checkbox itself.
- Advance the queue on a merge alone.
- Read a retired roadmap snapshot instead of the canonical root `ROADMAP.md`.
