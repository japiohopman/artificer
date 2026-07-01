# 🌊 Data Flow & Orchestration

This document describes the flow of information between the UI, Stores, Services, and the AI Dungeon Master.

## 🧩 State Orchestration

### 1. Specialized Store Slices (Zustand)
To ensure scalability and performance, the global state is partitioned into specialized stores:

- **`useUIStore`**: Manages global UI visibility (menus, panels), navigation state, and search queries.
- **`useWorldStore`**: Orchestrates temporal progression, weather cycles, travel mechanics, and environmental data.
- **`useCharacterStore`**: Contains character statistics, features, spellcasting state, and relationship levels with NPCs.
- **`useInventoryStore`**: Manages the V2 item registry, container slots, party resources, and vehicles.
- **`useGameStore`**: Handles transient session state such as combat grids, logs, dice history, and minigame states.
- **`useAtlasStore`**: Provides access to the "Reality" database, managing the loading and indexing of JSON entities.
- **`useJournalStore`**: Persistent storage for player notes, quest logs, and discovered bestiary entries.
- **`useAudioStore`**: Controls the multi-layered sound engine and mood-based transitions.
- **`useBookStore`**: Manages the state of the in-game reading system and page progression.
- **`useAuthStore`**: Handles user authentication and session status.

### 2. Services (The "Heavy Lifters")
- **`atlasService.ts`**: Resolves JSON data from the physical asset directory.
- **`saveService.ts`**: Handles persistence logic via GitHub Proxy and Firebase.
- **`diceService.ts`**: Integrates with the 3D physics engine and reconciles results with logical state.

## 🔄 Flow Patterns

### Travel Execution
1.  **Input**: User selects a destination on the `WorldMap`.
2.  **Action**: `startTravel(destination)` is dispatched to `useWorldStore`.
3.  **Simulation**: The `EnvironmentalEngine` (running in a 10s tick) advances time and calculates movement.
4.  **Reaction**: `WorldMap` listens to `partyLocation` and animates the marker.

### Combat Resolution
1.  **Trigger**: AI tool call or random encounter interrupts travel.
2.  **Mode Shift**: `useUIStore.setGameMode('combat')` switches the central viewport.
3.  **Initialization**: `useGameStore.startCombat()` rolls initiative and populates the grid.
4.  **Interaction**: User clicks on `CombatGrid` to move; actions are logged and state is updated.

## 🛡️ Mechanical Integrity
The application follows a "State-First" philosophy:
- **UI as a Projection**: Components only reflect what is in the stores. 
- **Validation**: Stores enforce game rules (e.g., movement range, spell slot availability) before committing changes.
- **AI as an Actor**: The LLM acts through tool calls that are subject to the same validation as user clicks.
