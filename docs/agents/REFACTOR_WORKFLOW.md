# ♻️ Refactor Workflow

Use this workflow when changing structure without intentionally changing product behavior.

## Before editing

- Establish the current behavior from source and runtime.
- Identify why the refactor is needed.
- Identify architectural constraints.
- Search all consumers of the code being changed.
- Identify ownership/conflict boundaries.

## Refactor rules

- Preserve behavior unless a behavior change is explicitly part of the task.
- Prefer incremental changes over broad rewrites.
- Do not combine unrelated cleanup.
- Do not rename/move public contracts without tracing consumers.
- Keep domain boundaries intact.

## Verification

Before/after verification should establish that the relevant behavior remains intact.

Run the strongest available build/type/test checks and manually exercise affected flows when applicable.

If behavior changes intentionally, stop treating the work as a pure refactor and follow the Feature Workflow as well.

## Finish

Document architectural changes where they affect future agents.

Use `docs/agents/HANDOFF.md` and explicitly state what behavior was preserved and how it was verified.
