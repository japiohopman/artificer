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

### 🏗️ Architecture:
- **Store Slicing**: Integrated into the `useWorldStore` slice of the global state, ensuring that world-wide updates (like time or weather) don't trigger unnecessary re-renders of character-specific components.

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
- **Persona Context**: Powered by `src/services/ai/npcService.ts`, it maintains dynamic traits that emerge during play (e.g., "Now suspicious of Elves").

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

## 5. ⚔️ Tactical Combat Engine (`combat_engine.tsx`) we are looking for a way to do this tanke notes of the https://roll20.net/ site
**Purpose**: Transitions the experience from "Card Simulator" to a tactical D&D battle interface.

### 🧩 Key Systems:
- **Grid-Based Movement**: Top-down maps with token management, collision detection, and line-of-sight.
- **Initiative Tracker**: Dynamic turn-order management for players, NPCs, and lair actions.
- **AOE & Spatial Logic**: Precise mechanical resolution for cones, spheres, and lines (e.g., *Fireball* or *Lightning Bolt*).
- **AI Combat Logic**: AI-orchestrated enemy tactics based on their stat block (e.g., "Pack Tactics" for wolves).

### 🤖 Token Optimization:
- **Combat Snapshots**: Instead of sending full grid coordinates, the AI receives a "Tactical Summary" (e.g., `P1:Adjacent(E1),E1:LowHP,E2:Cover(Half)`).

---

## 6. ⚖️ Economic & Trade Module (`economy_manager.tsx`)
**Purpose**: Manages the flow of gold, goods, and regional scarcity.

### 🧩 Key Systems:
- **Regional Pricing**: Dynamic price scaling for equipment and materials based on location (e.g., higher prices for armor in war-torn regions).
- **Merchant Inventory**: Integration with the **Inventory V2 Registry** to handle stock rotation, buying, and selling.
- **Crafting & Materials**: Mechanical support for gathering and using materials defined in `shop_archetypes.json`.

---

## 7. 🔊 Soundscape Orchestrator (`soundscape_engine.tsx`)
**Purpose**: Deepens immersion by synchronizing audio with the AI-driven narrative.

### 🧩 Key Systems:
- **Mood-Based Transitions**: AI-requested shifts in background music via `src/services/soundService.ts` based on narrative tension.
- **Ambient Layering**: Dynamic mixing of environmental sounds (e.g., rain, tavern bustle, eerie silence).
- **Skeuomorphic Audio**: Physics-based SFX for dice rolls, coin flips, and page turns.

---

## 8. 📜 Rule Engine & Condition Tracker (`rule_engine.tsx`)
**Purpose**: Ensures mechanical consistency with D&D 5.5e rules.

### 🧩 Key Systems:
- **Condition Management**: Automated tracking and application of mechanical penalties/bonuses for conditions like *Exhausted*, *Poisoned*, or *Restrained*.
- **Passive Skill Resolution**: Background monitoring of passive Perception, Insight, and Investigation.
- **Rest & Recovery**: Mechanical resolution of Short and Long Rests, including hit dice recovery and spell slot replenishment.

---

## 9. 🏗️ AI Memory Cache & Context Strategy
The core challenge is maintaining a complex world state without exceeding the LLM's context window or wasting tokens.

### 🛡️ Store Slicing & Scalability
- **Architectural Shift**: To maintain performance as these modules are implemented, the global Zustand store is split into specialized slices: `useCharacterStore`, `useInventoryStore`, and `useWorldStore`. This prevents "God Store" bloat and optimizes re-render cycles.

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

## 10. 📂 Implementation Roadmap
1.  **Sprint 1: Core Foundations**
    - Refactor `useStore.ts` into specialized slices (`useCharacterStore`, `useInventoryStore`, `useWorldStore`).
    - Implement `worldState` and `campaignJournal` slices.
2.  **Sprint 2: Narrative & Persistence**
    - Create `Journal.tsx` component to visualize the recap logs and quest trackers.
    - Implement the **Rule Engine** for basic condition tracking.
3.  **Sprint 3: Spatial & Tactical**
    - Implement basic `AtlasMap.tsx` using `public/assets/atlas/world` images.
    - Develop the **Tactical Combat Engine** prototype (grid movement and initiative).
4.  **Sprint 4: Intelligence & Immersion**
    - Connect Gemini API to the Tool-Calling pipeline.
    - Implement the **Soundscape Orchestrator** for AI-driven audio.
