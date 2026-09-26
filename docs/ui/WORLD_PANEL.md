# 🌍 World Context Window

## Overview

The **World Context Window** (`src/components/hud/WorldPanel.tsx`) is the party/player's persistent contextual surface. It answers four core questions in order:

1. **Where/when are we in the world?** — World Context.
2. **Where is the party physically?** — Party Presence.
3. **What is relevant right now?** — Active Context.
4. **What interactions or resolutions are available?** — Interaction / Resolution Context.

The World Context Window is a presentation and composition surface, not a second domain engine. It consumes canonical state (`useWorldStore`, `useGameStore`, `useJournalStore`) and delegates execution to owning gameplay systems and services.

## Architectural Structure

```text
WORLD CONTEXT WINDOW
│
├─ 1. World Context (WorldEnvironmentHeader)
│  ├─ time
│  ├─ date
│  ├─ temperature
│  ├─ weather
│  ├─ region
│  └─ spatial/presentation location (displayLocation)
│
├─ 2. Party Presence
│  ├─ authoritative party physical location (partyLocation)
│  ├─ sector / sub-location context (partySubLocation)
│  └─ travel transit state & progress bar
│
├─ 3. Active Context
│  ├─ Active Combat Threats (combatState.monsters summary)
│  ├─ Local Topography & Submap Filters
│  ├─ Active Landmark / Domain Info & Lore
│  └─ Extension Points (NPC, Shop, Item/Object, Non-combat Monster, Encounter/Event)
│
└─ 4. Interaction / Resolution Context
   ├─ Travel & Navigation Actions
   ├─ Submap Exit / Return Controls
   ├─ Lore Codex Entry Unlocks
   └─ DC / Skill Check Resolution Boundaries (DC, check purpose, modifiers, roll/consequence presentation)
```

The root World Context and Party Presence remain visible while the Active Context changes dynamically based on player focus or game state.

## 4 Root Structures & Ownership Boundaries

### 1. World Context
- **Canonical Owner:** `useWorldStore` and `resolveWorldEnvironmentSnapshot()`.
- **Component:** `WorldEnvironmentHeader`.
- **Responsibilities:** Displays calendar date, time of day, temperature, weather condition, and the active presentation location (`displayLocation`).

### 2. Party Presence
- **Canonical Owner:** `useWorldStore.partyLocation`, `useWorldStore.partySubLocation`, `useWorldStore.isTraveling`, `useWorldStore.travelProgress`.
- **Responsibilities:** Renders the authoritative physical party location, active sub-location/sector, and transit progress bar during overland movement. `partyLocation` remains the physical anchor even when `inspectedLocation` is actively focused.

### 3. Active Context
- **Canonical Owners:** `useWorldStore` (location/submap context), `useGameStore` (combat threats), Atlas services.
- **Responsibilities:** Summarizes the currently relevant focal entity or situation.
  - **Combat Context:** Summarizes active threat tokens (`combatState.monsters`) with HP bars, AC, speed, and CR without duplicating tactical combat actions or grid targeting.
  - **Topography Summary:** Summarizes local spatial context. Map layer toggles (e.g., surface vs. sewer) and category legend filters are owned directly by map presentation (`LocationMap.tsx`).
  - **Domain Context:** Renders canonical Atlas location lore and structured metadata schema fields (history, government, ruler, economy, religion, districts, etc.).
  - **Extension Points:** Prepared extension hooks for NPC, shop, object, non-combat monster, and encounter contexts.

### 4. Interaction / Resolution Context
- **Canonical Owners:** Travel system, `useJournalStore`, Dice system (for resolution checks).
- **Responsibilities:** Exposes contextual interaction buttons (Set Travel Target, Exit Location, Open Lore Codex). When a skill check or DC challenge occurs, presents the check context (purpose, DC, advantage/disadvantage, modifiers, and consequence) while delegating dice mechanics to the dice roller.

## Data Integrity Rule — ZERO INVENTED ENTITIES

Production UI must **never** fabricate, hardcode, placeholder-generate, or synthesize production monsters, items, locations, NPCs, shops, inventories, lore, stats, or attributes.

When World Context presents an entity:
1. Resolve it strictly through existing canonical Atlas/data/storage services (`storageService.ts`, `atlasService.ts`).
2. Reuse canonical IDs and fields.
3. If canonical data is missing, render an explicit missing-data state (`Unknown location - missing canonical Atlas record.`).
4. Synthetic entities are allowed only as isolated test fixtures and must never leak into production runtime behavior.

## Integration Boundaries

### Tactical Combat Boundary
- The World Context Window summarizes active threats (`combatState.monsters`).
- Tactical actions, movement, spell targeting, and action economy remain strictly owned by `ActionPanel`, `TokenActionHUD`, and `CombatGrid`.

### #311 Shared Atlas Sheet Integration Boundary
- Detailed entity inspect views (full monster stat sheets, item detail cards, class sheets) open via #311 shared Atlas Sheet / inspection modals (`setFocusedItem()`, `setIsMonsterProfileOpen()`).
- The World Context Window provides entry points for inspecting entities but does not embed or couple the internal Atlas Sheet UI into its own tree.

### Map & Dice Utilities Boundary
- Permanent Map Legend (`MapLegend`) and generic dice roller panel (`AdvancedRoller`) are removed from permanent World Panel ownership.
- `MapLegend` is owned by map presentation overlays (`WorldMap.tsx` / `ChatInput.tsx`).
- `AdvancedRoller` is owned by the global dice surface and contextual resolution triggers.

## Visual Language

The surface follows the existing Artificer parchment/Dragonstone visual language (`bg-parchment-50`, `bg-paper-texture`, `border-dragon-gold/20`, `text-dragon-red`) and centralized `GameIcon` system. Width contract is fixed at `w-80` (320px shrink-0).
