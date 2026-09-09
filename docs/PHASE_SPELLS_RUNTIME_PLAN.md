# 2024 Spells — Runtime Integration Phase Plan

This document is the scope basis for the next spell phase. It intentionally does not belong on main until implemented through a Phase PR.

## Goal
Make the existing spell Atlas a canonical, rules-aware game domain usable across Character Creator, character/inventory presentation, exploration/non-combat gameplay, and tactical combat.

## Current confirmed state
- `public/assets/atlas/spell/` contains `index.json`, `json/`, `spell_list.txt`, `spell_wiki/`, and `sprites/`.
- `public/assets/atlas/spell/sprites/` already contains actual cantrip and level-1 `.webp` sheets plus `.md` layout specifications.
- `src/lib/spellVisuals/` already contains sprite identity and manifest code.
- `src/components/atlas/SpellSprite.tsx` already consumes the spell visual resolver.
- Existing spell JSON records still contain legacy `wiki_image` image/sprite references.
- `spell_wiki/` contains per-spell JSON with narrative `lore` and `imageUrl`; code search did not find a direct runtime consumer of the `spell_wiki/` path.
- `docs/modules/tactical_combat_blueprint.md` already requires deterministic/testable geometry and AOE support.

## Required scope
1. Audit and complete 2014/2024 spell data boundaries and ruleset-aware loading without introducing another ruleset store.
2. Audit `src/lib/spellVisuals/spriteManifest.ts` against the actual `public/assets/atlas/spell/sprites/` files. Correct stale IDs/paths and map canonical spell IDs to the existing cantrip and level-1 sheets.
3. Use the existing `.md` sheet layouts to verify exact sprite row/column mappings. Do not regenerate existing artwork.
4. Make the existing spell sprites usable by canonical spell identity across Character Creator, character/inventory presentation, and other spell surfaces.
5. Audit `public/assets/atlas/spell/spell_wiki/` before any deletion. Determine whether its lore is useful and, where appropriate, migrate useful content to canonical Markdown/lore documentation. Delete only after proving redundancy and updating references/tests.
6. Establish a data-driven canonical spell foundation for casting time, range (including Self/Touch), duration, concentration, ritual, target/effect kind, attack/save, scaling, spatial targeting, and ruleset-specific overrides where needed.
7. Treat spells as both combat and non-combat mechanics. Long casting times, minute/hour/day durations, concentration, persistent effects, exploration utility, travel, detection, communication, transformations, summons, environmental effects, and effects that outlive combat must be representable without requiring `CombatGrid`.
8. Establish deterministic AOE support for the 2024 shapes relevant to the ruleset: Cone, Cube, Cylinder, Emanation, Line, and Sphere. Targeting must account for range, origin, direction, creature footprints, and line of effect/cover.
9. Move AOE calculation out of React UI into pure unit-testable domain utilities; `CombatGrid.tsx` should consume those results rather than own a second spell geometry implementation.
10. Add semantic regression tests for sprite mapping, AOE geometry, ruleset separation, casting time, duration/concentration, and representative long-duration/non-combat spells.
11. Update roadmap/audit/architecture/task documentation only after verified implementation.

## Safety / architecture constraints
- `useGameStore.ruleset` remains canonical.
- Use `getActiveRulesetContext` where applicable.
- No competing ruleset store, hidden ruleset state, or parallel spell data model.
- Preserve physical `/14/` vs `/24/` boundaries.
- No fake, generic, or placeholder mechanics.
- Combat UI visualizes domain calculations; it does not define spell rules.
- Do not delete existing assets before dependency/reference analysis proves it is safe.

## Out of scope
- broad inventory redesign
- broad Character Creator redesign
- enemy AI
- per-spell bespoke animation production
- automatic merging
- unrelated Atlas refactors

## Verification
- focused spell/ruleset tests
- sprite/reference validation
- AOE geometry tests independent of React
- `npm run lint`
- `npm run validate:assets`
- `npm run build`
- manual Character Creator spell verification
- manual spell presentation/inventory verification
- manual representative AOE combat targeting verification
