# 🧭 Travel System

The **Travel System** governs movement across the Sword Coast, translating distance and terrain into time, resource consumption, and narrative opportunities.

## 🧩 Mechanics

### 1. Movement Logic (The Environmental Engine)
Travel is driven by the `EnvironmentalEngine` and managed within `useWorldStore.ts`.

- **Coordinate System**: The world map uses a custom "Proto Unit" coordinate system (4763 x 3185 units).
- **Scale Transformation**: 4000 miles in-game width corresponds to 4763 Proto Units (Approx 1.19 units per mile).
- **Speed Calculation**:
    - **Base Pace**: 3.0 mph (D&D Standard).
    - **Overburdened**: Speed is reduced by **50%** if the party's total weight exceeds their collective capacity.
    - **Mounts/Vehicles**: Having horses or carts grants a **+50%** speed bonus.
    - **Terrain Penalty**: Moving through "Water" regions reduces speed to **10%** (swimming/wading) unless the party possesses a boat or ship.

### 2. Fast-Forward Travel
When travel is initiated, the system can enter a `isFastForwarding` state.
- **Tick Rate**: Accelerated time progression.
- **Visuals**: The party marker (glowing gold) interpolates between the origin and destination.

### 3. Skip Travel (Instant Transition)
Single-player convenience feature to bypass the real-time wait.
- **Loading Screen**: Triggers a global `LoadingScreen` with rotating game art.
- **Time Advance**: Instantly advances game time by the total estimated travel duration.
- **Resting**: Automatically accounts for resting/sleep requirements if travel spans multiple days.
- **Repositioning**: Instantly teleports the party marker to the destination.

### 4. Random Encounters
During movement updates, the system performs an encounter check.
- **Probability**: 0.5% chance per movement update.
- **Trigger**: When an encounter occurs, `isFastForwarding` is reset to `false`.
- **Interruption**: The Chat Hub UI automatically expands, and a notification log is generated.
- **Combat**: In land regions, there is a 30% chance that an encounter immediately transitions the game into `combat` mode.

### 4. Discovery System
As the party travels, the area around their current coordinates is automatically marked as "explored" in the `exploredAreas` registry.
- **Discovery Radius**: 200 units.
- **Persistence**: Explored areas are used to clear "Fog of War" on the map.

## 🧩 Components

### 1. `Travel.tsx`
A standalone component (`src/components/core/Travel.tsx`) that handles the travel UI:
- **Preparation View**: Calculates distance, ETA, and provision requirements (rations/water) based on D&D 5e rules and party capacity.
- **Active Travel View**: Shows progress bar and provides "Fast Forward", "Skip Travel", and "Abort" controls.
- **Integration**: Nested within the `WorldPanel.tsx` footer via a portal-driven modal.

## 🗺️ Leaflet Integration
- **Coordinate Mapping**: The system translates high-resolution pixel coordinates from Leaflet into the Proto Unit system for movement calculations.
- **Party Marker**: A custom Leaflet DivIcon that pulses and tracks the `partyLocation` state.
- **Pathing**: Visualized as a dashed polyline connecting `travelOrigin` to `destination`.

## 🔄 Technical Data Flow
1.  **Initiation**: `startTravel(destination)` updates `travelOrigin` and `destination`.
2.  **Tick**: `updateEnvironment()` calculates the distance traveled since the last tick based on speed and time passed.
3.  **Update**: `partyLocation` is updated with the new interpolated coordinates.
4.  **Discovery**: `exploreArea()` is called for the new position.
5.  **Completion**: When `travelProgress` reaches 1.0, travel is stopped and `partyLocation` is snapped to the destination.
