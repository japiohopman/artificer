# 🛠️ Artificer DevKit Architecture & Working Model

The DevKit is Artificer's internal **DM/developer authoring, browsing, diagnostics, and hardware workspace**. It is mounted from the application shell (`src/App.tsx`) and controlled via global UI state (`useUIStore.isDevKitOpen`).

---

## 1. Executive Summary & Audit Overview

A complete workspace-by-workspace audit of the current DevKit implementation (`src/components/devkit/`) revealed significant functionality, as well as areas of architectural debt:
- **God Component Concentration:** `DevKit.tsx` (2,554 lines) directly contains full authoring UI, state, scraping, and AI prompt logic for Enemy, Material, Equipment, and Habitat background generation, alongside top-level tab orchestration and Hue lamp controls (`DevKitHueTab`).
- **Data & Rule Duplication:** `npcGeneratorUtils.ts` and `npc_generator.tsx` duplicate D&D class/race/background data, hit dice tables, starting equipment, and AC/HP formulas using hardcoded legacy arrays (`CLASS_DATA`, `BACKGROUND_DATA`) rather than consuming versioned Atlas loaders (`storageService.ts`, `atlasService.ts`).
- **Orphaned / Unlinked Components:** `AudioLaboratory.tsx` (68k) exists in `src/components/devkit/` but is not imported by `DevKit.tsx` or any other file. DevKit instead imports `SoundStudio.tsx` for the "Audio Lab" tab.
- **Split Explorer Surface:** `AssetExplorer.tsx` (Atlas assets) and `WorldExplorer.tsx` (World regions/locations) exist as separate inspector sub-tabs with different search and filtering interfaces, despite serving the same primary user goal of browsing canonical static/world data.

---

## 2. DevKit Tool Responsibility & Audit Matrix

| Workspace / Tool | Owning Component / File | Canonical Data Owner | Implementation Status | Logic Duplication / Debt | Audit Decision | Required Follow-up Issue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Inspectors: Codex** | `AssetExplorer.tsx` | `useAtlasStore`, `storageService.ts` | **Implemented** | Uses simple string `includes()` search; duplicates category browsing tabs. | **Merge** into Unified Explorer | #367 |
| **Inspectors: World** | `WorldExplorer.tsx` | `useWorldStore`, `REGION_METADATA` | **Implemented** | Renders static Faerûn vector map; separated from Atlas Asset Explorer. | **Merge** into Unified Explorer | #367 |
| **Inspectors: Flags** | `FlagManager.tsx` | `useWorldStore.worldFlags` | **Implemented** | Clean key-value flag manager operating against `useWorldStore`. | **Remain** (under Debug/Flags) | #367 |
| **Generators: NPC** | `npc_generator.tsx`, `npcService.ts` | `useCharacterStore` | **Implemented** | Hardcoded legacy arrays in `npcGeneratorUtils.ts` duplicate class/race rules and equipment. | **Rebuild / Modernize** | #368 |
| **Generators: Enemy** | `DevKit.tsx`, `enemy-image_generator.tsx` | `/public/assets/atlas/enemies/` | **Implemented** | Inline in `DevKit.tsx`; raw text ripper and scraping logic coupled to top window. | **Split / Extract** into generator module | #408 |
| **Generators: Material** | `DevKit.tsx`, `material-image_generator.tsx` | `/public/assets/atlas/materials/` | **Implemented** | Inline in `DevKit.tsx`; mixes prompt generation with asset baking. | **Split / Extract** into generator module | #408 |
| **Generators: Equipment** | `DevKit.tsx`, `equipment-image_generator.tsx` | `/public/assets/atlas/equipment/` | **Implemented** | Inline in `DevKit.tsx`; tier calculation logic inline in event handlers. | **Split / Extract** into generator module | #408 |
| **Generators: Gods / Lore** | `GodsLore.tsx` | `/public/assets/atlas/gods/` | **Implemented** | Standalone viewer and lore authoring interface. | **Remain** | None |
| **Generators: Jane (World)** | `Jane.tsx` | `useWorldStore` | **Implemented** | High-level regional world builder and narrative location authoring tool. | **Remain** | None |
| **Generators: Habitat** | `DevKit.tsx`, `backgroundConfigs.ts` | `public/assets/images/enemy_backgrounds/` | **Implemented** | Inline in `DevKit.tsx`; contains interactive sprite gallery and variation generator. | **Split / Extract** into generator module | #408 |
| **Generators: Battle Map** | `BattleMapEditor/index.tsx` | `battleMapStorage.ts`, combat maps | **Implemented** | Modular, well-isolated authoring tool with Canvas rendering pipeline. | **Remain** (Modular standalone) | None (Sustaining) |
| **Testers: NPC Slots** | `npc_tester.tsx` | `useCharacterStore` | **Implemented** | Slot verification harness testing party character state synchronization. | **Remain** | #409 |
| **Testers: Tactical Combat** | `CombatTester.tsx` | `useGameStore` | **Implemented** | Full tactical grid testing harness for monster spawning and combat verification. | **Remain** | #409 |
| **Testers: Simulator** | `Simulator.tsx` | `useCharacterStore`, `statCalculations.ts` | **Implemented** | Derived stat and equipment calculation simulator. | **Remain** | #409 |
| **Audio Lab: Sound Studio** | `audio/SoundStudio.tsx` | `useAudioStore`, `soundService.ts` | **Implemented** | Multi-channel stem mixer, SFX generator, and audio testing environment. | **Remain** | #409 |
| **Audio Lab: Audio Laboratory**| `AudioLaboratory.tsx` | `useAudioStore`, `soundService.ts` | **Scaffolded / Orphaned** | Unimported file duplicating `SoundStudio.tsx` sound generation logic. | **Remove** | #409 |
| **Audio Lab: Audio Mixer** | `audio/Mixer.tsx` | `soundService.ts` | **Implemented** | Quick floating overlay mixer accessible via DevKit header button. | **Remain** | #409 |
| **Hardware: Hue Lamps** | `DevKitHueTab` in `DevKit.tsx`, `LampCard.tsx` | `useHueStore` | **Implemented** | Direct Philips Hue bridge setup and luminary control interface. | **Split / Extract** into `HueStudio.tsx` | #408 |

---

## 3. Concept Separation & Target Architecture

The target DevKit architecture consolidates navigation into **4 coherent top-level workspaces**:

```text
DevKit.tsx (Orchestrator & Shell)
 ├── 1. Explorer (Unified Browsing & Inspection)
 │    ├── Atlas Assets (Enemies, Equipment, Materials, Spells, Gods)
 │    ├── World Hierarchy & Map Regions
 │    └── World Flags & Diagnostics Manager
 ├── 2. Generators (Authoring & Content Creation)
 │    ├── NPC Modernization Workspace
 │    ├── Entity Authoring (Enemy, Material, Equipment)
 │    ├── Habitat & Background Generator
 │    ├── World & Regional Builder (Jane)
 │    ├── Gods & Lore Authoring
 │    └── Battle Map Editor (Canvas)
 ├── 3. Testers (Verification & Runtime Simulation)
 │    ├── NPC Slot & Party Synchronizer
 │    ├── Tactical Combat Simulator
 │    └── Mechanics & Stat Calculation Simulator
 └── 4. Hardware & Audio Studio (Hardware & Sound Control)
      ├── Audio Sound Studio & Stem Mixer
      ├── Philips Hue Bridge & Lamp Controller
      └── Quick Floating Audio Mixer Overlay
```

### Strategic Concept Decisions:
1. **Unified Data & World Explorer:** Asset browsing (`AssetExplorer`) and Region/Location browsing (`WorldExplorer`) are unified into a single "Explorer" workspace. Users select domain views (Atlas vs. World vs. Flags) within a consistent filter and preview shell.
2. **NPC Generator Modernization as a Separate Track:** The NPC Generator is explicit about its scope. Because it touches character save formats (`saveVersion: 2`), choice resolution, and AI image matrix generation, modernizing `npc_generator.tsx` and removing hardcoded arrays in `npcGeneratorUtils.ts` is tracked as its own refactor issue rather than hidden inside a generic DevKit pass.
3. **Extraction of Inline Authoring from `DevKit.tsx`:** `DevKit.tsx` must be reduced to an orchestration shell. Inline rendering and state for Enemy, Equipment, Material, Habitat, and Hue tabs will be refactored into dedicated module components under `src/components/devkit/generators/` and `src/components/devkit/hardware/`.
4. **Cleanup of Orphaned Tools:** Unused components such as `AudioLaboratory.tsx` will be removed to maintain codebase hygiene.

---

## 4. Ordered Follow-Up Refactor Plan

The following concrete follow-up Issues are established by this audit:

1. **#408 — Extract Inline DevKit Authoring Modules & Modularize `DevKit.tsx`**
   - *Goal:* De-risk `DevKit.tsx` by extracting inline Enemy, Equipment, Material, Habitat, and Hue authoring surfaces into dedicated modules while preserving canonical ownership.
   - *Dependencies:* #366.

2. **#368 — Modernize NPC Generator & Decouple Legacy Generator Utilities**
   - *Goal:* Replace legacy hardcoded D&D arrays in `npcGeneratorUtils.ts` with canonical Atlas loaders and align generation with the canonical character pipeline.
   - *Dependencies:* #408 and #377.

3. **#367 — Build Unified Atlas & World Explorer Workspace**
   - *Goal:* Merge `AssetExplorer.tsx` and `WorldExplorer.tsx` into a single canonical browsing surface with deterministic shared search/navigation.
   - *Dependencies:* #408.

4. **#409 — DevKit Housekeeping, Orphaned Component Removal & Tester Alignment**
   - *Goal:* Remove confirmed orphaned tools and align diagnostic tester/audio tooling with current canonical APIs and verification.
   - *Dependencies:* #408, #367, #368.
