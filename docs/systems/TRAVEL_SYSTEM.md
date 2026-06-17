# 🧭 Travel System

The **Travel System** governs movement across the Sword Coast, translating distance and terrain into time, resource consumption, and narrative opportunities.

## 🧩 Mechanics

### 1. Movement Logic
- **Action-Based**: Travel is initiated as a group action.
- **Time Cost**: Calculated based on distance (miles) and Travel Mode.
    - *Walking*: 3 miles/hour (Standard), 4 miles/hour (Fast), 2 miles/hour (Slow/Stealth).
    - *Mounts/Vehicles*: Multipliers based on `transport.json` data.
- **Terrain Modifiers**: Mountains, wetlands, and forests apply speed penalties (e.g., x0.5 speed).

### 2. Travel Modes
- **Normal**: Standard pace, normal Perception.
- **Fast**: -5 penalty to Passive Perception, higher risk of exhaustion.
- **Stealth**: Half speed, enables Stealth checks against random encounters.

### 3. The Travel Loop
1.  **Set Destination**: Choose a discovered marker or known settlement.
2.  **Calculate Path**: System determines distance and ETA.
3.  **Consumption**: Deduct rations and water per day of travel.
4.  **Progression**: Advance `gameTime`.
5.  **Encounter Check**: Random rolls for events/combats based on region danger level.

### 4. Fast Travel
- Supported only between "High-Value Nodes" (Major Cities) or via magical means (Teleportation Circles).
- Consumes gold or spell slots instead of rations/time.

## 🗺️ Leaflet Integration
- Visualizes the party marker moving along established `road.json` paths or as the crow flies across wilderness.
- Dynamic pathfinding using Atlas spatial data.
