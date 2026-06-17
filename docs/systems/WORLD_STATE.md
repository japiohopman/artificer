# 🌍 World State System

The **World State** manages the autonomous and environmental aspects of Faerûn that exist independently of the party's immediate actions.

## 🧩 Key Data Structures

### 1. Temporal Engine (`TemporalNode`)
- `gameYear`: The current year in DR (Dalereckoning).
- `gameMonth`: Month of the year (1-12, following the Calendar of Harptos).
- `gameDay`: Day of the month.
- `gameTime`: Current minute of the day (0-1439).
- `solarCycle`: Calculated state (Dawn, Midday, Dusk, Deep Night).

### 2. Environmental Engine
- `weather`: Current localized weather (Sunny, Rain, Storm, etc.).
- `temperature`: Regional modifiers (Freezing, Temperate, Scorching).
- `season`: Affects daylight duration and weather probability.

### 3. Global Flags & Factions
- `worldFlags`: Boolean or numeric keys for significant events (e.g., `is_waterdeep_under_siege`).
- `factionStandings`: Global power balance between major groups (Harpers, Zhentarim, etc.).

### 4. Dynamic Atlas
- `shopStock`: Managed rotation of items in specific archetypes.
- `npcLocations`: Tracks major NPCs if they move between settlements.

## 🤖 AI Interaction
- **World Pulse**: A compressed status code (e.g., `W:Rain,T:1420,F:Z:3`) sent to the LLM to provide environmental context without high token cost.
- **Tool Calls**: The AI uses `updateWorldFlag()` or `advanceTime()` to mutate this state.
