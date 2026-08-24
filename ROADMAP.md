# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md) is the granular checklist. This document sits between them: it says **what we're actually finishing right now**, so agents (and Jaap) aren't tempted to start a new GOALS.md system while older ones are half-done.

This file is also the **agent dispatch contract** for the Jules orchestrator:
- Jules only receives work from `### Ready`.
- `### Active` contains at most one task in v1.
- `### Blocked` and `### Human Review` are never auto-dispatched.
- A task is not considered complete because Jules says "done"; completion is confirmed by human review, testing, and architecture/doc checks before the checkbox is marked `[x]`.
- Large architectural tasks must be written as explicit contracts with scope, acceptance criteria, and out-of-scope boundaries.

## Now

### Active

### Ready

- [ ] **Ruleset Selection & Ruleset Context — 2014 vs 2024 (Downstream Integration)**
  - **Status:** Canonical foundation (equipment, monsters) and Downstream Integration v1 (feats, class levels, spells) are complete. Remaining downstream loaders and rules-sensitive systems (conditions, features, subraces, backgrounds) remain to be audited and migrated in subsequent passes.
  - **Goal:** Ensure remaining rules-sensitive Atlas loaders resolve rules data through the canonical context boundary rather than hardcoding paths or independently guessing ruleset versions.
  - **Acceptance:** downstream Atlas loaders resolve versioned content through the canonical context boundary; no component hardcodes `/14/` or `/24/` paths; existing data remains loadable.
  - **Out of scope:** redesigning all D&D rules or creating mixed-ruleset fallback engines.


- [ ] **Inventory & Equipment Architecture / UX Overhaul**
  - **Goal:** consolidate the existing inventory/equipment implementations instead of adding another inventory screen. The current system has overlapping responsibilities across `Inventory.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `DraggableInventoryItem.tsx`, `EquipmentDoll.tsx`, `SpellInventory.tsx` and `CharacterPanel.tsx`.
  - **Intended responsibility boundaries:**
    - `src/components/hud/CharacterPanel.tsx` should remain a compact runtime HUD surface and should not contain a full 120-slot inventory workspace.
    - Character-domain inventory components should live under a clear `src/components/character/inventory/` module.
    - Character equipment presentation should live under `src/components/character/equipment/`.
    - `DraggableInventoryItem` should remain a reusable item-level primitive, not become the owner of inventory-screen behavior.
    - `FullInventoryMenu` should become the full inventory workspace for detailed management, party inventory/shared storage, inspection, scrolling and drag/drop.
    - `PartyInventory` remains an inventory-domain component, not a HUD implementation.
  - **Required UX:** provide a clear entry point from the compact CharacterPanel inventory/equipment view into `FullInventoryMenu`; the full inventory must have usable scrolling, category filtering, item inspection, equip/unequip, and working drag/drop where appropriate.
  - **Equipment presentation:** keep the equipment doll as a reusable presentation component; make equipment cards/slots visually consistent and use the intended 9:16 presentation where the asset format calls for it.
  - **Asset rendering:** fix the shared `ChromaKeyImage` behavior so green-screen equipment/character assets are actually keyed correctly without relying on ad-hoc local workarounds.
  - **State/data:** preserve the existing inventory V2/domain state as the canonical source; do not create another inventory data model merely to support the UI.
  - **Consolidation rule:** audit existing inventory components before creating new ones. Prefer extracting/composing existing behavior over cloning it.
  - **Acceptance:** CharacterPanel is compact and usable in the gameplay HUD; FullInventoryMenu is reachable and functional; items can be inspected; valid equipment can be equipped/unequipped; drag/drop works where intended; inventory grids scroll correctly; party/shared inventory remains usable; no duplicate inventory system is introduced; the resulting component structure is documented.
  - **Out of scope:** changing the underlying item registry/container data model unless the implementation proves a concrete blocker that cannot be solved at the presentation layer.
  - **Docs:** update `docs/COMPONENT_MAP.md` and the inventory module documentation if responsibilities/folders move.

- [ ] **Canonical Character Profile & CharacterScreen Refactor**
  - **Goal:** establish one reusable character profile/passport presentation instead of allowing each screen to invent its own character card/passport implementation, then use it to cleanly refactor the full `CharacterScreen.tsx`.
  - **Architecture:** create reusable character-profile presentation primitives that can be composed into compact/selection and full variants.
  - **Consumers:** TitleScreen, CharacterPanel/game UI and party-facing character views should reuse the same canonical profile primitives rather than duplicating portrait/identity/level/stat presentation logic.
  - **Character data boundary:** the future canonical character profile must include narrative fields such as Traits/Ideals/Bonds/Flaws as first-class character data; these are important inputs for Journal/DM/LM immersion and must not remain ad-hoc UI-only fields.
  - **File boundaries:** move character-profile-specific pieces into a clear `src/components/character/profile/` module where appropriate; keep `CharacterPanel` as a HUD surface and do not turn the new profile module into another God Component.
  - **TitleScreen:** refactor `src/components/core/TitleScreen.tsx` so it owns save-slot/new-game/continue orchestration, not its own parallel character presentation implementation.
  - **CharacterProfile:** refactor `src/components/character/CharacterProfile.tsx` into clear composition with professional responsive layout and explicit presentation boundaries.
  - **CharacterScreen:** after the profile/creator foundations are stable, consolidate the full screen around those reusable capabilities rather than continuing screen-specific implementations.
  - **Acceptance:** no new screen-specific `CharacterPassport`/`CharacterCard` implementation; TitleScreen and other consumers reuse canonical profile primitives; compact and full presentation variants are available; existing character behavior continues to work; layout is responsive and visually coherent; tests cover the shared profile integration.
  - **Out of scope:** image-generation pipeline and a full character-profile schema redesign are separate follow-up architecture work unless explicitly dispatched.
  - **Docs:** update `docs/COMPONENT_MAP.md` and character module docs to reflect the final responsibility boundaries.

### Blocked

### Human Review
- [ ] Character creation: point-buy stat system (currently standard-array + manual roll only) — exact rules still need an explicit product decision before dispatch.
- [ ] Character creation: advanced spellbook filters (level/ritual/concentration) — small design decision still needed before dispatch.

### Done this cycle (confirmed, not yet folded into GOALS.md phases)
- [x] Combat Integration v1 — BattleMap → CombatTester → CombatGrid (PR #261 accepted and merged)
- [x] Ruleset Selection & Ruleset Context — 2014 vs 2024 (Downstream Integration v1 Pass: Feats, Class Levels, Spells)
- [x] Ruleset Selection & Ruleset Context — D&D 2014 / 2024 Foundation Pass
- [x] Character Creator — Selection Experience v1 (PR #257 accepted and merged)
- [x] Character Creator — Species Visual Integration v1 (PR #247 accepted and merged)
- [x] XP animation — animated XP bar fill in CharacterPanel.tsx
- [x] Combat loop — XP/leveling bugs fixed and verified
- [x] Shared party XP (addPartyXp)
- [x] Location discovery
- [x] Fog-of-war granularity (pre-visible seas vs. discovered areas)
- [x] Right-hand character panel (portrait, level, XP bar)
- [x] Fuller character sheet (AC/HP/initiative via GameIcon, not bare numbers) — largely done, worth a final pass

## Conditional cleanup — do this once the condition is met, not before
- Remove the forked `dnd5e-6.0.x` folder and the duplicated `tactical-grid-main/tactical-grid-main` once the agents referencing them (Jimmy/Jane) confirm they no longer need them as inspiration. Until then they're allowed to stay, but they should not be extended or built on — reference only.
- Once that's out: move the remaining heavy binaries (93MB Sword Coast map, the music files, the SRD PDF) out of plain git — Git LFS or external asset hosting, per `docs/ASSET_REGISTRY.md`.

## Next — natural continuation, kept small on purpose
- **Phase 3 - Character Creation & Level Up Overhaul (Part 1)**:
  - [ ] **Point Buy Calculator**: Implement standard 27-point buy rules for Character Creator attribute step.
  - [ ] **Advanced Spellbook Manager**: Fully overhaul `SpellsStep.tsx` and spell selection using `FocusView` and tiered visual folders (`spell1.webp` to `spell9.webp`).
  - [ ] **Character Creator profile requirements:** after Selection Experience v1, define the canonical profile fields and validation model, including narrative identity (Traits/Ideals/Bonds/Flaws), before the Appearance/portrait-generation work begins.
- **Phase 3 - Character Creation & Level Up Overhaul (Part 2)**:
  - [ ] **ASI & Feat Selection**: Expand leveling to allow selecting feats (including attribute bonuses, prerequisites, and features) during level-up ASI.
  - [ ] **Automated HP Level Up**: Automate hit-die level-up HP rolls with Con modifiers and average HP options.
  - [ ] **Per-Attribute 3D Dice**: Roll 4d6 (drop lowest) with specific Dice Box animations per attribute.
  - [ ] **Equipment Pack Inspect**: Integrate `FocusView.tsx` as an interactive container inspector for equipment packages.
- AI DM tool-call integration (GOALS.md §12) — start with 2–3 tools only (e.g. dice roll, journal update), not the full tool list. Prove the narrator/mechanics boundary works before widening it.
- NPC Memory module — affinity system only, no interaction-log/vector search yet.

## Later — parked until Now is clear and the app is stable
- **Phase 3 - Optimizations**:
  - [ ] Sprite sheet packing for fast-loaded class, race, and atlas icons.
  - [ ] Pre-fetching of Atlas indexes and offline caching via IndexedDB/LocalStorage.
  - [ ] Parallel features loading via `Promise.all` in `LevelUpOverlay.tsx`.
- Economic simulation & regional pricing (GOALS.md §7)
- Faction & reputation system (GOALS.md §7)
- Philips Hue / physical lighting sync (GOALS.md §10 area)
- Vector-based session memory (GOALS.md §13)
- Fully autonomous adventure generation (GOALS.md §5)

These aren't bad ideas — they're exactly the kind of thing that makes this project fun. They're parked because each one is a new subsystem, and the project currently has more open subsystems than closed ones. Finishing the "Now" list is what makes starting these safe.

---
*Owned by whoever is coordinating the agents (Jules, or Jaap directly). Revisit this list when the "Now" section is empty — not before.*
