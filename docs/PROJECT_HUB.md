# 🏛️ Artificer Project Hub

Central navigation for Artificer documentation. This page points agents and developers toward authoritative documentation for architecture, systems, status, and current work.

## 📌 Start here

- [Operating Model & Workflow](./WORKFLOW.md) - 🛠️ Authoritative workflow, role contracts, and repository autonomy guide.
- [Architecture & Capability Map](./ARCHITECTURE_CAPABILITY_MAP.md) - 🏛️ Authoritative domain, capability, gameplay-gap, and specialist-agent map.
- [Architecture Status](./ARCHITECTURE_STATUS.md) - 🧭 Current architectural boundaries and runtime ownership.
- [Project Progress](./PROGRESS.md) - 📈 High-level implementation status.
- [Changelog](./CHANGELOG.md) - 📝 Project history.
- [House Style Guide](./STYLE_GUIDE.md) - 🎨 UI/visual conventions.
- [Error Reports](./ERROR_REPORTS.md) - 🐛 Known issues and investigations.

## 🧩 Modules

- [Component Map](./COMPONENT_MAP.md) - Current React component structure.
- [Battle Map Editor](./modules/mapEditor.md) - 🗺️ DM battle-map authoring and runtime integration boundary.
- [Atlas Service](./modules/atlasService.md) - Data fetching and resiliency.
- [Sound Engine](./modules/soundService.md) - Multi-layered audio mixer.
- [Save System](./modules/saveService.md) - Persistence architecture.
- [Inventory V2](./modules/inventory_v2.md) - Registry/slot inventory architecture.
- [Dice & Chat](./modules/dice_system.md) - Dice and AI chat systems.
- [Journal](./modules/journal.md) - Campaign Journal and Codex.
- [Minigames](./modules/minigames.md) - Interactive social mechanics.
- [World Panel](./ui/WORLD_PANEL.md) - Dynamic location information.
- [DM Kit](./ui/DEV_KIT.md) - Development and Dungeon Master tools.

## 🤖 Specialist agent contracts

Active Issue-first routing is defined by `.github/agents/`:

- [Architecture Specialist](../.github/agents/architecture-specialist.agent.md)
- [Ruleset & Data Specialist](../.github/agents/ruleset-data-specialist.agent.md)
- [UI Specialist](../.github/agents/ui-specialist.agent.md)
- [Assets Specialist](../.github/agents/assets-specialist.agent.md)
- [Gameplay Specialist](../.github/agents/gameplay-specialist.agent.md)
- [Verification Specialist](../.github/agents/verification-specialist.agent.md)

Legacy named-agent documents are retained as migration/history material only.

## ⚙️ Systems

- [Skill Database](./systems/SKILL_DATABASE.md)
- [NPC Interaction System](./systems/NPC_SYSTEM.md)
- [Crafting System](./systems/CRAFTING_SYSTEM.md)
- [Audio Registry](./systems/AUDIO_REGISTRY.md)
- [Asset Registry](./ASSET_REGISTRY.md)
- [Foundry Porting Guide](./systems/FOUNDRY_PORTING_GUIDE.md)

### Phase 2 / tactical architecture

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
- `/src/store` — domain-oriented runtime/UI stores.
- `/public/assets/atlas` — canonical Atlas data/assets.
- `/docs` — project documentation.
- `/.github/agents` — active specialist contracts.
- `/skills` — LLM/agent skill definitions.

## Documentation rules

- Documentation describes the current repository, not an imagined future state.
- The assigned GitHub Issue is the execution contract for implementation work.
- `ROADMAP.md` expresses current priority/order, not detailed task instructions.
- `docs/TASK_BOARD.md` is a historical migration/reference document, not an execution queue.
- Specialist contracts define domain boundaries and routing constraints.
- Planned work must not be presented as implemented capability.
- `PROGRESS.md` contains project-level status and should have a current update date.
- Architecture changes should update the relevant canonical docs in the same PR when applicable.
- When uncertain, inspect the source code before changing documentation.

---
*Maintained by the Artificer Project Orchestrator.*
