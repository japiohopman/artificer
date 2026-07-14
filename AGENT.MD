# 🤖 Agent Entry Point

Welcome to Artificer. If you are an AI agent, please follow these directions to understand your role, what to work on right now, and how we work here.

## 📍 Read in this order
1. 👉 **[ROADMAP.md](./ROADMAP.md)** — what's in scope *right now*. Start here, not with GOALS.md.
2. 👉 **[AGENT_RULES.md](./AGENT_RULES.md)** — the rules for how you're allowed to work. Non-negotiable.
3. 👉 **[GOALS.md](./GOALS.md)** — the long-term vision and architectural truth. This is the destination, not this week's task list — don't start building toward it until ROADMAP.md says it's time.
4. 👉 **[AI Orchestration](./docs/systems/AI_ORCHESTRATION.md)** — the boundary between AI narration and game mechanics.
5. 👉 **[DOCS_INDEX.md](./DOCS_INDEX.md)** — for navigating the rest of the documentation.

## 🏷️ Identified Agents
If you have been assigned one of the following roles, read your specific instructions in
addition to the above:

- **Jimmy (Sandbox/Core Agent)**: Read [jimmy_instructions.md](./jimmy_instructions.md)
- **Jane (World Builder)**: Read [jane_instructions.md](./jane_instructions.md)
- **Sonny (The Atmospheric Orchestrator)**: Read [sonny_instructions.md](./sonny_instructions.md)

## 🛠️ General Guidelines
- **Groundedness**: Always verify your actions against the existing codebase — docs drift, code doesn't lie.
- **Verification**: Don't mark a TASK_BOARD item `[x]` until you've actually run the app and watched it work. See AGENT_RULES.md §1.
- **Scope discipline**: Don't start a new GOALS.md system while ROADMAP.md's "Now" section still has open items. See AGENT_RULES.md §2.
- **Documentation**: Keep `DOCS_INDEX.md`, `docs/CHANGELOG.md`, and your specific instructions updated — and accurate, not aspirational.
- **Standardization**: Follow the project's naming and formatting conventions (snake_case, `/assets/atlas/` prefixes, etc.).
- **Repo hygiene**: No new binary assets over 1MB and no vendored/reference codebases committed without flagging it first. See AGENT_RULES.md §5.

---
*Happy coding.*
