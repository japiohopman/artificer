# Artificer Task Board (Historical Migration Reference & Audit Log)

> **HISTORICAL NOTICE:**
> `docs/TASK_BOARD.md` is retained strictly as a historical migration and audit reference.
> It is **not** an active execution queue, dispatch input, or source of task scope for Jules or human developers.
>
> All active development work is governed strictly by **GitHub Issues**.
> Refer to [`ROADMAP.md`](../ROADMAP.md) for strategic priorities and [`docs/WORKFLOW.md`](./WORKFLOW.md) for the authoritative operating model.

---

## Migration & Audit Matrix

Every actionable item from the retired `TASK_BOARD.md` and legacy `priority1.md` task document has been inventoried, classified, and mapped below to prevent any silent scope loss:

| Unchecked Legacy Item | Domain / Context | Status & Disposition |
| :--- | :--- | :--- |
| **Inventory Asset Foundation & Drag-and-Drop Interaction Pass** | Inventory / Equipment UI | **Completed & Merged via PR #310** (Issue #310). `priority1.md` was retired. |
| **Starting Equipment Eligibility Resolver** | Character Creation / Level Up | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Ruleset & Class aware starting equipment selection). |
| **Point Buy Calculator** | Character Creation | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Standard 27-point-buy calculator in `StatsStep.tsx`). |
| **Advanced Spellbook Manager** | Character Creation / Gameplay | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Filters, spell slot tracking, and canonical Atlas spell data). |
| **Feat selection during ASI / Level Up** | Character Creation / Level Up | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Level 4/8/12/16/19 ASI vs Feat selection flow). |
| **Automatic HP Level-Up Flow** | Character Creation / Level Up | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Class hit die average vs roll calculation on level up). |
| **Per-attribute 3D ability-score rolls** | Character Creation / DevKit | **Tracked as GitHub Issue** (3D dice rolling integrated into character stat generation). |
| **Equipment Pack inspection in FocusView** | Character Creation / Inventory | **Tracked as GitHub Issue** (Inspection modal for starting equipment packs). |
| **Recruitable NPC Passport reuse** | Character Profile / Gameplay | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Reusing canonical Character Profile for recruits). |
| **NPC Memory & Relationship History** | Runtime / Narrative AI | **Tracked as GitHub Issue / Strategic Roadmap Focus** (NPC interaction state and sentiment tracking). |
| **Economic & Trade Module** | Runtime / World Systems | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Regional commodity pricing and trading). |
| **Soundscape Orchestrator** | Audio Systems | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Multi-layered adaptive ambient audio mixer). |
| **Rule Engine / Condition Tracker** | Gameplay / Combat Engine | **Tracked as GitHub Issue / Strategic Roadmap Focus** (Tracking D&D conditions e.g. Poisoned, Prone, Stunned). |
| **Journal/DM/LM Integration** | Narrative AI / Systems | **Tracked as GitHub Issue** (Structured narrative state passed to AI DM/LM context). |
| **Spawn / Entry Point Placement** | World & Location Flow | **Tracked as GitHub Issue** (Tile map marker spawn points for tactical entry). |
| **HUD Responsibility Cleanup** | UI Architecture | **Tracked as GitHub Issue** (Refactoring runtime HUD vs full-screen overlays). |
| **WorldMap / LocationMap Specialization** | World Systems | **Tracked as GitHub Issue** (Decoupling macro world map from micro location tactical map). |
| **D&D Markdown Styling in WorldPanel** | UI Presentation | **Tracked as GitHub Issue** (Applying `DnDMarkdown` rendering to World Panel lore). |
| **Module Documentation Audit** | Documentation | **Tracked as GitHub Issue** (Auditing `docs/modules/` against current source code). |

---

## Historical Archive Context

This board was previously used to track concrete implementation and acceptance state during early development passes. All actionable work from this board has been migrated to GitHub Issues or reflected in the strategic [`ROADMAP.md`](../ROADMAP.md).

### Completed Engineering Foundations (Archived)
1. **2024 Atlas Data Ingestion & Ruleset-Aware Character Creation:** All core 2024 domains (Species, Classes, Progressions, Subclasses, Backgrounds, Feats, Spells) migrated and verified.
2. **Character Creator Presentation & Mirror:** Choice state and visual mirror architecture completed and merged.
3. **Canonical SVG Icon System:** Icon registry and SVG assets fully migrated to `public/assets/icons/svg/`.
4. **Inventory & Equipment Architecture:** Consolidated under `src/components/character/inventory/` and `src/components/character/equipment/`.

---
*For active tasks, inspect open GitHub Issues in the repository.*
