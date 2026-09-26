# 🤖 Agent Entry Point

Welcome to Artificer. These instructions define the shared entry point for AI agents working in the repository.

## Execution hierarchy

The execution contract is determined in this order:

1. **Assigned GitHub Issue** — the authoritative execution contract for the current task.
2. **Selected specialist contract** — the applicable file in `.github/agents/`.
3. **AGENT.MD** — shared repository-wide agent guidance.
4. **AGENT_RULES.md** — shared working rules and safety constraints.
5. **Canonical references named by the Issue or specialist contract** — source code and documentation to inspect for context.

`ROADMAP.md`, `GOALS.md`, and `docs/TASK_BOARD.md` provide strategic or historical context. `docs/WORKFLOW.md` defines the authoritative operating model. Shared context files are **not execution queues** and must never be used to reconstruct missing Issue scope.

## 📍 Read in this order

For a dispatched task:

1. Read the complete assigned GitHub Issue.
2. Read the selected specialist contract in `.github/agents/`.
3. Read `AGENT.MD` and `AGENT_RULES.md`.
4. Read the canonical implementation and documentation references named by the Issue/specialist contract.
5. Inspect the actual code before extending an existing system.

For planning context only, consult `ROADMAP.md` and `GOALS.md` after the execution contract is understood.

## 🧭 Specialist agents

Artificer uses repository-local specialist contracts for Issue-first routing:

- **Architecture:** [`.github/agents/architecture-specialist.agent.md`](./.github/agents/architecture-specialist.agent.md)
- **Ruleset & Data:** [`.github/agents/ruleset-data-specialist.agent.md`](./.github/agents/ruleset-data-specialist.agent.md)
- **UI:** [`.github/agents/ui-specialist.agent.md`](./.github/agents/ui-specialist.agent.md)
- **Assets:** [`.github/agents/assets-specialist.agent.md`](./.github/agents/assets-specialist.agent.md)
- **Gameplay:** [`.github/agents/gameplay-specialist.agent.md`](./.github/agents/gameplay-specialist.agent.md)
- **Verification:** [`.github/agents/verification-specialist.agent.md`](./.github/agents/verification-specialist.agent.md)

The specialist contract is a routing and constraint document, not a competing project manager. The GitHub Issue remains the execution contract.

### Legacy agent documents

Older named-agent instruction files such as `jimmy_instructions.md`, `jane_instructions.md`, and `sonny_instructions.md` are retained only as migration/history material unless a current Issue explicitly references one.

They are **not** active Jules routing targets.

## 🛠️ General Guidelines

- **Inspect before implementing:** For existing-system work, Jules must inspect current implementation, consumers, tests, canonical ownership, and relevant adjacent architecture before modifying code.
- **Adjacent findings must be recorded, not silently absorbed:** Materially adjacent work belongs in a follow-up Issue rather than being silently added to the active task.
- **Groundedness:** Verify claims and changes against the existing codebase. Documentation can drift; implementation must be inspected directly.
- **Scope discipline:** Implement only the assigned Issue scope. Record adjacent gaps as follow-up Issues instead of expanding the task opportunistically.
- **Canonical ownership:** Before creating a store, service, resolver, or presentation model, identify the existing canonical owner and data flow.
- **Verification:** Run the verification required by the Issue and repository gates before claiming completion.
- **Documentation:** Update documentation when the change alters an established architectural or workflow contract. Keep it factual rather than aspirational.
- **Repository hygiene:** Do not add vendored/reference repositories or unverified binary bloat. Follow `AGENT_RULES.md` and the asset registry for asset changes.
- **Issue/PR linkage:** Keep the GitHub Issue, implementation branch, PR, and verification evidence aligned.
- **Workflow integrity:** Do not create a parallel task database, revive TASK_BOARD-driven dispatch, or bypass the Issue-first Jules workflow.

---
*Happy building.*
