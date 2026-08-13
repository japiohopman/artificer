# 🏛️ Artificer Project Hub

Central navigation for Artificer documentation. This page points agents and developers toward the authoritative documentation for architecture, systems, current work and agent workflows.

## 🤖 Agent Operating System

- [Agent Entry Point](../AGENT.MD) — mandatory read order and core principles.
- [Agent Ground Rules](../AGENT_RULES.md) — non-negotiable engineering rules.
- [Agent State](./AGENT_STATE.md) — current operational state and active work claims.
- [Agentic Workflow](./agents/WORKFLOW.md) — standard agent lifecycle.
- [Feature Workflow](./agents/FEATURE_WORKFLOW.md) — feature implementation.
- [Bug Workflow](./agents/BUG_WORKFLOW.md) — reproduction and diagnosis.
- [Refactor Workflow](./agents/REFACTOR_WORKFLOW.md) — behavior-preserving refactors.
- [Agent Handoff](./agents/HANDOFF.md) — standard continuation format.

## 📌 Project State

- [Architecture Status](./ARCHITECTURE_STATUS.md) — current architectural boundaries.
- [Component Map](./COMPONENT_MAP.md) — current React component structure.
- [Task Board](./TASK_BOARD.md) — outstanding work.
- [Project Progress](./PROGRESS.md) — high-level implementation status.
- [Changelog](./CHANGELOG.md) — recent project changes.
- [House Style Guide](./STYLE_GUIDE.md) — visual/UI conventions.
- [Error Reports](./ERROR_REPORTS.md) — known issues and investigations.

## 🧩 Modules

- [Battle Map Editor](./modules/mapEditor.md) — DM battle-map authoring and runtime integration boundary.
- [Atlas Service](./modules/atlasService.md) — data fetching and resiliency.
- [Sound Engine](./modules/soundService.md) — multi-layered audio mixer.
- [Save System](./modules/saveService.md) — persistence architecture.
- [Inventory V2](./modules/inventory_v2.md) — registry/slot inventory architecture.
- [Dice & Chat](./modules/dice_system.md) — dice and AI chat systems.
- [Journal](./modules/journal.md) — campaign Journal & Codex.
- [Minigames](./modules/minigames.md) — interactive social mechanics.
- [World Panel](./ui/WORLD_PANEL.md) — dynamic location information.
- [DM Kit](./ui/DEV_KIT.md) — development and Dungeon Master tools.

## 🤖 Named Agent Instructions

- [Jimmy instructions](../jimmy_instructions.md) — core systems and mechanics.
- [Jane instructions](../jane_instructions.md) — world building and cartography.
- [Sonny instructions](../sonny_instructions.md) — audio/environment orchestration.

## ⚙️ Systems

- [Skill Database](./systems/SKILL_DATABASE.md)
- [NPC Interaction System](./systems/NPC_SYSTEM.md)
- [Crafting System](./systems/CRAFTING_SYSTEM.md)
- [Audio Registry](./systems/AUDIO_REGISTRY.md)
- [Asset Registry](./ASSET_REGISTRY.md)
- [Foundry Porting Guide](./systems/FOUNDRY_PORTING_GUIDE.md)
- [Party State](./systems/PARTY_STATE.md)
- [World State](./systems/WORLD_STATE.md)
- [Travel System](./systems/TRAVEL_SYSTEM.md)
- [Time System](./systems/TIME_SYSTEM.md)
- [Weather System](./systems/WEATHER_SYSTEM.md)
- [Rest & Sleep System](./systems/REST_SLEEP_SYSTEM.md)
- [World Panel Architecture](./systems/WORLD_PANEL_ARCHITECTURE.md)
- [Leaflet Map Integration](./systems/LEAFLET_MAP_INTEGRATION.md)
- [Tactical Combat Engine](./systems/TACTICAL_COMBAT_ENGINE.md)
- [Data Flow](./systems/DATA_FLOW.md)

## 📂 Important directories

- `/src` — React/TypeScript application source.
- `/src/components/devkit` — DM/developer authoring and testing tools.
- `/src/store` — domain-oriented runtime/UI stores.
- `/public/assets/atlas` — canonical Atlas data/assets.
- `/docs` — project documentation.
- `/docs/agents` — reusable AI workflows and handoff standards.
- `/skills` — LLM/agent skill definitions.

## Documentation rules

- Documentation describes the current repository, not an imagined future state.
- Planned work belongs in `TASK_BOARD.md` or a module specification; do not present it as implemented.
- Module specifications explain intended architecture and boundaries.
- `PROGRESS.md` contains project-level status and must have a current update date.
- Architecture changes should update the relevant docs in the same change.
- New agent workflows must be linked from `DOCS_INDEX.md`.
- When uncertain, inspect the source code before changing documentation.

---
*Maintained by the Artificer Project Orchestrator.*
