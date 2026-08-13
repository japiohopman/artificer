# 🤖 Artificer Agentic Workflow

This document defines the standard operating workflow for AI agents working in Artificer.

The goal is not to make agents follow bureaucracy. The goal is to make parallel agents behave like one coherent engineering team.

## 1. ORIENT

Before editing anything:

1. Read `AGENT.MD`.
2. Read `AGENT_RULES.md`.
3. Read `docs/AGENT_STATE.md`.
4. Read `docs/PROGRESS.md`.
5. Read `docs/TASK_BOARD.md`.
6. Read the relevant architecture/module documentation.
7. Inspect the actual source files that implement the affected behavior.

Do not infer implementation from documentation alone.

## 2. CLASSIFY THE REQUEST

Identify the work type:

- Feature
- Bug fix
- Refactor
- UI/UX
- Data/content
- Asset
- Documentation
- Architecture
- Tooling/DevKit

Then use the appropriate workflow/playbook when one exists.

## 3. CHECK PRIORITY

Confirm the requested work belongs to the current project focus.

Do not start unrelated future systems while Critical/High current work remains open unless the task explicitly authorizes it.

If the request conflicts with the current roadmap, stop and report the conflict before implementing.

## 4. CLAIM SCOPE

Before editing shared or potentially conflicting files, inspect `docs/AGENT_STATE.md` for active claims.

If the work could overlap another agent:

1. Record your task, scope and status in the active-claim table.
2. Identify files/directories you will modify.
3. Identify known conflict risks.
4. Do not silently take over another agent's domain.

Keep claims small and specific.

## 5. INVESTIGATE

Before writing code:

- Locate the existing implementation.
- Identify stores/state involved.
- Identify data contracts/types.
- Identify callers and consumers.
- Identify existing tests/verification.
- Identify relevant assets.
- Identify architectural boundaries.

Prefer extending existing systems over creating parallel implementations.

## 6. PLAN

Write a short internal implementation plan before making substantial changes.

The plan should answer:

- What changes?
- Why?
- Which files?
- Which existing system is reused?
- What must remain unchanged?
- How will it be verified?

For large or cross-domain changes, document the plan in the handoff or task context before implementation.

## 7. IMPLEMENT

Make the smallest coherent change that satisfies the request.

Rules:

- Follow existing naming and architecture.
- Do not silently refactor unrelated code.
- Do not duplicate existing domain systems.
- Do not invent APIs or data contracts without evidence.
- Keep authored content separate from runtime state where architecture requires it.
- Keep UI concerns separate from domain logic where existing architecture does so.

## 8. VERIFY

Verification is mandatory.

At minimum, when applicable:

1. Run the relevant build/type check.
2. Run the relevant test(s).
3. Start the application.
4. Open the affected screen/flow.
5. Exercise the changed behavior.
6. Check the browser console/runtime for relevant errors.

If the behavior cannot be observed, do not claim it is verified.

A task is not complete merely because the code compiles.

## 9. DOCUMENT

Update documentation when the change affects project truth.

Possible updates include:

- `docs/TASK_BOARD.md`
- `docs/PROGRESS.md`
- `docs/CHANGELOG.md`
- relevant module/system documentation
- architecture documentation
- `DOCS_INDEX.md` when new documentation is introduced

Documentation must describe what is actually true after verification.

Do not turn planned work into implemented work through documentation.

## 10. UPDATE OPERATIONAL STATE

If you created an active claim, remove it when the work is complete or abandoned.

Update `docs/AGENT_STATE.md` only for current operational information. Do not turn it into a historical changelog.

## 11. HANDOFF

Every substantial task ends with a concise handoff containing:

- Completed
- Files changed
- Verification performed
- Verification not performed
- Known issues
- Documentation updated
- Architectural decisions
- Recommended next step
- Any files another agent should avoid touching immediately

Use `docs/agents/HANDOFF.md` as the standard format.

## 12. DONE MEANS DONE

A task may be marked complete only when:

- Scope was respected.
- Existing implementation was inspected.
- Code/content was changed as required.
- Relevant verification passed.
- Runtime behavior was observed when applicable.
- Documentation reflects reality.
- Active claims were cleaned up.
- Handoff information exists for work another agent may continue.

An honest incomplete state is preferable to a false completion.

## 13. WHEN BLOCKED

Do not improvise around an architectural blocker silently.

Record:

- What is blocked.
- Why it is blocked.
- What was investigated.
- What alternatives were considered.
- What decision is required.

If another agent owns the blocking domain, hand the decision to that owner.

## 14. WHEN YOU DISCOVER A BROADER PROBLEM

Do not automatically fix it.

Classify it as:

- required for current task
- related follow-up
- unrelated technical debt
- architectural concern

Only include it in the current change when it is necessary for correctness or explicitly authorized.

## 15. SOURCE-OF-TRUTH ORDER

When information conflicts, use this order:

1. Running code/runtime behavior
2. Current type/data contracts and tests
3. Architecture documentation
4. Current project state/task documentation
5. Historical documentation
6. Agent assumptions

Never use an outdated document to override verified implementation behavior.

## 16. HANDOFF TO THE NEXT AGENT

A good agent should leave the repository easier for the next agent to understand than it was before.

The next agent should be able to determine:

- what changed
- why it changed
- what is verified
- what remains
- what not to touch
- where to continue

This is the core principle of the Artificer agentic workflow:

> **Agents do not merely complete tasks. They maintain continuity of engineering state.**
