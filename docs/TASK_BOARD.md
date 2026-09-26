# Artificer Task Board (Historical Migration Reference & Audit Log)

> **HISTORICAL NOTICE:**
> `docs/TASK_BOARD.md` is retained strictly as a historical migration and audit reference.
> It is **not** an active execution queue, dispatch input, or source of task scope for Jules or human developers.
>
> All active development work is governed strictly by **GitHub Issues**.
> Refer to [`ROADMAP.md`](../ROADMAP.md) for strategic priorities and [`docs/WORKFLOW.md`](./WORKFLOW.md) for the authoritative operating model.

---

## Migration & Audit Matrix

Every actionable item from the retired `TASK_BOARD.md` and legacy `priority1.md` task document has been audited and classified below into explicit completed historical PRs, active GitHub Issues (#300, #301, #302), or unscheduled strategic concepts to prevent any silent scope loss:

### 1. Legacy `priority1.md` Detailed Scope Breakdown

`priority1.md` was a 1,353-line specifications document covering two distinct inventory architectural passes:

- **Part 1 — Inventory & Equipment Visual Asset Foundation:**
  - *Scope:* Migrated runtime inventory sprite rendering from legacy `equipmentSpriteMap.ts` to `src/lib/inventoryVisuals/`, added cell crop derivation for 4x7 sheets, and established sprite manifest mapping.
  - *Disposition:* **Completed Historical Scope** — Merged in **PR #265** (`Establish Inventory Sprite Asset Foundation v1`).
- **Part 2 — Premium RPG Drag & Drop Interaction Pass & Workspace UX:**
  - *Scope:* Upgraded `@dnd-kit` drag previews (`InventoryDragPreview.tsx`), hover slot highlights, slot compatibility feedback, and full equipment workspace interactions.
  - *Disposition:* **Active Follow-up Scope** — Foundation merged in `src/components/character/inventory/` and `src/components/character/equipment/`; active follow-up workspace and interaction items are governed by open GitHub Issues **Issue #300** (Inventory & Equipment Workspace interaction overhaul), **Issue #301** (Equipment workspace UI/visual architecture), and **Issue #302** (Equipment Sprite Sheet & Visual System Contract).

---

### 2. Unchecked `TASK_BOARD.md` Items Audit & Disposition

| Legacy Task Item | Original Domain | Historical Audit & Disposition |
| :--- | :--- | :--- |
| **Starting Equipment Eligibility Resolver** | Character Creation / Level Up | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for class/background gear eligibility; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Point Buy Calculator** | Character Creation | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for standard 27-point-buy calculator in `StatsStep.tsx`; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Advanced Spellbook Manager** | Character Creation / Gameplay | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for spell filtering and slot management; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Feat selection during ASI / Level Up** | Character Creation / Level Up | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for level 4/8/12/16/19 ASI vs Feat selection flow; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Automatic HP Level-Up Flow** | Character Creation / Level Up | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for hit die rolling/averaging on level up; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Per-attribute 3D ability-score rolls** | Character Creation / DevKit | **Retired / Unscheduled Strategic Concept** — Unscheduled feature concept for 3D dice rolls during stat generation; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Equipment Pack inspection in FocusView** | Character Creation / Inventory | **Retired / Unscheduled Strategic Concept** — Unscheduled UI feature concept for equipment pack inspection modal; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Recruitable NPC Passport reuse** | Character Profile / Gameplay | **Retired / Unscheduled Strategic Concept** — Unscheduled gameplay concept for sharing canonical `CharacterProfile` primitives with recruits; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **NPC Memory & Relationship History** | Runtime / Narrative AI | **Retired / Unscheduled Strategic Concept** — Unscheduled AI DM concept for tracking NPC sentiment/history; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Economic & Trade Module** | Runtime / World Systems | **Retired / Unscheduled Strategic Concept** — Long-term world simulation concept for regional pricing; listed in `ROADMAP.md` under *Later — parked until Now is clear*; no active execution Issue. |
| **Soundscape Orchestrator** | Audio Systems | **Retired / Unscheduled Strategic Concept** — Long-term audio system concept for adaptive ambient soundscapes; listed in `ROADMAP.md` under *Later — parked until Now is clear*; no active execution Issue. |
| **Rule Engine / Condition Tracker** | Gameplay / Combat Engine | **Retired / Unscheduled Strategic Concept** — Unscheduled combat engine concept for D&D condition tracking (Poisoned, Prone, Stunned); kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
| **Journal / DM / LM Integration** | Narrative AI / Systems | **Retired / Unscheduled Strategic Concept** — Unscheduled AI DM concept for passing structured narrative character state to LLM prompts; kept in `ROADMAP.md` as strategic follow-up context; no active execution Issue. |
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
