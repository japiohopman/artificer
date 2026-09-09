# 2024 Spells — Runtime Integration Phase Plan

This document defines the scope for the next substantial spell phase. It is intentionally separate from the 2024 Feats completion phase.

## Goal

Make the existing spell Atlas usable as a canonical, rules-aware game domain rather than treating spells as static text records.

## Current confirmed state

- `public/assets/atlas/spell/` contains `index.json`, `json/`, `spell_list.txt`, `spell_wiki/`, and `sprites/`.
- `public/assets/atlas/spell/sprites/` already contains actual cantrip and level-1 `.webp` sheets plus `.md` layout specifications.
- `src/lib/spellVisuals/` already contains sprite identity and manifest code.
- `src/components/atlas/SpellSprite.tsx` already consumes the spell visual resolver.
- Existing spell JSON records still contain legacy `wiki_image` image/sprite references.
- `spell_wiki/` contains per-spell JSON with narrative `lore` and `imageUrl`; code search did not find a direct runtime consumer of the `spell_wiki/` path.
- `docs/modules/tactical_combat_blueprint.md` already requires deterministic, testable geometry and AOE support.

## Required work

1. Audit and complete 2014/2024 spell data boundaries and ruleset-aware loading without creating another ruleset store.
2. Audit the complete existing spell visual pipeline and replace stale sheet IDs/paths with the actual files in `public/assets/atlas/spell/sprites/`.
3. Make existing cantrip and level-1 sprite sheets usable through canonical spell IDs in Character Creator, inventory/character presentation, and other spell surfaces. Do not regenerate artwork that already exists.
4. Use the `.md` sprite layout sheets to verify exact row/column mappings.
5. Audit `spell_wiki/`. Migrate useful narrative lore to the project's canonical Markdown/lore location if appropriate. Delete `spell_wiki/` only after proving it is redundant and all useful content/references have been migrated.
6. Establish canonical, data-driven spell metadata for casting time, range, duration, concentration, ritual, target/effect kind, attack/save, scaling, and spatial effects.
7. Treat spells as both combat and non-combat game mechanics. Long casting times, minute/hour/day durations, concentration, persistent effects, exploration utility, travel, detection, communication, transformations, summons, environmental effects, and effects that outlive combat must be representable without requiring `CombatGrid`.
8. Establish a reusable AOE contract for the 2024 shapes: Cone, Cube, Cylinder, Emanation, Line, and Sphere. Targeting must account for range, origin, direction, creature footprints, and line of effect/cover. Geometry belongs in pure testable utilities, not duplicated inside React components.
9. Refactor `CombatGrid.tsx` only as needed to consume shared spell targeting/geometry utilities; do not grow it into a spell-rules God Component.
10. Add semantic tests for sprites, AOE, ruleset separation, casting time, duration/concentration, and at least one long-duration/non-combat spell.
11. Update the relevant roadmap/audit/architecture/task documentation only after verified implementation.

## Safety / architecture constraints

- `useGameStore.ruleset` remains canonical.
- Use `getActiveRulesetContext` where applicable.
- No competing ruleset store or hidden ruleset state.
- Preserve `/14/` vs `/24/` boundaries.
- Do not replace real mechanics with placeholders.
- Do not keep two competing spell data models.
- Combat UI visualizes domain calculations; it does not own spell rules.
- Do not delete existing assets until dependency/reference analysis proves they are safe to remove.

## Out of scope

- broad inventory redesign
- broad Character Creator redesign
- enemy AI
- per-spell bespoke animation production
- automatic merging
- unrelated Atlas refactors

## Verification

- focused spell/ruleset tests
- sprite manifest/reference validation
- AOE geometry tests independent of React
- `npm run lint`
- `npm run validate:assets`
- `npm run build`
- manual Character Creator spell verification
- manual spell presentation/inventory verification
- manual combat targeting verification for representative AOE spells

## Canonical references

- `ROADMAP.md`
- `docs/TASK_BOARD.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/audits/ruleset-2024-gap-analysis.md`
- `docs/modules/tactical_combat_blueprint.md`
- `docs/systems/TACTICAL_COMBAT_ENGINE.md`
- `src/lib/spellVisuals/`
- `src/components/atlas/SpellSprite.tsx`
- `public/assets/atlas/spell/json/`
- `public/assets/atlas/spell/sprites/`
- `public/assets/atlas/spell/spell_wiki/`
