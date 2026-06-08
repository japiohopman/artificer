# 🚀 Future Modules & AI Architecture Blueprint

This document outlines the architecture for missing core modules in the Artificer project. These modules are designed to bridge the gap between the immersive UI and the AI Dungeon Master (LLM), ensuring high-fidelity gameplay with optimal token efficiency.

## 1. 🌍 World State Module (`world_state.tsx`)
**Purpose**: Manages the "living" aspects of Faerûn that exist outside of specific character data.

### 🧩 Key Systems:
- **Temporal Progression**: 
    - Tracks `gameYear`, `gameMonth`, `gameDay`, and `gameTime`.
    - Handles celestial events (phases of Selûne, solar eclipses).
- **Environmental Engine**:
    - Dynamic weather based on region (e.g., "Heavy Snow" in the Spine of the World).
    - Affects mechanics (e.g., disadvantage on Perception in heavy rain).
- **Faction & Political State**:
    - Global reputation scores for major organizations (The Harpers, Zhentarim, Lords' Alliance).
    - Tracks "World Flags" (e.g., `is_waterdeep_under_siege: true`).

### 🤖 Token Optimization:
- **Status Codes**: Instead of describing the world in text, the LLM receives a compressed "World Pulse" (e.g., `W:WDT,T:0800,E:Sunny,F:Z:3`).

---

## 2. 🧠 NPC Memory Module (`npc_memory.tsx`)
**Purpose**: Provides persistence for NPCs beyond their static Atlas definitions.

### 🧩 Key Systems:
- **Affinity System**: Tracks an NPC's attitude toward the party on a numeric scale (-10 to +10).
- **Interaction Log**: Stores a summarized "Memory Index" of past conversations.
    - *Short-term*: Full transcript of the current session.
    - *Long-term*: Bulleted list of key takeaways (e.g., "Player lied about the relic").
- **Persona Context**: Dynamic traits that emerge during play (e.g., "Now suspicious of Elves").

### 🤖 Token Optimization:
- **Pointer Referencing**: The AI only receives the NPC's `atlas_id`. If the AI needs to "remember" something, it calls `get_npc_memory(id)`.

---

## 3. 🗺️ Atlas Map Module (`atlas_map.tsx`)
**Purpose**: An interactive spatial interface linking the Atlas data to the UI.

### 🧩 Key Systems:
- **Map Viewer**: Leaflet-like interaction for large-scale maps (e.g., Sword Coast).
- **Dynamic Markers**:
    - Real-time party location.
    - Discovered settlements, dungeons, and points of interest.
- **Sub-Map Navigation**: Seamless transition from a "City Map" to a "Tavern Interior" battle map.
- **Fog of War**: Persistence of explored vs. unexplored areas stored in the save file.

---

## 4. 📜 Journal Module (`journal.tsx`)
**Purpose**: Automatically records the party's journey for both the player and the AI.

### 🧩 Key Systems:
- **Session Summaries**: LLM-generated recap of the last 4 hours of gameplay.
- **Quest Tracker**: 
    - Active vs. Completed quests.
    - "Rumors" list (potential quest hooks).
- **Loot History**: A log of significant items acquired and where they were found.

---

## 5. 🏗️ AI Memory Cache & Context Strategy
The core challenge is maintaining a complex world state without exceeding the LLM's context window or wasting tokens.

### 🛡️ Context Distillation (The "Funnel" Method)
Instead of sending the entire game state, the system uses a tiered approach:
1.  **Fixed Context (Low Token)**: Party composition (names/classes), current location ID, and time.
2.  **Relevant Fragment (Dynamic)**: The system fetches only the JSON objects of items/NPCs mentioned in the last 3 messages.
3.  **The Summary (Rolling)**: Every 20 messages, the "Chat History" is summarized into a single "Narrative State" block.

### 🛠️ Tool-Call Architecture
The LLM should never "declare" that a player gains an item. It must call a tool:
- `addItem(targetId, itemId)`
- `updateWorldState(flag, value)`
- `rollCheck(skill, dc)`

### ⚡ Reference Pointers
When discussing an item like a "Sunblade," the system sends the AI: `[ITEM_REF:sunblade]`. The UI handles the rendering of the card. This saves 500+ tokens per item description.

---

## 📂 Implementation Roadmap
1.  **Sprint 1**: Refactor `useStore.ts` to include `worldState` and `campaignJournal` slices.
2.  **Sprint 2**: Create `Journal.tsx` component to visualize the recap logs.
3.  **Sprint 3**: Implement basic `AtlasMap.tsx` using `public/assets/atlas/world` images.
4.  **Sprint 4**: Connect Gemini API to the Tool-Calling pipeline.
