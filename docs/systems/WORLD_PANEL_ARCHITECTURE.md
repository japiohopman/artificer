# 🌍 World Context Window Architecture

The World Context Window (`src/components/hud/WorldPanel.tsx`) is the party/player context surface. It is a composition boundary over canonical runtime state, not a domain owner.

## Composition Model

```text
World Context
  ↓
Party Presence
  ↓
Active Context
  ↓
Contextual Interaction / Resolution
```

### 1. World Context
Persistent root context:
- time/date;
- temperature/weather;
- spatial/presentation location;
- region.

Environmental facts come from `WorldEnvironmentSnapshot`; physical environment remains based on `partyLocation`, while `currentLocation` / `inspectedLocation` are presentation/inspection context.

### 2. Party Presence
Shows where the party currently is and relevant sub-location/travel state. It does not become a second location/world-state owner.

### 3. Active Context
The relevant entity or situation currently requiring attention. Supported architectural categories include Location, NPC, Shop, Monster, Object, Encounter and Event. The model is intentionally extensible.

Active Context may expose contextual interaction or resolution UI, including a DC check presentation, without owning the underlying gameplay mechanics.

## Gameplay Boundaries

- **Combat:** World Context summarizes the situation. `ActionPanel` / `TokenActionHUD` own tactical actions and targeting; `CombatGrid` owns tactical spatial presentation; `useGameStore` owns combat state/rules.
- **DC checks:** Contextual presentation belongs here; dice mechanics remain in the dice system. Do not turn the Context Window into `AdvancedRoller`.
- **Random encounters:** An encounter can be represented as Active Context before combat. Encounter generation/resolution remains owned by its gameplay system.
- **Non-combat monsters:** A monster can be an Active Context without automatically opening combat UI.
- **Travel:** Travel state/controls are shown only when contextually relevant; `Travel.tsx` remains the travel-system owner.
- **Map:** Map rendering and map-specific controls remain outside the Context Window's permanent ownership. `MapLegend` is not a Context Window responsibility.

## Data Ownership and Integrity

- Reuse canonical stores/services/Atlas registries.
- Never create a second world/context/combat/entity store for presentation convenience.
- Never duplicate combat action or resolution logic in JSX.
- Never fabricate production monsters, items, locations, NPCs, shops, inventories, lore or stats when canonical data should be used.
- If canonical data is missing, represent the missing-data condition explicitly rather than inventing a substitute.
- Synthetic data is allowed only in isolated tests/fixtures.
- Contextual commands must delegate to the canonical owning system/store.

## Atlas Sheet Boundary

The shared Atlas Sheet system (#311) is a detail/presentation layer that may be invoked from Active Context. It does not define the World Context Window root or its state ownership.

## Extension Rule

Future context types should be added by extending Active Context adapters/presenters rather than adding unrelated permanent widgets or creating new global stores. The exact interaction mechanics for NPCs, shops, objects and checks remain separate issues until specified.

## Visual Language

Use the established parchment/Dragonstone language and centralized icon system. Keep the root context stable and the active context replaceable.
