# 🕒 Time System

The **Time System** is the heartbeat of Artificer, ensuring mechanical consistency for spell durations, rest cycles, and world events.

## 🧩 Temporal Simulation

### 1. The Clock (`gameTime`)
- Represented as minutes from midnight (0 to 1439).
- **Rollover**: At 1440, `gameDay` increments, and `gameTime` resets to 0.

### 2. The Calendar
- **Year**: 1492 DR (Default).
- **Months**: 12 months of 30 days each (plus festivals).
- **Seasons**: Affect the "Night" trigger in `useWorldStore`.

### 3. Pacing & Advancement
- **Standard Actions**: Conversations/Searching (10-30 mins).
- **Travel**: Hours per mile.
- **Combat**: 6 seconds per round (abstracted as 1-5 mins per encounter for world time).
- **Resting**: Short Rest (1 hour), Long Rest (8 hours).

## 🌑 Day/Night Cycle
- **Logic**: `isNight()` utility in the store.
    - Default: Night = `gameTime < 360` (6 AM) or `gameTime > 1200` (8 PM).
- **Impacts**:
    - Shop availability (most shops close at night).
    - NPC behavior (taverns get busier, streets get quieter).
    - Mechanical disadvantage on Perception checks without Darkvision.
    - Encounter tables (more dangerous creatures at night).

## 🛠️ Implementation
- Centralized in `useWorldStore.ts`.
- Subscribed to by the `Clock.tsx` sub-component in the World Panel.
