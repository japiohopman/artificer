# 🛠️ Artificer DevKit Architecture & Working Model

The DevKit is Artificer's internal **DM/developer authoring, browsing, diagnostics, and hardware workspace**. It is mounted from the application shell (`src/App.tsx`) and controlled via global UI state (`useUIStore.isDevKitOpen`).

---

## 1. Executive Summary & Audit Overview

A complete workspace-by-workspace audit of the current DevKit implementation (`src/components/devkit/`) revealed significant functionality, as well as areas of architectural debt:
- **God Component Concentration:** `DevKit.tsx` was modularized under #408 into focused orchestration (<400 lines) delegating to `EntityWorkbench`, `HabitatGenerator`, and `HueStudio`.
- **Data & Rule Duplication:** `npcGeneratorUtils.ts` and `npc_generator.tsx` duplicate D&D class/race/background data, hit dice tables, starting equipment, and AC/HP formulas using hardcoded legacy arrays (`CLASS_DATA`, `BACKGROUND_DATA`) rather than consuming versioned Atlas loaders (`storageService.ts`, `atlasService.ts`).
- **Orphaned / Unlinked Components:** `AudioLaboratory.tsx` (68k) exists in `src/components/devkit/` but is not imported by `DevKit.tsx` or any other file. DevKit instead imports `SoundStudio.tsx` for the "Audio Lab" tab.
- **Unified Explorer Workspace:** Under #367, `AssetExplorer.tsx` and `WorldExplorer.tsx` are consolidated into a single unified `Explorer.tsx` component providing domain browsing, deterministic search, and inspection previews across Atlas entities and World locations/regions.

---

## 2. DevKit Tool Responsibility & Audit Matrix

| Workspace / Tool | Owning Component / File | Canonical Data Owner | Implementation Status | Logic Duplication / Debt | Audit Decision | Required Follow-up Issue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Inspectors: Explorer** | `Explorer.tsx` | `useAtlasStore`, `useWorldStore` | **Implemented** | Unified search and domain catalogue across Atlas assets and World locations. | **Canonical** Workspace | Completed (#367) |
| **Inspectors: Codex** | `AssetExplorer.tsx` (facade) | `useAtlasStore` | **Implemented** | Re-exports `Explorer.tsx` for backwards compatibility. | **Unified** | Completed (#367) |
| **Inspectors: World** | `WorldExplorer.tsx` (facade) | `useWorldStore` | **Implemented** | Re-exports `Explorer.tsx` for backwards compatibility. | **Unified** | Completed (#367) |
| **Inspectors: Flags** | `FlagManager.tsx` | `useWorldStore.worldFlags` | **Implemented** | Clean key-value flag manager operating against `useWorldStore`. | **Remain** (under Debug/Flags) | None (Sustaining) |
| **Generators: NPC** | `npc_generator.tsx`, `npcService.ts` | `useCharacterStore` | **Implemented** | Hardcoded legacy arrays in `npcGeneratorUtils.ts` duplicate class/race rules and equipment. | **Rebuild / Modernize** | #368 (depends on #377) |
| **Generators: Enemy** | `EntityWorkbench.tsx` | `/public/assets/atlas/enemies/` | **Implemented** | Extracted under #408 into modular generator domain component. | **Modularized** | Completed (#408) |
| **Generators: Material** | `EntityWorkbench.tsx` | `/public/assets/atlas/materials/` | **Implemented** | Extracted under #408 into modular generator domain component. | **Modularized** | Completed (#408) |
| **Generators: Equipment** | `EntityWorkbench.tsx` | `/public/assets/atlas/equipment/` | **Implemented** | Extracted under #408 into modular generator domain component. | **Modularized** | Completed (#408) |
| **Generators: Gods / Lore** | `GodsLore.tsx` | `/public/assets/atlas/gods/` | **Implemented** | Standalone viewer and lore authoring interface. | **Remain** | None (Sustaining) |
| **Generators: Jane (World)** | `Jane.tsx` | `useWorldStore` | **Implemented** | High-level regional world builder and narrative location authoring tool. | **Remain** | None (Sustaining) |
| **Generators: Habitat** | `HabitatGenerator.tsx` | `public/assets/images/enemy_backgrounds/` | **Implemented** | Extracted under #408 into modular background generator component. | **Modularized** | Completed (#408) |
| **Generators: Battle Map** | `BattleMapEditor/index.tsx` | `battleMapStorage.ts`, combat maps | **Implemented** | Modular, well-isolated authoring tool with Canvas rendering pipeline. | **Remain** (Modular standalone) | None (Sustaining) |
| **Testers: NPC Slots** | `npc_tester.tsx` | `useCharacterStore` | **Implemented** | Slot verification harness testing party character state synchronization. | **Remain** | #409 |
| **Testers: Tactical Combat** | `CombatTester.tsx` | `useGameStore` | **Implemented** | Full tactical grid testing harness for monster spawning and combat verification. | **Remain** | #409 |
| **Testers: Simulator** | `Simulator.tsx` | `useCharacterStore`, `statCalculations.ts` | **Implemented** | Derived stat and equipment calculation simulator. | **Remain** | #409 |
| **Audio Lab: Sound Studio** | `audio/SoundStudio.tsx` | `useAudioStore`, `soundService.ts` | **Implemented** | Multi-channel stem mixer, SFX generator, and audio testing environment. | **Remain** | #409 |
| **Audio Lab: Audio Laboratory**| `AudioLaboratory.tsx` | `useAudioStore`, `soundService.ts` | **Scaffolded / Orphaned** | Unimported file duplicating `SoundStudio.tsx` sound generation logic. | **Remove** | #409 |
| **Audio Lab: Audio Mixer** | `audio/Mixer.tsx` | `soundService.ts` | **Implemented** | Quick floating overlay mixer accessible via DevKit header button. | **Remain** | #409 |
| **Hardware: Hue Lamps** | `HueStudio.tsx` | `useHueStore` | **Implemented** | Extracted under #408 into dedicated hardware studio module. | **Modularized** | Completed (#408) |

---

## 3. Concept Separation & Target Architecture

The target DevKit architecture consolidates navigation into **4 coherent top-level workspaces**:

```text
DevKit.tsx (Orchestrator & Shell)
 ├── 1. Explorer (Unified Browsing & Inspection)
 │    ├── Explorer Workspace (Enemies, Equipment, Materials, Spells, Gods, World Locations)
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
1. **Unified Data & World Explorer:** Asset browsing and Region/Location browsing are unified into a single "Explorer" workspace (`Explorer.tsx`). Users select domain views within a consistent filter, search, and preview shell.
2. **NPC Generator Modernization as a Separate Track:** The NPC Generator is explicit about its scope. Because it touches character save formats (`saveVersion: 2`), choice resolution, and AI image matrix generation, modernizing `npc_generator.tsx` and removing hardcoded arrays in `npcGeneratorUtils.ts` is tracked as its own refactor issue (#368) rather than hidden inside a generic DevKit pass.
3. **Extraction of Inline Authoring from `DevKit.tsx`:** Completed under #408. `DevKit.tsx` is an orchestration shell (<400 lines).
4. **Cleanup of Orphaned Tools:** Unused components such as `AudioLaboratory.tsx` will be removed under #409.

---

## 4. Ordered Follow-Up Refactor Plan & Dependencies

Execution sequence and dependency chain for DevKit modernization:

```text
#366 (DevKit Audit)
  │
  ▼
#408 (Extract inline authoring modules / modularize DevKit shell) [COMPLETED]
  │
  ├───────────────────────────────┐
  ▼                               ▼
#367 (Unified Atlas & World)   #368 (NPC generator modernization) [also depends on #377]
  [COMPLETED]                     │
  │                               │
  └───────────────────────────────┤
                                  ▼
                               #409 (Orphaned tools / tester / audio cleanup)
```

1. **Issue #408: Extract inline authoring modules / modularize DevKit shell** [COMPLETED]
2. **Issue #367: Unified Atlas and World Explorer** [COMPLETED]
3. **Issue #368: NPC generator modernization**
   - *Goal:* Replace hardcoded `CLASS_DATA`, `BACKGROUND_DATA`, and legacy D&D arrays in `npcGeneratorUtils.ts` with canonical Atlas loaders (`storageService.ts`) and ensure 100% schema alignment with V2 character state (`useCharacterStore`).
   - *Dependencies:* #408, #377.
4. **Issue #409: Orphaned tools / tester / audio cleanup**
   - *Goal:* Remove dead code (`AudioLaboratory.tsx`), align `NPCTester`, `CombatTester`, and `Simulator` with current store APIs, and update all DevKit verification suites.
   - *Dependencies:* #367, #368.
