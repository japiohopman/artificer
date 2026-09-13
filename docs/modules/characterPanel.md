# Character Panel Architecture

> Authoritative design specification for the reusable player-character presentation surface.
>
> Status: **Phase planned / not yet verified**  
> Last updated: 2026-09-13

## Purpose

The Character Panel is a reusable player-facing presentation surface for one active character. It must serve the Character Creator, the main game HUD, and full character/profile views without creating separate implementations of the same character UI.

The panel is a presentation layer. Character state remains owned by the canonical character/game stores and rules/data services.

## Design direction

The visual model is a persistent **Character Mirror**:

- The character background/environment covers the full body surface of the panel.
- The selected body SVG remains visible underneath the tab content.
- The primary `Stats` view is the default/open surface and is therefore the most important visual treatment.
- `Traits`, `Bio`, `Equipment`, `Spells` and other sections open as overlays over the persistent body/background rather than replacing the mirror surface.
- The same component system must work in the Creator and the runtime HUD.
- The panel should not become a giant God Component; each domain section owns its presentation while the canonical panel owns composition/navigation.

## Canonical location

```text
src/components/character/panel/
```

This directory is the canonical reusable Character Panel presentation layer.

Expected direction:

```text
CharacterPanel
├── CharacterPanelStats
├── CharacterPanelSkills
├── CharacterPanelTraits
├── CharacterPanelSpells
├── CharacterPanelEquipment
├── CharacterPanelBio
└── other focused sections as justified
```

`src/components/character/CharacterPanel.tsx` may remain as a stable public facade/re-export for existing imports, but it must not contain a competing implementation.

`src/components/hud/CharacterPanel.tsx` is a runtime HUD host/container. It must not own a second implementation of the reusable panel.

## Stats surface

`CharacterPanelAbilities.tsx` and `CharacterPanelBody.tsx` currently represent one player-facing stats/mirror surface and should be consolidated into:

```text
src/components/character/panel/CharacterPanelStats.tsx
```

`CharacterPanelStats` owns the composition of the default/open character surface, including where appropriate:

- character name/identity context
- species/race
- class
- background
- alignment
- body SVG
- environment/background artwork
- HP and primary combat resources
- AC
- speed
- initiative
- proficiency
- STR / DEX / CON / INT / WIS / CHA
- ability modifiers
- existing derived-stat presentation

It must consume canonical calculated values. It must not reimplement character/rules calculations.

The visual hierarchy is more important than preserving the current collection of cards. This surface is in the player's face continuously and must feel like one intentional game interface rather than a development/debug panel.

## Header and resource hierarchy

The top/header area should establish character identity and immediately useful resources rather than repeating the large identity labels inside the body area.

The intended direction is:

```text
NAME
Class · Species/Race · Level / other compact identity context

Resource strip / key combat state

--------------------------------
Persistent body + background mirror
```

For the spell-capable character view, spell slots belong in the compact resource/header area where appropriate. Spell slots are a resource, not a substitute for the character identity header.

The exact final visual layout is a design implementation task, not a license to duplicate identity information in multiple locations.

## Persistent body/background and overlays

The body SVG and background are persistent panel layers.

```text
Panel shell
└── Background/environment (full panel)
    └── Body SVG / character mirror
        └── Base stats surface
        └── Active tab overlay
```

Opening another tab must preserve the background/body as the visual context while the selected content appears as an overlay. The existing creator behavior partially demonstrates this and should become the shared behavior used by runtime HUD as well.

The background must cover the entire panel surface rather than being confined to a small body card.

## Size and responsive contract

The reusable `panel/` implementation should be sized and styled so it can fit the same visual contract as the runtime HUD Character Panel. The Creator must not grow a fundamentally different panel merely because it has more surrounding space.

Responsive behavior may change density and layout, but not the component ownership model.

The mobile treatment must be treated as a first-class layout, not a desktop panel squeezed into a narrow column.

## HP / health presentation

Health is a primary character resource and should have a strong visual treatment.

The large heart/HP icon should be visually prominent and use the project health accent:

```text
#ec597a
```

Do not introduce arbitrary new health colors elsewhere in the panel.

## Spell UX

The spell experience distinguishes three concepts:

1. **Spell slots** — expendable character resources.
2. **Spellbook / known / prepared spells** — the character's available spell set.
3. **Spell Sheet** — detailed inspection of one spell.

The current `src/components/atlas/SpellCard.tsx` name is misleading for the large inspection surface. The intended conceptual boundary is:

```text
SpellGridTile → SpellSheet
```

A compatibility export may temporarily preserve `SpellCard` imports during migration, but new architecture should use `SpellSheet` for the detailed inspection surface.

The Spell Sheet must display canonical spell detail fields including description, components, casting time, range, duration and higher-level text where supplied by the canonical data.

If a detail field is missing in the creator while it is available in the inspector, trace and fix the data contract. Do not hide the problem with renderer-only fallback text.

Ruleset isolation remains mandatory: 2014 and 2024 spell data must resolve through the canonical ruleset boundary.

## Ownership boundaries

### Character state

Owned by existing canonical stores/services, including `useCharacterStore` and ruleset/data services.

### Character Panel

Owns reusable presentation composition, tab/section presentation and local UI interaction state that does not belong in global runtime state.

### Creator

Owns creator workflow state, current step and draft/edit context. It hosts the canonical panel.

### HUD

Owns runtime placement, open/close behavior and HUD-specific context. It hosts the canonical panel.

### Character Profile / full screen

Owns screen-level navigation and shell concerns. It consumes canonical panel/profile primitives instead of rebuilding stats/spells/equipment presentation.

## Anti-patterns

Do not:

- create a second Character Panel implementation under `hud/`
- keep `CharacterPanelAbilities` and `CharacterPanelBody` as competing versions of the same default surface after consolidation
- maintain `CharacterStats.tsx` as a parallel stats presentation if its responsibilities are covered by `CharacterPanelStats`
- rebuild the same panel inside `CreatorRightPanel`
- rebuild the same panel inside `CharacterProfile`
- create a new character store for panel state
- duplicate spell data or spell-slot calculations in UI components
- use `SpellCard` as a conceptual name for the large spell inspection sheet
- replace missing canonical spell descriptions with generic/fake copy

## Migration order

1. Audit all current Character Panel consumers and responsibilities.
2. Establish canonical `character/panel/` composition.
3. Consolidate Body + Abilities into `CharacterPanelStats`.
4. Audit/remove duplicate `CharacterStats` presentation after consumers migrate.
5. Make CreatorRightPanel a host of the canonical panel.
6. Make HUD CharacterPanel a host of the canonical panel.
7. Reduce CharacterProfile to screen/shell responsibilities where appropriate.
8. Establish SpellGridTile vs SpellSheet naming and ownership.
9. Trace and repair the spell detail data contract.
10. Add/reuse CharacterPanelSpells with real spell-slot resource presentation.
11. Verify Creator and HUD use the same reusable panel.
12. Remove dead duplicate components and update architecture docs.

## Acceptance criteria

The phase is complete only when:

- Creator and runtime HUD render the same canonical Character Panel system.
- Stats/body/abilities are represented by `CharacterPanelStats` rather than parallel implementations.
- Background covers the complete panel surface and body remains a persistent visual layer.
- Other tabs overlay the persistent mirror instead of replacing it.
- The panel fits the intended HUD-sized contract and has deliberate mobile behavior.
- HP presentation is visually prominent and uses `#ec597a` for the health accent.
- Header identity and resource hierarchy are coherent and non-duplicative.
- Spell slots are displayed as meaningful resource state.
- Spell detail is represented by a Spell Sheet and receives complete canonical spell data.
- Spell descriptions render in the Character Creator and HUD wherever canonical data provides them.
- No duplicate character state store or duplicate rules calculations are introduced.
- `npm run lint`, `npm run build` and `npm run validate:assets` pass.
- Relevant runtime/creator regression tests pass.
- Documentation and component map describe the implementation that actually exists.

Until these criteria are verified, the roadmap item must not be marked complete.
