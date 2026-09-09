# 2024 Spells — Runtime Integration Phase Plan

This document defines the scope for the next substantial spell phase. It is intentionally separate from the 2024 Feats completion phase.

## Goal

Make the existing spell Atlas usable as a canonical, rules-aware game domain rather than treating spells as static text records.

The phase must preserve the existing 2014/2024 ruleset architecture and establish the foundations required for spell use across Character Creator, inventory/character presentation, exploration/non-combat gameplay, and tactical combat.

## Current confirmed state

- `public/assets/atlas/spell/` contains `index.json`, `json/`, `spell_list.txt`, `spell_wiki/`, and `sprites/`.
- `public/assets/atlas/spell/sprites/` already contains cantrip sheets and multiple level-1 sheets, with `.md` layout specifications and actual `.webp` sheets.
- `src/lib/spellVisuals/` already contains a sprite manifest and visual identity resolution.
- `src/components/atlas/SpellSprite.tsx` already consumes the spell visual resolver.
- Existing spell JSON records still contain legacy `wiki_image` image/sprite paths.
- `spell_wiki` contains per-spell JSON records with narrative `lore` and `imageUrl`; current code search did not find a direct runtime consumer of the `spell_wiki/` path.
- `docs/modules/tactical_combat_blueprint.md` already defines deterministic geometry as a combat requirement and identifies AOE primitives.

## Required architectural direction

1. One canonical spell domain model must serve all consumers.
2. Visual identity must resolve from canonical spell identity through `src/lib/spellVisuals/`.
3. Sprite sheets are reusable presentation assets, not combat-specific assets.
4. Spell mechanics must be data-driven and reusable outside combat.
5. Combat consumes spell targeting/effect metadata through adapters; combat UI must not encode spell rules itself.
6. AOE geometry must live in deterministic, unit-testable domain utilities.
7. Time-based and concentration-based spell effects must be representable even when no combat grid is present.
8. Ruleset remains canonical through `useGameStore.ruleset` and `getActiveRulesetContext` where applicable.

## Spell metadata required for the foundation

Audit and, where justified by the existing schema, establish canonical representations for:

- casting time
- range (including Self and Touch)
- duration
- concentration
- ritual
- target/effect kind
- saving throw / attack type
- damage and healing scaling
- area of effect
- AOE shape
- AOE dimensions
- origin rules
- line-of-effect requirements
- movable/static effect behavior
- non-combat effect classification
- ruleset-specific overrides where 2014 and 2024 differ
- visual identity / sprite sheet mapping

Do not invent mechanics simply to populate fields. A field may remain explicitly unsupported or unresolved until canonical data is available.

## AOE foundation

The runtime must be capable of expressing at minimum the 2024 AOE shapes relevant to the ruleset: Cone, Cube, Cylinder, Emanation, Line, and Sphere.

The phase does not require every spell to receive a bespoke combat animation. It does require the data model and geometry contract to make the spell's spatial behavior deterministic and extensible.

Combat targeting must respect range, origin, direction where applicable, creature footprints, and line-of-effect/cover rules through shared utilities.

## Non-combat and time-based spells

Spells cannot be modeled as combat attacks only.

The phase must explicitly account for spells whose important behavior is:

- long casting time
- minutes/hours/day durations
- concentration
- persistent effects
- exploration utility
- environmental/world interaction
- movement/travel
- detection/information
- communication
- transformations
- summons or created entities
- effects that continue after leaving combat

The model should support an effect lifecycle that can exist independently from `CombatGrid`.

## Sprite asset migration

Audit the declared sheets in `src/lib/spellVisuals/spriteManifest.ts` against the actual files in `public/assets/atlas/spell/sprites/`.

Remove or correct stale sheet IDs/paths such as declarations that point at files which no longer exist.

Map canonical spell IDs to the existing cantrip and level-1 sheets without duplicating image assets.

Where the existing `.md` sheet specifications contain authoritative layout information, use them to verify the row/column mapping.

Do not generate replacement artwork when the correct asset already exists.

## `spell_wiki` audit

Audit every consumer/reference of `public/assets/atlas/spell/spell_wiki/` before deleting anything.

The current records appear to contain narrative `lore` plus `imageUrl`, while canonical spell JSON already contains mechanics and legacy wiki-image references.

Determine whether the useful `lore` should become canonical Markdown documentation or a dedicated lore layer.

Possible migration target:

- human-readable `.md` spell lore documents under the project's documentation/official-content structure, or
- another clearly justified canonical lore location if the existing architecture already has one.

Do not keep two competing copies of the same spell lore without a reason.

Do not delete `spell_wiki/` until all useful information has been migrated or proven redundant and all references/tests are updated.

## Verification

- validate all spell assets and sprite references
- test canonical spell visual identity resolution
- test representative cantrip and level-1 sprite mappings
- test AOE geometry independently of React UI
- test 2014/2024 ruleset separation
- test duration/concentration/casting-time metadata parsing
- test at least one long-duration/non-combat spell representation
- run lint, asset validation, and build
- manually verify Character Creator spell selection and at least one spell presentation surface
- manually verify combat targeting for representative AOE spells without creating a second geometry implementation in `CombatGrid.tsx`

## Out of scope

- inventory redesign
- broad Character Creator redesign
- enemy AI
- sound/animation production for every spell
- automatic merging
- new ruleset state/store
- unrelated Atlas refactors
