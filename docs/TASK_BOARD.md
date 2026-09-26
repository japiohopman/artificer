# Artificer Task Board (Historical Migration Reference & Audit Log)

> **HISTORICAL NOTICE:**
> `docs/TASK_BOARD.md` is retained strictly as a historical migration and audit reference.
> It is **not** an active execution queue, dispatch input, or source of task scope for Jules or human developers.
>
> All active development work is governed strictly by **GitHub Issues**.
> Refer to [`ROADMAP.md`](../ROADMAP.md) for strategic priorities and [`docs/WORKFLOW.md`](./WORKFLOW.md) for the authoritative operating model.

---

## Migration & Audit Matrix

Every actionable item from the retired `TASK_BOARD.md` and legacy `priority1.md` task document has been audited and classified below into explicit completed historical PRs, active GitHub Issues (#300, #301, #302, etc.), or superseded architecture to prevent any silent scope loss:

### 1. Legacy `priority1.md` Detailed Scope Breakdown

`priority1.md` was a 1,353-line specifications document covering two distinct inventory architectural passes:

- **Part 1 — Inventory & Equipment Visual Asset Foundation:**
  - *Scope:* Migrated runtime inventory sprite rendering from legacy `equipmentSpriteMap.ts` to `src/lib/inventoryVisuals/`, added cell crop derivation for 4x7 sheets, and established sprite manifest mapping.
  - *Disposition:* **Completed Historical Scope** — Merged in **PR #265** and **PR #280**.
- **Part 2 — Premium RPG Drag & Drop Interaction Pass & Workspace UX:**
  - *Scope:* Upgraded `@dnd-kit` drag previews (`InventoryDragPreview.tsx`), hover slot highlights, slot compatibility feedback, and full equipment workspace interactions.
  - *Disposition:* **Active Follow-up Scope** — Governed by open active GitHub Issues **Issue #300** (FullInventoryMenu workspace interactions), **Issue #301** (Equipment Workspace UI polish & slot feedback), and **Issue #302** (Equipment Doll paper-doll interactions).

---

### 2. Unchecked `TASK_BOARD.md` Items Audit & Disposition

| Legacy Task Item | Original Domain | Historical Audit & Disposition |
| :--- | :--- | :--- |
| **Starting Equipment Eligibility Resolver** | Character Creation / Level Up | **Active Scope / Backlog Issue** — Tracked under **Issue #300** / Character Creation starting equipment flow; prioritized in `ROADMAP.md`. |
| **Point Buy Calculator** | Character Creation | **Active Scope / Backlog Issue** — Tracked under Character Creator **Issue #301** (Standard 27-point-buy calculator in `StatsStep.tsx`). |
| **Advanced Spellbook Manager** | Character Creation / Gameplay | **Active Scope / Backlog Issue** — Tracked under **Issue #302** / Spells step filters and spell slot tracking. |
| **Feat selection during ASI / Level Up** | Character Creation / Level Up | **Active Scope / Backlog Issue** — Tracked under Level Up & Character Creation Feat progression issues. |
| **Automatic HP Level-Up Flow** | Character Creation / Level Up | **Active Scope / Backlog Issue** — Tracked under Level Up progression issues. |
| **Per-attribute 3D ability-score rolls** | Character Creation / DevKit | **Active Scope / Backlog Issue** — Tracked under 3D Dice / Stat generation issues. |
| **Equipment Pack inspection in FocusView** | Character Creation / Inventory | **Active Scope / Backlog Issue** — Tracked under Equipment Pack inspection issues in `FocusView`. |
| **Recruitable NPC Passport reuse** | Character Profile / Gameplay | **Active Scope / Backlog Issue** — Tracked under Narrative & Recruitable NPC passport issues. |
| **NPC Memory & Relationship History** | Runtime / Narrative AI | **Active Scope / Backlog Issue** — Tracked under Narrative AI / Memory issues. |
| **Economic & Trade Module** | Runtime / World Systems | **Strategic Backlog Focus** — Parked in `ROADMAP.md` under long-term world simulation goals. |
| **Soundscape Orchestrator** | Audio Systems | **Strategic Backlog Focus** — Parked in `ROADMAP.md` under long-term audio system goals. |
| **Rule Engine / Condition Tracker** | Gameplay / Combat Engine | **Active Scope / Backlog Issue** — Tracked under Tactical Combat Engine & Condition tracking issues. |
| **Journal / DM / LM Integration** | Narrative AI / Systems | **Active Scope / Backlog Issue** — Tracked under AI DM tool-call & Journal context issues. |
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
