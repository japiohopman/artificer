# Artificer Task Board

## Critical
- [x] Create asset validation script.
  - Check all JSON parseable.
  - Index matches filename.
  - url/image/imageUrl existence.
  - Remove legacy paths (e.g., `/artificer-main/codex/assets/`).
  - No GitHub raw URLs in runtime JSON.
- [x] Fix equipment path issues (e.g., `longsword.json`, `backpack.json`, `burglars_pack.json`).
- [x] Establish canonical asset paths (use `/assets/atlas/...` for runtime).
- [ ] Normalize references to other JSON records (ID-only + generated index).
- [x] **Icon Optimization and Tactical Loading**
  - [x] Audit `src/assets/icons/` for duplicates and placeholders.
  - [x] Consolidate core/common icons into `core.ts`.
  - [x] Refactor `src/game_icons.tsx` to support granular/tactical loading.
  - [x] Deduplicate icons between UI and Codex Arcane.
  - [x] Enhance `atlasUtils.ts` for automated feature/subclass mapping.

## High
- [ ] Generate indexes per domain (equipment, spell, enemies, magic_items, maps).
- [ ] Fix references to category JSON (e.g., `equipment_categories`, `damage_types`).
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
- [ ] Implement Skill Database documentation.
- [ ] Asset Registry maintenance.

## Low
- [ ] Size budgets for assets (WEBP/PNG < 1MB).
- [ ] Lazy-load assets per game screen.
- [ ] Create thumbnail variants for inventory/shop UI.
- [ ] Documentation updates: `ASSETS.md`, `README.md` for modules.

## Phase 2: World State & Tactical Foundations
- [x] **System Documentation (Architecture First)**
  - [x] Define Party State & World State schemas.
  - [x] Design Travel, Time, and Weather systems.
  - [x] Blueprint World Panel Architecture & Data Flow.
- [ ] **Store Slicing (Infrastructure)**
  - [ ] Refactor `useStore.ts` into specialized slices (`useCharacterStore`, `useInventoryStore`, `useWorldStore`).
  - [ ] Migrate global state to appropriate slices.
- [ ] **World State Module**
  - [ ] Implement Temporal Progression (`gameYear`, `gameMonth`, `gameDay`, `gameTime`).
  - [ ] Create Environmental Engine for dynamic weather.
  - [ ] Setup Faction & World Flags system.
- [ ] **Journal & Persistence**
  - [ ] Implement `Journal.tsx` component.
  - [ ] Setup Session Summaries and Quest Tracker logic.

## Future Modules (Roadmap)
- [ ] **NPC Memory Module**
  - [ ] Affinity System (-10 to +10 scale).
  - [ ] Interaction Log & Memory Index.
- [ ] **Atlas Map Module**
  - [ ] Interactive spatial interface (Leaflet-like).
  - [ ] Dynamic Markers and Fog of War.
- [ ] **Tactical Combat Engine**
  - [ ] Grid-Based Movement & Collision.
  - [ ] Initiative Tracker & AI Combat Logic.
- [ ] **Economic & Trade Module**
  - [ ] Regional Pricing & Merchant Inventory rotation.
- [ ] **Soundscape Orchestrator**
  - [ ] Mood-Based Transitions & Ambient Layering.
- [ ] **Rule Engine & Condition Tracker**
  - [ ] Condition Management & Rest/Recovery resolution.
