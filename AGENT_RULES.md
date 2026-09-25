# 🛑 Agent Ground Rules

> Read this alongside [AGENT.MD](./AGENT.MD). The assigned GitHub Issue is the persistent execution contract.

These rules define how work is performed in Artificer. They are deliberately separate from task selection so that repository-wide rules cannot recreate an alternate execution queue.

## 1. Work from the Issue contract

The assigned GitHub Issue defines:

- the goal and scope;
- acceptance criteria;
- safety and architecture constraints;
- verification requirements;
- canonical references;
- handoff expectations.

Do not invent missing scope from `ROADMAP.md`, `GOALS.md`, `docs/TASK_BOARD.md`, old named-agent instructions, or unrelated documentation.

## 2. Protect canonical ownership

Before extending a domain:

- identify its canonical state owner;
- identify the mutation/transaction boundary;
- identify derived calculation or selector boundaries;
- identify persistence and compatibility constraints;
- identify presentation consumers.

Do not create a parallel store, duplicate domain model, or hidden compatibility layer merely because an existing module is inconvenient.

## 3. Respect specialist boundaries

The repository specialist contracts under `.github/agents/` define domain boundaries.

If work crosses a specialist boundary:

- state that explicitly in the implementation summary;
- keep the change within the assigned Issue;
- hand off adjacent concerns rather than silently absorbing them into the current task.

Specialists are constraints and routing contracts, not parallel project managers.

## 4. Verify before claiming completion

A green build, a passing unit test, or a Jules completion message is not by itself proof that the requested behavior is complete.

Use the verification specified by the Issue and the applicable repository gates. When runtime verification is required but unavailable, report that limitation explicitly.

## 5. Keep documentation factual

Documentation must describe the current repository, not an imagined future state.

When a change establishes or changes an architectural/workflow contract:

- update the affected canonical documentation;
- distinguish implemented, partial, placeholder, and missing behavior;
- avoid presenting a design proposal as an existing capability.

## 6. Repository hygiene

- Never commit vendored/reference repositories or downloaded third-party code as implementation.
- Do not add binary assets over 1MB without explicitly flagging the change and checking the asset registry/pipeline.
- Keep generated files synchronized with the repository's documented generation process.
- Do not perform unrelated cleanup during an Issue unless it is required to preserve the architectural contract.

## 7. Handle errors with evidence

When a build or runtime error is encountered:

- record the failure and its cause in the appropriate error record when required by the project;
- verify the fix;
- include the relevant command/result in the PR or handoff evidence.

Do not replace evidence with an unchecked claim that the problem is resolved.

## 8. Use the Phase Safety Gate for substantial work

Architectural, ruleset-sensitive, canonical-data, and other substantial phases must use the persistent Phase Issue/PR contract described in `docs/PHASE_SAFETY_GATE.md`.

The PR must:

- reference the governing Issue;
- include the required phase sections;
- provide verification evidence;
- preserve human review before phase completion.

A merged PR or successful Jules run does not replace human review.

---

*These rules are enforced by review and by the repository's automated workflow gates.*
