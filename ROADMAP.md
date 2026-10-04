# 🗺️ Strategic Roadmap

[`GOALS.md`](./GOALS.md) defines long-term product direction. This document outlines current strategic priorities and feature ordering context.

Active execution contracts live strictly in **GitHub Issues**. Refer to [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) for the authoritative operating model.

---

## ChatGPT-Curated Execution Sequence

> This sequence is project-management guidance maintained by ChatGPT together with the human project owner. GitHub Issues remain the authoritative execution contracts. The Issue-first dispatcher consumes this sequence only to determine order; Issue Quality Gate, dependency checks, and the live dispatch safety gate still control execution.

| Order | Issue / checkpoint | Purpose | Current state |
|---|---|---|---|
| 1 | #387 | Establish roadmap sequencing and automatic readiness handoff | **completed — merged** |
| 2 | #389 | Repair canonical directory-reference handling in the live Jules selector | **completed — merged** |
| 3 | #365 | Complete Foundry 2024 species source parity | **completed — merged** |
| 4 | #376 | Close remaining 2024 runtime ruleset gaps | **completed — merged** |
| 5 | #396 | Restore runtime Species selection data loading | **completed — merged** |
| 6 | #393 | Verify Character Creator stability on the corrected 2024 foundation | **completed — verified** |
| 7 | #401 | Align player-controlled level-up progression with Character Creator and Atlas semantics | **completed — merged** |
| 8 | #382 | Integrate canonical level-up HP/dice resolution | **completed — merged** |
| 9 | #383 | Unify feature/ASI/feat/follow-up progression choices | **completed — merged** |
| 10 | #377 | Restore deterministic non-LLM Character Creator narrative generation | **completed — merged** |
| 11 | #366 | Define the target DevKit workspace architecture and tab responsibilities | **completed — merged via #410** |
| 12 | #408 | Extract inline authoring modules and modularize DevKit shell | **next implementation — after #366** |
| 13 | #367 | Replace split inspectors with unified Atlas and World Explorer | **after #408** |
| 14 | #368 | Rebuild NPC generator as complete character orchestration pipeline | **after #408 and #377** |
| 15 | #409 | Remove orphaned DevKit tools and align tester/audio modules | **after #408, #367 and #368** |
| 16 | #369 | Establish canonical BattleMap schema, edge semantics, hazards and CombatTester integration | **after DevKit architecture sequence** |
| 17 | #372 | Establish canonical dice resolution, seeded RNG and action auditability | **after #369** |
| 18 | #370 | Build data-driven random encounter tables and travel integration | **after #372** |

This order is intentionally not a raw priority sort. It is the current foundation sequence chosen from repository evidence and dependency risk. Implementation scope belongs in each Issue.

---

## Strategic Priorities

### Current Focus Areas

1. **Inventory & Equipment UX & Interaction Polish**
   - High-fidelity drag-and-drop interactions, slot feedback, and sound integration.
   - Grounded in canonical `character/inventory/` and `character/equipment/` boundaries.

2. **Canonical Character Profile & CharacterScreen Refactor**
   - Single reusable character profile and presentation layer across TitleScreen, HUD, and character-facing views.
   - Elevating Traits, Ideals, Bonds, and Flaws to first-class character data.

3. **Gameplay & AI DM Systems**
   - AI DM tool-call integrations and structured narrative character context.
   - Recruitable NPC passport reuse and combat loop verification.

---

## Completed Strategic Foundations

- **2024 Atlas Data Ingestion & Ruleset Isolation:** Full ingestion and audit of 2024 PHB species, classes, 1–20 progressions, subclasses, origin backgrounds, feats, spells, and subraces.
- **Character Creator Choice & Mirror System:** Explicit selection states, required-selection gates, persistent body/background presentation, and Character Mirror primitives.
- **Canonical SVG Icon Architecture:** Standardized `GameIcon` component backed by build-time asset generation in `public/assets/icons/svg/`.
- **Combat Integration v1:** Unified battle map loading, tactical combat grid, and combat tester pipeline.

---

## Strategic Roadmap Rules

1. `ROADMAP.md` provides ChatGPT-curated sequence, context, and priority orientation; it is **not** the source of implementation scope.
2. Every actionable work item must be represented by a **GitHub Issue**.
3. Implementation details, acceptance criteria, verification, and specialist routing belong in the assigned GitHub Issue and `.github/agents/`.
4. ChatGPT maintains the intended sequence; Jules reports factual progress for its assigned Issue and does not choose the next Issue.
5. Automatic readiness advancement is governed by the workflow contract tracked in Issue #387 and must still pass Issue Quality Gate and dependency checks.

---

*Strategic priority map for Artificer.*
