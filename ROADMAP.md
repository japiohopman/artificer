# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md)
is the granular checklist. This document sits between them: it says **what we're actually
finishing right now**, so agents (and Jaap) aren't tempted to start a new GOALS.md system while
older ones are half-done. Update this file when priorities genuinely shift — not every sprint.

## Now — close these before touching anything new
- [X] Meteocons icon library for Time and Weather
- [ ] Dev Kit reorganization (Inspectors, Generators, Testers grouping)
- [ ] Align Jane module with JSON schemas and existing atlas lore
- [ ] Complete TSX translation of the Tactical Combat Grid (Aedif inspiration)
- [ ] Minimal smoke-test / build check — something that catches a broken build automatically,
      so a single agent's change can't silently break the app for everyone else. This is the
      single highest-leverage item on this list.

**Already done, just needs the checkbox updated on TASK_BOARD.md:**
- Temperature system in `useWorldStore.ts` — implemented, visible in `src/components/hud/TemporalWidget.tsx`
- Token.tsx crash — fixed
- `errors.md` — being kept current manually going forward; if the smoke-test above lands, this
  becomes semi-automatic

## Conditional cleanup — do this once the condition is met, not before
- Remove the forked `dnd5e-6.0.x` folder and the duplicated `tactical-grid-main/tactical-grid-main`
  once the agents referencing them (Jimmy/Jane) confirm they no longer need them as inspiration.
  Until then they're allowed to stay, but they should not be extended or built on top of —
  reference only.
- Once that's out: move the remaining heavy binaries (93MB Sword Coast map, the music files,
  the SRD PDF) out of plain git — Git LFS or external asset hosting, per `docs/ASSET_REGISTRY.md`.

## Next — natural continuation, kept small on purpose
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
