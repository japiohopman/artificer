# 👥 Party State System

The **Party State** manages the collective situation, resources, and progress of the player characters. It is the bridge between individual character stats and the global world simulation.

## 🧩 Key Data Structures

### 1. Spatial Context
- `partyLocation`: Reference to the current Atlas location (e.g., city, ruin).
- `partySubLocation`: Current categorical location (e.g., specific shop, tavern).
- `destination`: Target location for active travel.

### 2. Travel & Logistics
- `travelMode`: Current method of movement (Walking, Riding, Vehicle).
- `travelStatus`: State of movement (Stationary, Traveling, Encamped).
- `supplies`: Tracks food, water, and fuel (measured in days of sustenance).

### 3. Campaign Progress
- `activeQuests`: List of ongoing mission IDs and current stages.
- `discoveredPOIs`: List of locations discovered by the party.
- `reputation`: Region-specific standing with factions (synced with World State).

### 4. Group Status
- `restState`: Tracks Short Rest and Long Rest status.
- `exhaustion`: Group-level fatigue if applicable (e.g., forced marches).
- `encumbrance`: Total weight of collective inventory vs. capacity (Characters + Vehicles).

## 🔄 Integration
- **World State**: Time progression during travel and weather impacts.
- **Inventory V2**: Resource consumption (supplies/gold).
- **Save System**: Persisted as part of the campaign metadata.
