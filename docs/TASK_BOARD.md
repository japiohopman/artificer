# Artificer Task Board (Historical Migration Reference & Audit Log)

> **HISTORICAL NOTICE:**
> `docs/TASK_BOARD.md` is retained strictly as a historical migration and audit reference.
> It is **not** an active execution queue, dispatch input, or source of task scope for Jules or human developers.
>
> All active development work is governed strictly by **GitHub Issues**.
> Refer to [`ROADMAP.md`](../ROADMAP.md) for strategic priorities and [`docs/WORKFLOW.md`](./WORKFLOW.md) for the authoritative operating model.

---

## Migration & Audit Matrix

Every actionable item from the retired `TASK_BOARD.md` and legacy `priority1.md` task document has been audited and classified below with explicit historical provenance or disposition to prevent any silent scope loss:

### 1. Legacy `priority1.md` Audit & Disposition

`priority1.md` was a 1,353-line specifications document covering two distinct inventory architectural passes:
1. **Part 1 — Inventory & Equipment Visual Asset Foundation:** Migrated runtime inventory sprite rendering from legacy `equipmentSpriteMap.ts` to `src/lib/inventoryVisuals/` (merged in PR #265 & PR #280).
2. **Part 2 — Premium RPG Drag & Drop Interaction Pass:** Upgraded `@dnd-kit` drag previews (`InventoryDragPreview.tsx`), hover slot highlights, and equipment slot drag interactions in `src/components/character/inventory/` and `src/components/character/equipment/`.

*Disposition:* Fully implemented and merged across PR #265, PR #280, and the `character/inventory` refactor; `priority1.md` is retired as a duplicate specification artifact.

---

### 2. Unchecked `TASK_BOARD.md` Items Audit & Disposition

| Legacy Task Item | Original Domain | Historical Audit & Disposition |
| :--- | :--- | :--- |
| **Starting Equipment Eligibility Resolver** | Character Creation / Level Up | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Ruleset & Class aware starting equipment selection). |
| **Point Buy Calculator** | Character Creation | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Standard 27-point-buy calculator in `StatsStep.tsx`). |
| **Advanced Spellbook Manager** | Character Creation / Gameplay | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Filters, spell slot tracking, and canonical Atlas spell data). |
| **Feat selection during ASI / Level Up** | Character Creation / Level Up | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Level 4/8/12/16/19 ASI vs Feat selection flow). |
| **Automatic HP Level-Up Flow** | Character Creation / Level Up | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Class hit die average vs roll calculation on level up). |
| **Per-attribute 3D ability-score rolls** | Character Creation / DevKit | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Optional 3D dice rolling integrated into character stat generation). |
| **Equipment Pack inspection in FocusView** | Character Creation / Inventory | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Detail inspection modal for starting equipment packs). |
| **Recruitable NPC Passport reuse** | Character Profile / Gameplay | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (*Gameplay & AI DM Systems* focus area). |
| **NPC Memory & Relationship History** | Runtime / Narrative AI | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (*Gameplay & AI DM Systems* focus area). |
| **Economic & Trade Module** | Runtime / World Systems | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Regional commodity pricing and trading). |
| **Soundscape Orchestrator** | Audio Systems | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Multi-layered adaptive ambient audio mixer). |
| **Rule Engine / Condition Tracker** | Gameplay / Combat Engine | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (Tracking D&D conditions e.g. Poisoned, Prone, Stunned). |
| **Journal / DM / LM Integration** | Narrative AI / Systems | **Strategic Priority / Backlog Focus** — Outlined in `ROADMAP.md` (*Gameplay & AI DM Systems* focus area). |
| **Spawn / Entry Point Placement** | World & Location Flow | **Completed / Superseded** — Implemented in `BattleMapEditor` (`src/components/devkit/BattleMapEditor/`) and map loading adapters. |
| **HUD Responsibility Cleanup** | UI Architecture | **Completed / Superseded** — Refactored during `CharacterPanel` mirror migration (`src/components/character/panel/`). |
| **WorldMap / LocationMap Specialization** | World Systems | **Completed / Superseded** — Decoupled macro world view (`WorldPanel.tsx`) from micro tactical combat grid (`CombatGrid.tsx`). |
| **D&D Markdown Styling in WorldPanel** | UI Presentation | **Completed / Superseded** — Standardized application-wide via `DnDMarkdown.tsx` component. |
| **Module Documentation Audit** | Documentation | **Completed / Superseded** — Completed during Phase 2 documentation pass (`docs/ARCHITECTURE_CAPABILITY_MAP.md` and `docs/WORKFLOW.md`). |

---

## Historical Archive Context

This board was previously used to track concrete implementation and acceptance state during early development passes. All actionable work from this board has been audited and classified above, with active execution contracts governed strictly by GitHub Issues.

### Completed Engineering Foundations (Archived)
1. **2024 Atlas Data Ingestion & Ruleset-Aware Character Creation:** All core 2024 domains (Species, Classes, Progressions, Subclasses, Backgrounds, Feats, Spells) migrated and verified.
2. **Character Creator Presentation & Mirror:** Choice state and visual mirror architecture completed and merged.
3. **Canonical SVG Icon System:** Icon registry and SVG assets fully migrated to `public/assets/icons/svg/`.
4. **Inventory & Equipment Architecture:** Consolidated under `src/components/character/inventory/` and `src/components/character/equipment/`.

---
*For active tasks, inspect open GitHub Issues in the repository.*
