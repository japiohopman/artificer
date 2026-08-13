# 🤖 Agent Entry Point

Welcome to Artificer. AI agents are part of the engineering team. Your job is not only to change code, but to preserve continuity between agents.

## 📍 Mandatory read order

1. 👉 **[ROADMAP.md](./ROADMAP.md)** — what is in scope now.
2. 👉 **[AGENT_RULES.md](./AGENT_RULES.md)** — non-negotiable working rules.
3. 👉 **[docs/AGENT_STATE.md](./docs/AGENT_STATE.md)** — current operational state and active work claims.
4. 👉 **[docs/PROGRESS.md](./docs/PROGRESS.md)** — current implementation status.
5. 👉 **[docs/agents/WORKFLOW.md](./docs/agents/WORKFLOW.md)** — standard agentic workflow.
6. 👉 **[GOALS.md](./GOALS.md)** — long-term vision and architectural destination.
7. 👉 **[AI Orchestration](./docs/systems/AI_ORCHESTRATION.md)** — boundary between AI narration and game mechanics.
8. 👉 **[DOCS_INDEX.md](./DOCS_INDEX.md)** — navigate the rest of the knowledge base.

Do not skip directly to GOALS.md and start building future systems. Current scope comes from ROADMAP/TASK_BOARD/PROGRESS.

## 🧭 Work-type playbooks

Use the relevant playbook after the mandatory read order:

- **Feature:** [docs/agents/FEATURE_WORKFLOW.md](./docs/agents/FEATURE_WORKFLOW.md)
- **Bug:** [docs/agents/BUG_WORKFLOW.md](./docs/agents/BUG_WORKFLOW.md)
- **Refactor:** [docs/agents/REFACTOR_WORKFLOW.md](./docs/agents/REFACTOR_WORKFLOW.md)
- **Handoff:** [docs/agents/HANDOFF.md](./docs/agents/HANDOFF.md)

More playbooks should be added only when a recurring workflow genuinely benefits from one.

## 🏷️ Identified Agents

If assigned a named role, read its specific instructions in addition to the mandatory workflow:

- **Jimmy (Sandbox/Core Agent):** [jimmy_instructions.md](./jimmy_instructions.md)
- **Jane (World Builder):** [jane_instructions.md](./jane_instructions.md)
- **Sonny (The Atmospheric Orchestrator):** [sonny_instructions.md](./sonny_instructions.md)

Named-agent instructions define domain ownership; they do not override the general agent workflow or safety rules.

## 🛠️ Core principles

- **Groundedness:** Verify against the actual repository and runtime. Docs drift; code is the implementation source of truth.
- **Verification:** Never mark work complete until the affected behavior has been verified. See `AGENT_RULES.md`.
- **Scope discipline:** Do not silently expand the task or take over another agent's domain.
- **Continuity:** Leave a factual handoff so the next agent can continue without reconstructing your work.
- **Documentation:** Update affected docs to reflect reality, not intention.
- **Claims:** Claim shared/conflicting scope in `docs/AGENT_STATE.md` before editing.
- **Repo hygiene:** No new binary assets over 1MB or vendored/reference codebases without following `AGENT_RULES.md`.

## 🔁 Standard lifecycle

```text
ORIENT → CLASSIFY → CHECK PRIORITY → CLAIM → INVESTIGATE → PLAN → IMPLEMENT → VERIFY → DOCUMENT → HANDOFF
```

If blocked, stop before improvising around an architectural boundary. Record the blocker, investigation and required decision.

---
*Artificer is built by humans and agents. Continuity, verification and architectural discipline are part of the product.*
