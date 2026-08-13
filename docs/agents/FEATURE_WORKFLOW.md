# 🧩 Feature Workflow

Use this workflow when adding or materially changing a product feature.

## Before implementation

- Read `AGENT.MD` and `AGENT_RULES.md`.
- Read `docs/agents/WORKFLOW.md`.
- Check `docs/AGENT_STATE.md`, `PROGRESS.md` and `TASK_BOARD.md`.
- Inspect the existing implementation and relevant architecture docs.
- Identify the owning domain/agent.
- Claim conflicting scope before editing.

## Investigate

Confirm:

- existing state/store architecture
- data contracts/types
- existing UI/components
- persistence requirements
- asset requirements
- API/service dependencies
- runtime consumers
- verification path

Do not create a second implementation of an existing system without an explicit architectural reason.

## Plan

Define:

- user-visible behavior
- domain behavior
- data changes
- UI changes
- files to modify
- files that must remain untouched
- verification steps

## Implement

Build the smallest complete vertical slice possible.

Prefer:

`data/domain → state/service → UI → persistence/integration → verification`

Do not mark the feature complete when only the UI exists.

## Verify

Verify the actual user flow in the running application whenever possible.

Check:

- expected behavior
- edge cases relevant to the feature
- persistence/state restoration if applicable
- errors/console
- build/type correctness

## Document

Update only the documentation that has become factually different.

If the feature changes architecture, update the architecture documentation in the same change.

If the feature changes project status, update the task/progress/changelog records as appropriate.

## Finish

Use `docs/agents/HANDOFF.md`.

Do not claim `COMPLETE` until the feature has been verified according to `AGENT_RULES.md`.
