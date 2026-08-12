# Journal Module

## Status

**Implemented / evolving**

The Journal is a player-facing campaign record containing diary/history, quests, discoveries, bestiary information and lore. The long-term design also makes it a durable source of campaign memory for the AI Dungeon Master.

> **Important:** the Game Day Summary and AI context-recovery design below are **planned architecture**, not claims that the current implementation already performs these operations.

## Responsibility

The Journal owns durable, campaign-facing narrative records that should survive beyond a single chat context.

It should answer two different needs:

1. **Player memory** — what happened in the campaign and what the player has discovered.
2. **DM memory** — compact, reliable information that can be retrieved when live chat context is unavailable, truncated or reset.

The Journal should not become a second source of truth for mechanical game state. Character stats, inventory, world state, quests and other domain data remain owned by their canonical systems. Journal entries can reference or summarize those facts.

## Current / planned architecture

```text
Game events + canonical game state
              ↓
       Journal event intake
              ↓
       Game Day Summary
              ↓
        Journal persistence
              │
        ┌─────┴─────┐
        ↓           ↓
   Player Journal   DM Context Builder
                         ↓
                    LLM / AI DM
```

The important boundary is that the Journal provides **durable narrative memory**, while canonical stores remain authoritative for mechanical state.

## Game Day Summary

**Status: Planned**

A Game Day Summary should be generated at a meaningful campaign boundary, initially intended to be the party's **Long Rest / end-of-day** point.

The summary is both a player-facing game element and a machine-usable continuity record.

### Player-facing content

A summary should capture meaningful events such as:

- important decisions and consequences;
- significant conversations;
- newly discovered locations and NPCs;
- important encounters and battles;
- items acquired, used or lost;
- relationship/reputation changes;
- quest and objective progress;
- unresolved situations.

Each summary should close with a compact continuation state:

- current location;
- current party/companions;
- active main objective;
- important active quests;
- immediate next logical step.

### Machine-readable memory

The future implementation should also retain structured facts alongside the prose summary where useful. This prevents the DM from having to infer critical state from narrative prose alone.

Conceptually:

```text
Game Day Summary
├── narrative summary
├── significant events
├── important NPCs
├── discoveries
├── quest progress
├── unresolved threads
├── current location
└── current objective
```

The exact schema should be defined before implementation.

## AI context recovery

**Status: Planned**

The Journal is intended to provide a reliable fallback when live conversation history is truncated, unavailable or reset.

A future DM Context Builder may retrieve, in roughly this priority order:

1. current canonical game state;
2. latest Game Day Summary;
3. active quests/objectives;
4. important NPC relationships and facts;
5. recent significant events;
6. relevant discoveries/lore.

This should allow the DM to continue the campaign without requiring the entire historical chat transcript.

### Important architectural rule

The Journal is a **memory layer**, not a replacement for the application's domain stores.

For example:

```text
Inventory store → authoritative item ownership
Journal         → narrative record that an item was acquired/lost

World store     → authoritative current location/time
Journal         → narrative record of the journey

Character store → authoritative character state
Journal         → significant character development/events
```

## Quest Log

Quest information is a durable campaign record and should remain clearly separated from free-form diary entries.

Typical statuses:

- `Active`
- `Completed`
- `Failed`
- `Abandoned`

Quest state should ultimately integrate with the canonical quest/domain model rather than creating a conflicting quest database inside the Journal.

## Bestiary

The Journal can provide a player-facing record of encountered creatures.

Potential information includes:

- name;
- type;
- challenge rating;
- description;
- known abilities/stat information.

Creature definitions should continue to come from the canonical Atlas/enemy data rather than being duplicated by the Journal.

## Lore Codex

The Journal/Codex can expose discovered lore sourced from the Atlas lore assets.

The Journal should distinguish between:

- **available lore** in the game data;
- **discovered/unlocked lore** for the current campaign.

## Persistence

Journal entries must be persisted independently of live chat history.

This is important because the Journal's purpose is specifically to survive:

- chat truncation;
- chat reset;
- session boundaries;
- long campaigns.

The persistence mechanism should use the project's canonical save/persistence infrastructure rather than introducing an isolated storage mechanism.

## UI direction

The Journal should feel like an authentic campaign journal while remaining practical to scan.

Potential presentation split:

- diary / daily summaries — narrative presentation;
- quests — structured/scannable;
- bestiary — reference interface;
- lore — codex/reference interface.

Visual design is secondary to durable data integrity and retrieval.

## Dependencies

The eventual DM-memory implementation will depend on:

- canonical game-state stores;
- quest/domain data;
- Atlas data;
- persistence/save services;
- AI DM context/tool architecture.

It should not directly own or mutate those systems merely to generate summaries.

## Implementation roadmap

### Phase 1 — Journal foundation

- establish canonical Journal data model;
- persist entries through existing save infrastructure;
- distinguish diary, quest, discovery and summary records.

### Phase 2 — Game Day Summary

- define event intake;
- define summary schema;
- trigger summary generation at the chosen campaign boundary;
- store player-readable summary plus structured continuity data.

### Phase 3 — DM Context Recovery

- build a context retrieval layer;
- combine Journal memory with current canonical state;
- prioritize relevant memories rather than loading the entire journal;
- support chat reset/truncation recovery.

### Phase 4 — AI DM integration

- expose Journal retrieval through validated DM tools/services;
- allow the DM to write approved campaign memories;
- add safeguards against fabricated or conflicting memory.

## Related documentation

- `docs/modules/ai_dm.md`
- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/FUTURE_MODULES.md`
- `docs/TASK_BOARD.md`
