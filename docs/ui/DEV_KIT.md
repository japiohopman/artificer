# 🛠️ DM Kit (Dev Kit) Architecture & User Interface Documentation

## Overview
The **DM Kit** (DevKit) is Artificer's developer and Dungeon Master authoring, debugging, inspection, and hardware management workspace. It provides direct, non-gameplay tools to inspect canonical Atlas and World data, author new entities, run runtime test harnesses, and manage connected audio/lighting hardware.

---

## Workspace Navigation & Responsibility Matrix

The DevKit is organized into 4 primary functional workspace domains:

```text
               ┌─────────────────────────────────────────┐
               │           DevKit (Main Shell)           │
               └────────────────────┬────────────────────┘
                                    │
    ┌─────────────────┬─────────────┴───────────┬─────────────────┐
    ▼                 ▼                         ▼                 ▼
┌──────────┐    ┌───────────┐             ┌───────────┐    ┌─────────────┐
│ Explorer │    │Generators │             │  Testers  │    │ Audio & Hue │
└────┬─────┘    └─────┬─────┘             └─────┬─────┘    └──────┬──────┘
     │                │                         │                 │
     ├─ Atlas Codex   ├─ Entity (Enemy/Eqp/Mat) ├─ Tactical Combat├─ Sound Studio
     ├─ World Map     ├─ NPC Generator          ├─ NPC Slots      ├─ Hue Controller
     └─ World Flags   ├─ Habitat Backgrounds    └─ Simulator      └─ Audio Mixer
                      ├─ Jane (World Builder)
                      ├─ Gods & Lore
                      └─ Battle Map Editor
```

### 1. Unified Explorer & Inspectors
Inspect and query canonical static Atlas content and dynamic world state.
- **Codex Explorer (`AssetExplorer.tsx`):** Query global Atlas assets (Enemies, Equipment, Materials, Spells, Gods) using category filters and card inspectors.
- **World Explorer (`WorldExplorer.tsx`):** Interactive SVG map browser for Faerûn regions and location registries (`useWorldStore`).
- **Flag Manager (`FlagManager.tsx`):** Inspect and toggle global narrative world flags and quest variables (`useWorldStore.worldFlags`).

### 2. Entity & Content Generators
Author new entities, generate procedural lore/images, and commit assets to the repository.
- **Entity Authoring (Enemy, Equipment, Material):** Integrated parsing, wiki scraping, and image synthesis pipelines for Atlas items and monsters.
- **NPC Generator (`npc_generator.tsx`):** Procedural and AI-assisted NPC profile creation with emotion matrix generation.
- **Habitat Background Generator:** Atmosphere and environmental background generator with interactive sprite variation matrix.
- **Jane World Builder (`Jane.tsx`):** Regional lore and narrative location authoring tool.
- **Gods & Lore (`GodsLore.tsx`):** Deity pantheon viewer and lore authoring interface.
- **Battle Map Editor (`BattleMapEditor/`):** High-fidelity HTML Canvas tactical map editor with command-pattern Undo/Redo and grid snapping.

### 3. Verification Testers & Diagnostic Harnesses
Verify mechanics, store state transitions, and combat AI without affecting production save files.
- **Tactical Combat Tester (`CombatTester.tsx`):** Grid encounter harness for spawning monsters, testing action economy, and verifying spell mechanics.
- **NPC Slot Tester (`npc_tester.tsx`):** Synchronizer testing party character slots and `useCharacterStore` persistence.
- **Simulator (`Simulator.tsx`):** Calculation tester verifying equipment compatibility and derived character stats.

### 4. Audio & Hardware Studio
Control physical audio stems, sound effects, and smart light bulbs.
- **Sound Studio (`audio/SoundStudio.tsx`):** Multi-channel stem mixer, procedural SFX generator, and sound event tester.
- **Hue Lamp Controller (`DevKitHueTab`):** Philips Hue bridge auto-discovery, color wheel selector, and lamp control interface.
- **Quick Audio Mixer (`audio/Mixer.tsx`):** Floating audio channel overlay available across all DevKit tabs.

---

## Maintenance & Refactor Roadmap

Dependency order for follow-up refactor Issues:
**#366 → #408 → (#367 / #368) → #409** *(note: #368 also depends on #377)*

1. **#408 — Inline Authoring Extraction:** Extract inline Enemy, Equipment, Material, Habitat, and Hue authoring panels out of `DevKit.tsx` (2,553 lines) into standalone components under `src/components/devkit/generators/` and `src/components/devkit/hardware/`.
2. **#367 — Unified Atlas & World Explorer:** Combine `AssetExplorer.tsx` and `WorldExplorer.tsx` into a single unified search and browsing shell.
3. **#368 — NPC Generator Modernization:** Replace hardcoded legacy D&D data arrays in `npcGeneratorUtils.ts` with canonical Atlas loaders (`storageService.ts`). (Depends on #408 and #377).
4. **#409 — Housekeeping & Dead Code Removal:** Remove unimported legacy files (`AudioLaboratory.tsx`) and synchronize all test harnesses. (Depends on #367 and #368).
