# AI Dungeon Master

## Status

**Planned / architecture phase**

Artificer does not currently have a completed AI Dungeon Master architecture. This document defines the intended boundaries so future implementation does not become tightly coupled to chat UI or individual game modules.

## Goal

The AI Dungeon Master should act as the narrative orchestrator of the campaign while respecting the application's canonical game state and rules.

It should be able to:

- narrate the world;
- interpret player intent;
- request validated game actions;
- use dice/rules systems;
- react to world, character and combat state;
- retrieve durable campaign memory;
- maintain narrative continuity across chat resets and long sessions.

The AI should **not** become the source of truth for game state.

## Core architecture

```text
                         ┌────────────────────┐
                         │  Current Game State │
                         └─────────┬──────────┘
                                   │
                                   │
┌──────────────┐        ┌──────────▼──────────┐
│ Chat / Player│ ─────► │    Context Builder  │
└──────────────┘        └──────────┬──────────┘
                                   │
                         ┌─────────▼─────────┐
                         │       AI DM       │
                         │       (LLM)       │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ Validated Tool    │
                         │ Calls / Actions   │
                         └─────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ↓                    ↓                    ↓
          Dice/Rules          World/Character       Journal
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ↓
                           Canonical State
```

## Architectural principles

### 1. The AI is not the database

The LLM can reason about state but must not be treated as authoritative state storage.

Canonical state remains in the appropriate application stores/services.

### 2. Tool calls are validated

The DM should interact with game mechanics through explicit, validated actions.

Conceptually:

```text
LLM decision
    ↓
tool call
    ↓
validation
    ↓
domain action/service
    ↓
canonical state mutation
```

The model should not receive unrestricted access to Zustand stores or arbitrary persistence APIs.

### 3. Context is assembled, not blindly copied

The DM should not depend on sending the complete application state or entire chat transcript on every request.

The Context Builder should select the information relevant to the current situation.

### 4. Narrative memory is separate from mechanical state

The Journal provides durable campaign memory. It summarizes important events and continuity but does not replace canonical game-state stores.

```text
Canonical state → what is true now
Journal          → what happened and what matters narratively
Chat history     → recent conversation
```

## Context Builder

**Status: Planned**

The Context Builder will assemble a compact prompt/context package from relevant sources.

Potential inputs:

- current location and time;
- party members and relevant character state;
- active quests/objectives;
- nearby/relevant NPCs;
- encounter/combat state;
- inventory facts relevant to the situation;
- latest Game Day Summary;
- important campaign memories;
- recent chat turns;
- relevant Atlas/lore data.

The builder should prioritize relevance rather than simply taking everything available.

## Campaign memory

The Journal is the primary planned durable narrative memory layer.

A reset or truncated chat should be recoverable through:

```text
Current canonical state
        +
Latest Game Day Summary
        +
Relevant campaign memories
        +
Active objectives
        ↓
New DM context
```

See `docs/modules/journal.md`.

## Game Day Summary

A Game Day Summary is a planned memory primitive generated at a meaningful campaign boundary, initially intended to align with Long Rest/end-of-day behavior.

It should contain both:

- player-readable narrative summary;
- structured continuity facts useful to the Context Builder.

The summary should focus on meaningful events and unresolved threads, not reproduce the chat transcript.

## Tool categories

The final tool contract is not yet defined. Expected categories include:

### Dice / rules

- roll dice;
- resolve checks;
- resolve attacks/saves where supported;
- query applicable rules.

### Character / party

- inspect character state;
- apply validated character changes;
- manage approved party actions.

### World

- inspect location/environment;
- advance approved world state;
- trigger supported world events.

### Inventory

- inspect relevant inventory;
- add/remove/consume/equip through canonical inventory actions.

### Journal / memory

- retrieve relevant memories;
- retrieve latest summaries;
- write approved campaign memories/summaries.

### Combat

- inspect encounter state;
- request valid combat actions;
- resolve supported combat operations.

The existence of a tool in this design does not mean that the corresponding production API already exists.

## Memory safety

The future DM must handle conflicts between narrative memory and canonical state safely.

Priority should generally be:

```text
Canonical current state
        ↓
Validated domain records
        ↓
Structured Journal memory
        ↓
Narrative prose
        ↓
Model inference
```

If the Journal says an item was acquired but the inventory state says it is not currently owned, the DM should not silently mutate inventory to make the story fit. It should use the canonical state and, where appropriate, narratively explain the discrepancy.

## Implementation phases

### Phase 1 — Contracts

- define DM boundaries;
- define Context Builder input/output;
- define tool-call contract;
- define Journal memory contract.

### Phase 2 — Context Builder

- gather current state;
- retrieve relevant Journal memory;
- include recent chat context;
- enforce context-size/relevance limits.

### Phase 3 — Validated tools

- dice/rules tools;
- character/world/inventory tools;
- journal retrieval/update tools;
- combat tools.

### Phase 4 — Narrative orchestration

- integrate the LLM;
- generate DM responses;
- execute validated tool calls;
- feed results back into the narrative turn.

### Phase 5 — Continuity

- Game Day Summary generation;
- chat reset recovery;
- long-campaign memory retrieval;
- conflict handling between memory and canonical state.

## Non-goals

The AI DM should not:

- directly manipulate arbitrary React state;
- replace domain stores;
- store the entire campaign only in chat history;
- use narrative text as authoritative mechanical state;
- create a second inventory/character/world database.

## Related documentation

- `docs/modules/journal.md`
- `docs/modules/dice_system.md`
- `docs/systems/DATA_FLOW.md`
- `docs/systems/TACTICAL_COMBAT_ENGINE.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/FUTURE_MODULES.md`
