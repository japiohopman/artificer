# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md)
is the granular checklist. This document sits between them: it says **what we're actually
finishing right now**, so agents (and Jaap) aren't tempted to start a new GOALS.md system while
older ones are half-done. Update this file when priorities genuinely shift — not every sprint.

## Now

*Restructured for the Jules orchestrator: it only ever dispatches from ### Ready. Nothing
under ### Blocked or ### Human Review will be picked up automatically — those need you
(and whoever else is reviewing) to move them to Ready first, once they're safe to hand off.
This is a draft placement based on the last deep-dive — re-sort as you see fit before this
goes live, especially anything that looks architectural rather than a discrete fix.*

### Active
<!-- The orchestrator moves a task here when it starts it. At most one at a time in v1. -->

### Ready
- [ ] Inventory: container system + grid inventory with per-category sub-tabs (FullInventoryMenu.tsx is still a 193-line shell)
- [ ] Equipment_categories JSON: fix stale `url` fields to point at the real `/14/` and `/24/` versioned paths (see the equipment-atlas deep dive)

### Blocked
<!-- Move a task here yourself with a short reason if it's waiting on something outside Jules's control. -->

### Human Review
- [ ] Character creation: point-buy stat system (currently standard-array + manual roll only) — worth deciding the exact rules before handing this to Jules
- [ ] Character creation: advanced spellbook filters (level/ritual/concentration) — same, small design decision needed first

### Done this cycle (confirmed, not yet folded into GOALS.md phases)
- [x] XP animation — animated XP bar fill in CharacterPanel.tsx
- [x] Combat loop — XP/leveling bugs fixed and verified
- [x] Shared party XP (addPartyXp)
- [x] Location discovery
- [x] Fog-of-war granularity (pre-visible seas vs. discovered areas)
- [x] Right-hand character panel (portrait, level, XP bar)
- [x] Fuller character sheet (AC/HP/initiative via GameIcon, not bare numbers) — largely done, worth a final pass

## Conditional cleanup — do this once the condition is met, not before
- Remove the forked `dnd5e-6.0.x` folder and the duplicated `tactical-grid-main/tactical-grid-main`
  once the agents referencing them (Jimmy/Jane) confirm they no longer need them as inspiration.
  Until then they're allowed to stay, but they should not be extended or built on top of —
  reference only.
- Once that's out: move the remaining heavy binaries (93MB Sword Coast map, the music files,
  the SRD PDF) out of plain git — Git LFS or external asset hosting, per `docs/ASSET_REGISTRY.md`.

## Next — natural continuation, kept small on purpose
- **Canonical Character Profile & TitleScreen Refactor**:
  - [ ] Establish one reusable character profile/passport presentation instead of creating screen-specific character cards/passports.
  - [ ] Refactor `src/components/core/TitleScreen.tsx` to consume the canonical character profile rather than owning duplicate character presentation logic.
  - [ ] Refactor `src/components/character/CharacterProfile.tsx` into a clean, reusable profile composition with clear presentation boundaries; avoid replacing the current God Component with another generic God Component.
  - [ ] Define compact/selection and full profile variants so TitleScreen, game UI, and party UI can reuse the same character presentation primitives.
  - [ ] Bring the CharacterProfile layout to a consistent, professional responsive standard and remove ad-hoc layout patterns.
  - [ ] Preserve the existing character data/state as the canonical source; do not introduce parallel character schemas.
  - [ ] Add/update tests for the shared profile and TitleScreen integration.
  - **Acceptance:** no new screen-specific CharacterPassport/CharacterCard implementation; TitleScreen and other consumers reuse the canonical profile primitives; character data/state remains single-source-of-truth; existing character functionality continues to work.
  - **Out of scope:** redesigning the character data model or introducing a new global UI framework solely for this refactor.
- **Phase 3 - Character Creation & Level Up Overhaul (Part 1)**:
  - [ ] **Point Buy Calculator**: Implement standard 27-point buy rules for Character Creator attribute step.
  - [ ] **Advanced Spellbook Manager**: Fully overhaul `SpellsStep.tsx` and spell selection using `FocusView` and tiered visual folders (`spell1.webp` to `spell9.webp`).
- **Phase 3 - Character Creation & Level Up Overhaul (Part 2)**:
  - [ ] **ASI & Feat Selection**: Expand leveling to allow selecting feats (including attribute bonuses, prerequisites, and features) during level-up ASI.
  - [ ] **Automated HP Level Up**: Automate hit-die level-up HP rolls with Con modifiers and average HP options.
  - [ ] **Per-Attribute 3D Dice**: Roll 4d6 (drop lowest) with specific Dice Box animations per attribute.
  - [ ] **Equipment Pack Inspect**: Integrate `FocusView.tsx` as an interactive container inspector for equipment packages.
- AI DM tool-call integration (GOALS.md §12) — start with 2–3 tools only (e.g. dice roll,
  journal update), not the full tool list. Prove the narrator/mechanics boundary works before
  widening it.
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

These aren't bad ideas — they're exactly the kind of thing that makes this project fun. They're
parked because each one is a new subsystem, and the project currently has more open subsystems
than closed ones. Finishing the "Now" list is what makes starting these safe.

---
*Owned by whoever is coordinating the agents (Jules, or Jaap directly). Revisit this list when
the "Now" section is empty — not before.*
