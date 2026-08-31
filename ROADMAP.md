# 🗺️ Artificer Roadmap

> **Canonical roadmap.** This is the **only** roadmap file. `ROADMAP.md` at the repository root is the authoritative source for current priority, Jules dispatch state, and phase status.
>
> `docs/TASK_BOARD.md` is the detailed execution checklist behind this roadmap. Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` and relevant module/system docs.

## Roadmap ownership

- **Canonical priority/state:** `ROADMAP.md` (this file)
- **Detailed execution checklist:** `docs/TASK_BOARD.md`
- **Architecture decisions:** `docs/ARCHITECTURE_STATUS.md` and relevant module/system docs
- **Jules orchestrator:** reads **only** `ROADMAP.md` → `## Now`
- `.github/workflows/` contains automation only; it must not contain a second roadmap or task queue.

### Jules queue contract

- Jules may dispatch only from `### Ready`.
- `### Active` contains at most one task in v1.
- `### Blocked` and `### Human Review` are never auto-dispatched.
- A merge does **not** mean a task is complete. Human review, runtime verification, and documentation/architecture checks are required before `[x]` is applied.
- Large architectural tasks require explicit scope, acceptance criteria, and out-of-scope boundaries.
- The orchestrator starts Jules from `main`; feature work is reviewed/merged by Jaap before the queue advances.

## Now

### Active

- [ ] **Character Creator — Species Character Panel / Choice State / Equipment & Spell Presentation v1**
  - **Branch:** `feat/character-creator-species-mirror-6934090321828657621`
  - **Goal:** establish one clean, data-driven Character Panel foundation shared by Character Creator and the future runtime HUD, while completing the Species → Class → Traits/Skills → Arcana/Spells → Equipment presentation flow.
  - **Current focus:** right-panel composition, explicit choice state, shared character presentation primitives, Traits sections, Equipment Doll overlay, and canonical spell sprites.
  - **Character Panel:** begins at Species; prior Welcome/Slot/Identity stages use the full stage without a reserved aside.
  - **Choice state:** cards remain neutral until explicitly selected; hover and selected states are distinct; Continue is disabled until valid and uses a subtle pulse when progression is available.
  - **Character data:** static rules/species data comes from Atlas; current selections/state come from `useCharacterStore`; derived values use canonical domain calculations.
  - **Character presentation:** species body/background, HP, AC, Speed, Initiative and six ability-score tabs are rendered dynamically; only confirmed choices are shown.
  - **Panel architecture:** shared presentation lives under `src/components/character/panel/`; shared presentation must not depend on `CharacterCreator/*` internals.
  - **Traits:** Overview/Skills/Traits become available after Class; Skills belong inside Traits rather than as a competing top-level tab. Trait subsections use canonical trait icons and only render conditional immunities/resistances/vulnerabilities when the character has them.
  - **Equipment:** EquipmentDoll remains under `src/components/character/equipment/` and is composed as an overlay over the same body SVG inside the Character Panel Equipment view; existing DnD/equip/context-menu behavior must remain intact.
  - **Spells:** existing `SpellSprite` + `SPELL_SPRITE_MANIFEST` architecture remains canonical. Completed cantrip and Level 1 sprite sheets under `public/assets/atlas/spell/sprites/` must be registered/mapped without guessing cell positions.
  - **HUD migration:** the existing runtime `CharacterPanel.tsx` will adopt the shared presentation only after the creator foundation is stable; do not maintain a third mirror/panel implementation.
  - **Documentation:** keep roadmap, task board, component map and relevant module docs synchronized with material architecture changes.
  - **Acceptance:** creator choice state is correct; shared panel renders canonical data; equipment overlay works; spell sprites resolve through the existing manifest; runtime behavior remains intact; lint/build/tests pass; human verification succeeds.

### Ready

- [ ] **Ruleset Selection & Ruleset Context — Remaining Downstream Audit**
  - Audit remaining rules-sensitive species, subraces, backgrounds, conditions and feature loaders for canonical 2014/2024 context resolution.
  - No component should hardcode `/14/` or `/24/` paths.

- [ ] **Inventory & Equipment Architecture / UX Follow-up**
  - Continue only after the current Character Creator Equipment overlay work is stable; consolidate remaining inventory/equipment presentation without introducing a duplicate inventory model.

- [ ] **Canonical Character Profile & CharacterScreen Refactor**
  - Establish reusable character-profile presentation primitives and later refactor TitleScreen, CharacterScreen and party-facing views around the same canonical character data.
  - Traits/Ideals/Bonds/Flaws remain first-class narrative character data for Journal/DM/LM context.

### Blocked

<!-- Human decision or external dependency. Never auto-dispatch. -->

### Human Review

- [ ] Character creation: point-buy stat system — exact product/rules decision still required.
- [ ] Character creation: advanced spellbook filters — design decision still required.

## Later

- Point Buy Calculator (standard 27-point buy)
- Advanced Spellbook Manager and richer spell selection/filtering
- ASI & Feat Selection
- Automated HP Level Up
- Per-attribute 3D ability-score rolls
- Equipment Pack inspection in `FocusView`
- AI DM tool-call integration, starting with a small controlled tool set
- NPC Memory / relationship history
- Economic & Trade systems
- Soundscape Orchestrator
- Rule Engine / Condition Tracker
- Journal/DM/LM structured character-context integration
- World/Location HUD responsibility cleanup and map decomposition
- Atlas and asset-loading performance work

## Maintenance

- Keep canonical Atlas asset/index validation current.
- Verify asset paths against canonical indexes before declaring asset-routing tasks complete.
- Keep module documentation synchronized with architectural changes.
- Add regression tests when existing runtime systems are refactored.
- Keep heavyweight/development-only artifacts out of runtime source assets.

---

**Rule:** There is one roadmap. If another file contains a roadmap copy, it is stale and must not be updated as a second source of truth.
