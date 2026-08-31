# Artificer Task Board

This is the **detailed execution checklist** behind the canonical root `ROADMAP.md`.

## Source of truth

- `ROADMAP.md` — **only canonical roadmap**: current priority, Jules queue state and phase status.
- `docs/TASK_BOARD.md` — implementation checklist and acceptance tracking.
- `docs/ARCHITECTURE_STATUS.md` — architecture decisions and boundaries.
- `docs/modules/` and `docs/systems/` — detailed module/system specifications.
- `.github/workflows/` — automation only. It must never contain a second roadmap copy.

The Jules orchestrator reads only the root `ROADMAP.md`. Do not add, maintain, or dispatch work from another roadmap file.

## 🔴 Critical — Current engineering

### Character Creator — Species Character Panel / Choice State / Equipment & Spell Presentation v1
**Branch:** `feat/character-creator-species-mirror-6934090321828657621`

#### Choice flow
- [ ] Welcome/Ruleset starts neutral until the player explicitly selects a choice.
- [ ] Identity starts neutral until the player explicitly selects a choice.
- [ ] Hover and selected states are clearly distinct.
- [ ] Continue is disabled while required choice is missing and subtly pulses when progression is valid.
- [ ] Character Panel begins at Species; Welcome/Slot/Identity use the full stage with no reserved aside.
- [ ] Required creator steps cannot be bypassed; Flaws/Bonds/Backstory and other required narrative inputs participate in validation.

#### Character Panel
- [ ] Selected species drives body SVG, environment/background and species name dynamically.
- [ ] HP, AC, Speed and Initiative use canonical data/calculations and canonical assets.
- [ ] Six horizontal ability-score tabs use `public/assets/ui/ability-score-tab-hc.svg` and canonical `GameIcon` assets.
- [ ] Only confirmed selections are shown; unresolved values remain neutral/`—`.
- [ ] Shared presentation primitives live under `src/components/character/panel/`.
- [ ] Shared panel primitives do not import `CharacterCreator/*` internals.
- [ ] Existing runtime `CharacterPanel.tsx` adopts the same shared presentation after the creator foundation is stable.
- [ ] No third Character Mirror / Character Panel implementation is introduced.

#### Traits
- [ ] Traits is the canonical trait tab after Class selection.
- [ ] Skills are rendered inside Traits, not as a competing top-level tab.
- [ ] Saving Throws use `trait-saves.svg`.
- [ ] Weapon Proficiencies use `trait-weapon-proficiencies.svg`.
- [ ] Armor Proficiencies use `trait-armor-proficiencies.svg`.
- [ ] Skills use `trait-skills.svg`.
- [ ] Languages use `trait-languages.svg`.
- [ ] Condition Immunities use `trait-condition-immunities.svg` only when present.
- [ ] Damage Immunities use `trait-damage-immunities.svg` only when present.
- [ ] Damage Resistances use `trait-damage-resistances.svg` only when present.
- [ ] Damage Vulnerabilities use `trait-damage-vulnerabilities.svg` only when present.
- [ ] General Traits navigation uses `trait.svg`.
- [ ] Journal navigation uses `ui/pen_line.svg`.
- [ ] World Panel uses `ui/panel.svg` and is positioned before Chat in the navigation.
- [ ] Chat uses `ui/chat_interface.svg`.

#### Equipment
- [ ] `EquipmentDoll.tsx` remains under `src/components/character/equipment/`.
- [ ] Equipment is an integrated Character Panel view/tab, not a separate panel.
- [ ] Equipment Doll overlays/frames the same body SVG used by the Character Panel.
- [ ] Character Panel background/environment remains visible across the entire right panel.
- [ ] Existing DnD Kit, equip/unequip, slot, hover and context-menu behavior remains intact.
- [ ] Equipment changes flow through canonical inventory/character state and update derived AC correctly.
- [ ] No duplicate equipment data model is introduced.

#### Spells / Cantrips
- [ ] Keep the existing `SpellSprite` + `SPELL_SPRITE_MANIFEST` architecture.
- [ ] Register every completed cantrip sprite sheet actually present under `public/assets/atlas/spell/sprites/`.
- [ ] Register Level 1 sheets 01–04 where they exist.
- [ ] Add known spell-to-cell mappings to the existing manifest only when the mapping is verified.
- [ ] Never guess sprite row/column positions.
- [ ] `SpellsStep.tsx` renders canonical sprites through `SpellSprite` rather than creating another renderer.
- [ ] Preserve class gating and spell selection rules.

#### Data boundaries
- [ ] Static rules/species/class/background data comes from canonical Atlas sources.
- [ ] Current character selections/state come from `useCharacterStore` and existing domain stores.
- [ ] Derived values use canonical domain calculations.
- [ ] React presentation does not duplicate game-rule maps or calculations.

#### Documentation / validation
- [ ] Update relevant character, equipment and spell module docs as implementation changes land.
- [ ] Keep `ROADMAP.md` and this board synchronized after material architecture changes.
- [ ] Keep `docs/COMPONENT_MAP.md` synchronized with final component ownership.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run relevant character/equipment/spell regression tests.
- [ ] Human runtime verification before marking the roadmap task `[x]`.

## 🟠 High — Architecture & data foundations

### Ruleset Selection & Ruleset Context — Remaining Downstream Audit
- [ ] Audit remaining rules-sensitive species, subraces, backgrounds, conditions and features.
- [ ] Resolve versioned content through the canonical ruleset context.
- [ ] No component hardcodes `/14/` or `/24/` paths.
- [ ] Validate both rulesets where 2024 content exists.

### Inventory & Equipment Architecture / UX Follow-up
- [ ] Continue after Character Creator Equipment overlay is stable.
- [ ] Keep inventory domain components under `character/inventory/`.
- [ ] Keep equipment presentation under `character/equipment/`.
- [ ] Keep `FullInventoryMenu` as the full inventory workspace.
- [ ] Preserve Inventory V2/save compatibility and avoid duplicate inventory models.

### Canonical Character Profile & CharacterScreen Refactor
- [ ] Establish reusable character-profile presentation primitives.
- [ ] Provide compact/selection and full-profile variants without a second character schema.
- [ ] Refactor TitleScreen and CharacterProfile around the canonical profile.
- [ ] Refactor CharacterScreen after the shared profile foundation is stable.
- [ ] Keep Traits/Ideals/Bonds/Flaws as first-class narrative character data.

### DevKit shared infrastructure
- [ ] Establish reusable DevKit interaction primitives only where justified.
- [ ] Reuse the canonical `public/assets/icons/svg/` registry and `GameIcon`.
- [ ] Keep shared infrastructure separate from domain state and editor histories.

## 🟡 Medium — Character & gameplay systems

### Character Creation / Level Up
- [ ] Starting Equipment Eligibility Resolver.
- [ ] Point Buy Calculator — standard 27-point buy.
- [ ] Advanced Spellbook Manager and richer filtering.
- [ ] Feat selection during ASI/Level Up.
- [ ] Automatic HP level-up flow.
- [ ] Per-attribute 3D ability-score rolls.
- [ ] Equipment Pack inspection in `FocusView`.

### Runtime / DM / World systems
- [ ] NPC Memory / relationship history.
- [ ] Economic & Trade module.
- [ ] Soundscape Orchestrator.
- [ ] Rule Engine / Condition Tracker.
- [ ] Journal/DM/LM structured character-context integration.
- [ ] World/Location HUD responsibility cleanup.
- [ ] WorldMap and LocationMap decomposition.

## 🟢 Maintenance / optimization

- [ ] Continue Atlas asset/index validation as schemas evolve.
- [ ] Review asset loading performance after major UI changes.
- [ ] Keep module documentation synchronized with architecture.
- [ ] Add regression tests when runtime systems are refactored.
- [ ] Keep heavyweight/development-only artifacts out of runtime assets.

## Task-board rules

1. `[ ]` means actionable and not finished.
2. `[x]` means implemented **and verified**; scaffolding alone is never `[x]`.
3. `ROADMAP.md` controls current priority; this board contains the concrete work behind it.
4. Never create duplicate implementations when an existing component/service/store owns the capability.
5. Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` or the relevant module/system document.
6. Runtime HUD presentation stays separate from reusable domain capabilities.
7. Authoring tools stay separate from runtime representations.
8. A phase remains active until human review and runtime verification confirm it.

---

*Last Updated: 2026-08-31*
