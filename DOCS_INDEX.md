# 📇 Artificer Documentation Index

This is the central documentation map for humans and AI agents.

## 🤖 Agent Operating System — START HERE

- **[Agent Entry Point](./AGENT.MD)** — mandatory first-read sequence and core principles.
- **[Agent Ground Rules](./AGENT_RULES.md)** — non-negotiable engineering rules.
- **[Agent State](./docs/AGENT_STATE.md)** — current operational state and active work claims.
- **[Agentic Workflow](./docs/agents/WORKFLOW.md)** — standard lifecycle from orientation through handoff.
- **[Feature Workflow](./docs/agents/FEATURE_WORKFLOW.md)** — feature implementation playbook.
- **[Bug Workflow](./docs/agents/BUG_WORKFLOW.md)** — reproduction, diagnosis and verification playbook.
- **[Refactor Workflow](./docs/agents/REFACTOR_WORKFLOW.md)** — behavior-preserving refactor playbook.
- **[Agent Handoff](./docs/agents/HANDOFF.md)** — standard continuation/reporting format.

## 🧭 Project State & Direction

- **[Master Project Goals](./GOALS.md)** — long-term vision and destination.
- **[Project Hub](./docs/PROJECT_HUB.md)** — central project documentation navigation.
- **[Project Progress](./docs/PROGRESS.md)** — current implementation status.
- **[Task Board](./docs/TASK_BOARD.md)** — current work items.
- **[Roadmap](./docs/ROADMAP.md)** — planned project direction.
- **[Changelog](./docs/CHANGELOG.md)** — historical project changes.
- **[Architecture Status](./docs/ARCHITECTURE_STATUS.md)** — current architectural boundaries.
- **[Component Map](./docs/COMPONENT_MAP.md)** — current React component structure.
- **[Error Reports](./docs/ERROR_REPORTS.md)** — known issues and investigations.

## 🧠 Core Architecture & Systems

- **[AI Orchestration](./docs/systems/AI_ORCHESTRATION.md)** — Narrator vs Engine architecture.
- **[Foundry Porting Guide](./docs/systems/FOUNDRY_PORTING_GUIDE.md)** — VTT/system mapping.
- **[Crafting System](./docs/systems/CRAFTING_SYSTEM.md)** — material and recipe architecture.
- **[Quest System](./docs/systems/QUEST_SYSTEM.md)** — quest/mission architecture.
- **[Skill Database](./docs/systems/SKILL_DATABASE.md)** — skill data architecture.
- **[NPC Interaction System](./docs/systems/NPC_SYSTEM.md)** — NPC systems.
- **[Asset Registry](./docs/ASSET_REGISTRY.md)** — canonical asset rules.
- **[Audio Registry](./docs/systems/AUDIO_REGISTRY.md)** — sound asset index.

## 🧩 Modules & UI

- **[Battle Map Editor](./docs/modules/mapEditor.md)** — DM battle-map authoring and runtime boundary.
- **[Atlas Service](./docs/modules/atlasService.md)** — data fetching and resiliency.
- **[Sound Engine](./docs/modules/soundService.md)** — layered audio mixer.
- **[Save System](./docs/modules/saveService.md)** — persistence architecture.
- **[Inventory V2](./docs/modules/inventory_v2.md)** — registry/slot inventory.
- **[Dice & Chat](./docs/modules/dice_system.md)** — dice and AI chat.
- **[Journal](./docs/modules/journal.md)** — campaign journal and Codex.
- **[Minigames](./docs/modules/minigames.md)** — interactive social mechanics.
- **[World Panel](./docs/ui/WORLD_PANEL.md)** — dynamic location information.
- **[DevKit / DM Kit](./docs/ui/DEV_KIT.md)** — authoring and developer tools.

## 🎨 Standards & Assets

- **[House Style Guide](./docs/STYLE_GUIDE.md)** — visual/UI conventions.
- **[Asset Registry](./docs/ASSET_REGISTRY.md)** — canonical asset paths and rules.

## 📂 Important directories

- `/src` — React/TypeScript application source.
- `/src/components/devkit` — DM/developer authoring and testing tools.
- `/src/store` — domain-oriented runtime/UI stores.
- `/public/assets/atlas` — canonical Atlas data/assets.
- `/docs` — project documentation.
- `/docs/agents` — reusable AI agent workflows and handoff standards.
- `/skills` — LLM/agent skill definitions.

## Documentation rules

- Documentation describes the current repository, not an imagined future state.
- Planned work belongs in `TASK_BOARD.md`, `ROADMAP.md` or a module specification; never present it as implemented.
- Module specifications explain intended architecture and boundaries.
- `PROGRESS.md` contains project-level status and must have a current update date.
- Architecture changes should update relevant docs in the same change.
- New agent workflows belong in `/docs/agents` and must be linked here.
- When uncertain, inspect source code before changing documentation.

---
*Maintained by the Artificer Project Orchestrator.*
