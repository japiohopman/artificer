# 🗺️ Strategic Roadmap

[`GOALS.md`](./GOALS.md) defines long-term product direction. This document outlines current strategic priorities and feature ordering context.

Active execution contracts live strictly in **GitHub Issues**. Refer to [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) for the authoritative operating model.

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

1. `ROADMAP.md` provides sequence, context, and priority orientation; it is **not** an execution queue or dispatch source.
2. Every actionable work item must be represented by a **GitHub Issue**.
3. Implementation details, acceptance criteria, and specialist routing belong in assigned GitHub Issues and `.github/agents/`.

---
*Strategic priority map for Artificer.*
