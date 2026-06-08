# Artificer Task Board

## Critical
- [ ] Create asset validation script.
  - Check all JSON parseable.
  - Index matches filename.
  - url/image/imageUrl existence.
  - Remove legacy paths (e.g., `/artificer-main/codex/assets/`).
  - No GitHub raw URLs in runtime JSON.
- [ ] Fix equipment path issues (e.g., `longsword.json`, `backpack.json`, `burglars_pack.json`).
- [ ] Establish canonical asset paths (use `/assets/atlas/...` for runtime).
- [ ] Normalize references to other JSON records (ID-only + generated index).
- [x] **Icon Optimization and Tactical Loading**
  - Audit `src/assets/icons/` for duplicates and placeholders.
  - Consolidate core/common icons into `core.ts`.
  - Refactor `src/game_icons.tsx` to support granular/tactical loading.
  - Deduplicate icons between UI and Codex Arcane.

## High
- [ ] Generate indexes per domain (equipment, spell, enemies, magic_items, maps).
- [ ] Fix references to category JSON (e.g., `equipment_categories`, `damage_types`).
- [ ] Implement allowlist for external/special paths.
- [ ] Check image coverage per domain.
- [ ] Character Save Migration:
  - Migrate backpack array + inventory object to items registry + containers + equipment slots.
  - Add `saveVersion: 2`.
  - Implement item registry in saves.

## Medium
- [ ] Equipment Normalization:
  - Add `kind` field for game logic.
  - Create sub-schemas per equipment kind (weapon, armor, pack, tool, etc.).
  - Add `equipSlots` and `requiredSlots` to templates.
- [ ] Sound Asset Reorganization (In Progress).
- [ ] Implement Skill Database documentation.
- [ ] Asset Registry maintenance.

## Low
- [ ] Size budgets for assets (WEBP/PNG < 1MB).
- [ ] Lazy-load assets per game screen.
- [ ] Create thumbnail variants for inventory/shop UI.
- [ ] Documentation updates: `ASSETS.md`, `README.md` for modules.
