# 🌊 Data Flow & Orchestration

This document describes the flow of information between the UI, Stores, Services, and the AI Dungeon Master.

## 🧩 State Orchestration

### 1. The Store Slices (Zustand)
- **`useCharacterStore`**: Individual character data (Stats, HP, Spells).
- **`useInventoryStore`**: Item Registry and Container slots.
- **`useWorldStore`**: Environment, Time, Weather.
- **`usePartyStore`**: Group resources, location, travel status.

### 2. Services (The "Heavy Lifters")
- **`atlasService.ts`**: Resolves JSON data from the "Reality" database.
- **`soundService.ts`**: Manages the reactive audio layers.
- **`aiService.ts`**: Handles Gemini 1.5 interaction and tool-calling.

## 🔄 Flow Patterns

### User Action (e.g., "Start Travel")
1.  User clicks "Travel" in `TravelStatus.tsx`.
2.  Component calls `startTravel(destination)` action in `usePartyStore`.
3.  Store updates `travelStatus`.
4.  `useWorldStore` begins advancing `gameTime` in a loop.
5.  `atlas_map.tsx` (Leaflet) detects the state change and animates the party marker.

### AI Event (e.g., "AI declares an ambush")
1.  Gemini sends a tool call: `triggerEncounter(encounterId)`.
2.  `aiService` processes the call and updates `usePartyStore` with `activeEncounter`.
3.  UI switches to `combat` mode.
4.  `soundService` transitions the music layer to `tension_high`.

### Persistence
- Every significant state change triggers a background save to the proxy, which syncs with GitHub/Firebase.
