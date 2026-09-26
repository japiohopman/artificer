# 🌍 World Context Window

## Overview

The **World Context Window** (`src/components/hud/WorldPanel.tsx`) is the party/player's persistent contextual surface. It answers three questions in order:

1. **Where/when are we?** — world context.
2. **Where is the party?** — authoritative party presence.
3. **What is relevant right now?** — active context and, when applicable, contextual interaction/resolution.

The World Context Window is a presentation/composition boundary, not a second domain engine. It consumes canonical state and delegates commands to the owning gameplay systems/stores.

## Architectural Structure

```text
WORLD CONTEXT WINDOW
│
├─ World Context
│  ├─ time
│  ├─ date
│  ├─ temperature
│  ├─ weather
│  ├─ spatial/presentation location
│  └─ region
│
├─ Party Presence
│  ├─ authoritative party location / token position
│  ├─ relevant sub-location
│  └─ travel state when applicable
│
└─ Active Context
   ├─ Location
   ├─ NPC
   ├─ Shop
   ├─ Monster / world entity
   ├─ Object
   ├─ Encounter / event
   └─ Contextual Interaction / Resolution
      ├─ interaction options
      ├─ DC/check context
      ├─ roll setup/result presentation
      └─ consequences
```

The root world context remains visible while the active context changes.

## Ownership Boundaries

- `useWorldStore` owns persistent world/environment state.
- `WorldEnvironmentSnapshot` provides canonical derived environmental facts consumed by presentation.
- `useGameStore` owns runtime combat state; the World Context Window may summarize the combat situation but must not duplicate tactical combat rules or actions.
- `ActionPanel` / `TokenActionHUD` own combat actions and targeting.
- `CombatGrid` owns tactical spatial presentation.
- Dice mechanics remain in the dice system. The World Context Window may present a contextual resolution surface (why a check occurs, DC, character, modifier, advantage/disadvantage, roll/result and consequence) but must not become a generic dice utility.
- `MapLegend` and other map-specific controls belong to map presentation, not the permanent World Context Window.
- Travel remains owned by the Travel system; travel controls may appear contextually when relevant.
- Atlas/static entity presentation should use canonical Atlas/data services. Runtime entities must resolve from their canonical runtime state. The UI must never invent production monsters, items, locations, NPCs, shops, inventories, lore or stats as substitutes for missing data.

## Active Context

The Active Context is intentionally extensible. It can represent a location, NPC, shop, monster, object, encounter, event or another canonical world/gameplay situation without changing the World Context root.

A non-combat monster is world context/entity information; it does not automatically become combat UI. A random encounter is an active situation before combat is necessarily entered. Combat is represented as a situation/context here while tactical actions and spatial combat remain in their existing owners.

## Data Integrity Rule

Production UI must not fabricate, hardcode, synthesize or silently substitute canonical gameplay entities. If required canonical data is unavailable, show an explicit missing-data state or stop at the appropriate boundary. Synthetic entities are permitted only in isolated test fixtures and must never leak into production data paths.

## Out of Scope for the Context Window

The World Context Window must not become the owner of:

- tactical combat rules or action resolution;
- generic dice mechanics;
- map legend/layer controls;
- a second world/context/combat/entity store;
- Atlas data registries;
- full implementations of shops, NPC interaction, encounters or skill checks merely because the surface can display them.

## Current Implementation Direction

The current environment header is integrated into the existing World Panel header/banner. It presents time, temperature, weather, date and presentation location using the canonical environment snapshot.

The previous persistent footer-style dice utility and map-specific responsibilities are not part of the target architecture. Future work should decompose the existing location-heavy panel toward the three-layer Context Window model above rather than adding more unrelated widgets to `WorldPanel.tsx`.

## Visual Language

The surface follows the existing Artificer parchment/Dragonstone visual language and centralized `GameIcon` system. Presentation should remain compact and contextual rather than accumulating permanent utility controls.
