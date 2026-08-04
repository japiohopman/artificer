# Artificer Task Board

## Critical
- [x] check priorety1.md for map update refinment in main/priority1.md
- [x] Implement Temperature system in `useWorldStore.ts`.
- [x] Integrate Meteocons icon library for Time and Weather.
- [x] Reorganize Dev Kit (Inspectors, Generators, Testers grouping).
- [x] Align Jane module with JSON schemas and existing atlas lore.
- [x] Complete TSX translation of Tactical Combat Grid (Aedif inspiration).
- [x] check and fix errors in the main/errors.md
- [x] Create asset validation script.
  - Check all JSON parseable.
  - Index matches filename.
  - url/image/imageUrl existence.
  - Remove legacy paths (e.g., `/artificer-main/codex/assets/`).
  - No GitHub raw URLs in runtime JSON.
- [x] Fix equipment path issues (e.g., `longsword.json`, `backpack.json`, `burglars_pack.json`).
- [x] Establish canonical asset paths (use `/assets/atlas/...` for runtime).
- [x] Normalize references to other JSON records (ID-only + generated index).
- [x] **Icon Optimization and Tactical Loading**
  - [x] Audit `src/assets/icons/` for duplicates and placeholders.
  - [x] Consolidate core/common icons into `core.ts`.
  - [x] Refactor `src/game_icons.tsx` to support granular/tactical loading.
  - [x] Deduplicate icons between UI and Codex Arcane.
  - [x] Enhance `atlasUtils.ts` for automated feature/subclass mapping.

## High
- [x] Generate indexes per domain (equipment, spell, enemies, magic_items, maps).
- [x] Fix references to category JSON (e.g., `equipment_categories`, `damage_types`).
- [ ] Implement allowlist for external/special paths.
- [ ] Check image coverage per domain.
- [x] Character Save Migration:
  - Migrate backpack array + inventory object to items registry + containers + equipment slots.
  - Add `saveVersion: 2`.
  - Implement item registry in saves.

## Medium
- [x] Equipment Normalization:
  - Add `kind` field for game logic.
  - Create sub-schemas per equipment kind (weapon, armor, pack, tool, etc.).
  - Add `equipSlots` and `requiredSlots` to templates.
- [x] Sound Asset Reorganization (Completed).
- [x] Implement Skill Database documentation.
- [ ] Asset Registry maintenance.

## Low
- [ ] Size budgets for assets (WEBP/PNG < 1MB).
- [ ] Lazy-load assets per game screen.
- [ ] Create thumbnail variants for inventory/shop UI.
- [x] Documentation updates: `ASSETS.md`, `README.md` for modules.

## Phase 2: World State & Tactical Foundations
- [x] **System Documentation (Architecture First)**
  - [x] Define Party State & World State schemas.
  - [x] Design Travel, Time, and Weather systems.
  - [x] Blueprint World Panel Architecture & Data Flow.
  - [x] Deep-dive documentation for Phase 2 systems (Travel, Combat, Stores).
- [x] **Store Slicing (Infrastructure)**
  - [x] Refactor `useStore.ts` into specialized slices (`useUIStore`, `useAtlasStore`, `useGameStore`).
  - [x] Migrate global state to appropriate slices.
- [x] **World State Module**
  - [x] Implement Temporal Progression (`gameYear`, `gameMonth`, `gameDay`, `gameTime`).
  - [x] Create Environmental Engine for dynamic weather.
  - [x] Implement Discovery system (Explored Areas registry).
  - [x] Setup Faction & World Flags system.
- [x] **Journal & Persistence**
  - [x] Document Journal specifications (`docs/modules/journal.md`).
  - [x] Implement `Journal.tsx` component.
  - [x] Setup Session Summaries and Quest Tracker logic (UI/Store implementation).

## Phase 3: Character Creation & Level Up Overhaul
### ⚔️ Spelmechanica & Karakterdiepte (Mechanics & Depth)
- [ ] **Point Buy Calculator**:
  - Implement full 27-point buy logic under standard 5.5e rules.
  - Block stats above 15 (before racial traits/bonuses) and allow refunding points down to 8.
- [ ] **Geavanceerde Spellbook Manager**:
  - Extend `SpellsStep.tsx`, `FocusView.tsx`, and `SpellCard.tsx`.
  - Filter by Spell Level, School of Magic, Casting Time, Ritual, Concentration, Class availability, and Prepared Spells.
  - Utilize dedicated tier icons (`public/assets/icons/spell-tiers/spell1.webp` to `spell9.webp`).
- [ ] **Feat Selection bij Level Up (ASI)**:
  - Implement choosing Feats from `/assets/atlas/feats/json/` during Level Up ASI.
  - Support prerequisites, +1 Ability score increases, and features integration in the full Character sheet.
- [ ] **Automatisch HP Level Up Proces**:
  - Integrate automatic HP rolls with class hit dice, apply Con modifier automatically, and support "Average HP" fallback.

### 🎭 Visuele & Zintuiglijke Beleving (UI/UX Immersion)
- [ ] **Per-Attribute 3D Dice Rolls**:
  - Roll 4d6 (drop lowest) with custom 3D animations using the Dice Box for each attribute.
  - Add explicit "1 official roll attempt" warning to prevent cheat-re-rolling.
- [ ] **Equipment Pack Inspectie (FocusView)**:
  - Utilize or extend `src/components/ui/FocusView.tsx` to inspect packs (Explorer's, Dungeoneer's, etc.).
  - Display item icons, description, weight, and specific properties in an interactive container detail modal.
- [ ] **Recruitable NPC & Character-Paspoort**:
  - Design beautiful Character Cards for player characters and recruitable NPCs (`public/assets/atlas/characters/recruit_npc/`).
  - Feature portraits, stats, radar chart, subclass/level badges, background seals, and thematic card borders.

### ⚙️ Technische Optimalisatie & Snelheid
- **Asset Sprite Sheets**:
  - Convert class icons, race artwork, and atlas illustrations into packed, compact sprite sheets for instantaneous load times.
- **Pre-fetching, Parallel Hydration & Caching**:
  - Pre-fetch Atlas data on Creator boot, implement `Promise.all` parallel feature hydration during Level Up, and build IndexedDB/LocalStorage offline caching.

## Future Modules (Roadmap)
- [ ] **NPC Memory Module**
  - [ ] Affinity System (-10 to +10 scale).
  - [ ] Interaction Log & Memory Index.
- [x] **Atlas Map Module**
  - [x] Interactive spatial interface (Leaflet-like).
  - [x] High-resolution Pyramid Tile system (`/tiles/faerun`).
  - [x] Dynamic Icons & Zoom-dependent visibility.
  - [x] Party Travel & Movement Interpolation.
  - [x] Fog of War (Pathing persistence/Explored areas).
- [x] **Tactical Combat Engine**
  - [x] Grid-Based Movement & Collision (A* Pathfinding).
  - [x] Initiative Tracker & Turn Sequence UI.
  - [x] Exploration Mechanics (Interactive Doors, LoS, Fog of War).
  - [x] AI Awareness State Machine (View Cones, Perception, Search).
  - [x] AI Combat Logic (Tool calls for Narrator integration).
- [ ] **Economic & Trade Module**
  - [ ] Regional Pricing & Merchant Inventory rotation.
- [ ] **Soundscape Orchestrator**
  - [ ] Mood-Based Transitions & Ambient Layering.
- [ ] **Rule Engine & Condition Tracker**
  - [ ] Condition Management & Rest/Recovery resolution.

## Repo Hygiene
- [x] Removed forked `dnd5e-6.0.x` and duplicated `tactical-grid-main/tactical-grid-main`
- [x] Removed SRD PDF (`Rulebooks/srd/system_reference_document.pdf`)
- [ ] Pick real hosting for runtime-needed heavy assets (world map, `public/assets/sounds/**`, enemy tokens) — Firebase Storage or Git LFS
- [ ] Update fallback URLs in `atlasService.ts` (line ~174) and `soundService.ts` (`GITHUB_RAW_BASE`) to point at that host
- [ ] Remove local copies of those assets from git once the above is verified working
- [ ] Delete `src/store/useStore.ts` — empty deprecated stub, confirmed unused (see below)