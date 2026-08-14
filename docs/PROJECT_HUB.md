# 🏛️ Artificer Project Hub

Central navigation for Artificer documentation. This page points agents and developers toward the authoritative documentation for architecture, systems, modules and current work.

## 📌 Start here
- [Architecture Status](./ARCHITECTURE_STATUS.md) - 🧭 **Current architectural boundaries and agent rules.**
- [Component Map](./COMPONENT_MAP.md) - 🧩 **Current React component structure.**
- [Task Board](./TASK_BOARD.md) - 📋 **Outstanding work.**
- [Project Progress](./PROGRESS.md) - 📈 **High-level implementation status.**
- [Changelog](./CHANGELOG.md) - 📝 **Recent project changes.**
- [House Style Guide](./STYLE_GUIDE.md) - 🎨 UI/visual conventions.
- [Error Reports](./ERROR_REPORTS.md) - 🐛 Known issues and investigations.

## 🧩 Modules
- [Battle Map Editor](./modules/mapEditor.md) - 🗺️ DM battle-map authoring and runtime integration boundary.
- [Atlas Service](./modules/atlasService.md) - Data fetching and resiliency.
- [Sound Engine](./modules/soundService.md) - Multi-layered audio mixer.
- [Save System](./modules/saveService.md) - Persistence architecture.
- [Inventory V2](./modules/inventory_v2.md) - Registry/slot inventory architecture.
- [Dice & Chat](./modules/dice_system.md) - Dice and AI chat systems.
- [Journal](./modules/journal.md) - Campaign Journal & Codex.
- [Minigames](./modules/minigames.md) - Interactive social mechanics.
- [World Panel](./ui/WORLD_PANEL.md) - Dynamic location information.
- [DM Kit](./ui/DEV_KIT.md) - Development and Dungeon Master tools.

## 🤖 Agent / orchestration documentation
- [Jimmy instructions](../jimmy_instructions.md) - Core systems and mechanics.
- [Jane instructions](../jane_instructions.md) - World building and cartography.
- [Sonny instructions](../sonny_instructions.md) - Audio/environment orchestration.

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
- `/src/components/devkit` — DM/developer authoring and testing tools.
- `/src/store` — domain-oriented runtime/UI stores.
- `/public/assets/atlas` — canonical Atlas data/assets.
- `/docs` — project documentation.
- `/skills` — LLM/agent skill definitions.

## Documentation rules

- Documentation describes the current repository, not an imagined future state.
- Planned work belongs in `TASK_BOARD.md` or a module specification; do not present it as implemented.
- Module specifications explain intended architecture and boundaries.
- `PROGRESS.md` contains project-level status and must have a current update date.
- Architecture changes should update the relevant docs in the same PR.
- When uncertain, inspect the source code before changing documentation.

---
*Maintained by the Artificer Project Orchestrator.*
