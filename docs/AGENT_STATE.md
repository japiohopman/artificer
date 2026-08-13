# 🤖 Agent State

This is the **operational state** of the Artificer agent workflow.

It is intentionally separate from roadmap and architecture documentation:
- `PROGRESS.md` describes project-level implementation status.
- `TASK_BOARD.md` describes work items.
- `AGENT_STATE.md` describes what agents should know before starting or handing off work.

## Current Project State

**Last reviewed:** 2026-08-13

- **Project phase:** Phase 2 → Phase 3 transition.
- **Current engineering focus:** DM DevKit and Battle Map authoring.
- **Primary architectural concern:** Keep authored BattleMap data separate from runtime `CombatGrid` state.
- **AI integration:** Phase 3 work follows the current authoring/runtime foundations.
- **Documentation priority:** Keep agent navigation, implementation status and architecture synchronized with code.

## Active Constraints

1. Code is the implementation source of truth. Documentation must not be used as evidence that a feature works.
2. Do not mark work complete until the affected behavior has been verified according to `AGENT_RULES.md` and the relevant workflow.
3. Do not silently modify another agent's domain or restructure unrelated modules.
4. Do not start lower-priority future systems while current Critical/High work remains open unless the task explicitly authorizes it.
5. Keep authored content, runtime state, assets and domain stores within their documented architectural boundaries.

## Current Agent Work

This section is intentionally maintained only when an agent has claimed a task that could conflict with parallel work.

| Agent | Task | Scope | Status | Conflict Notes |
|---|---|---|---|---|
| — | — | — | No active claim recorded | — |

## Handoff Rule

When an agent begins work that could overlap another agent's scope, it should add a claim here before editing. When the work is complete or abandoned, the claim must be removed and the handoff recorded according to `docs/agents/HANDOFF.md`.

Do not treat this file as a historical log. It represents the current operational state only.
