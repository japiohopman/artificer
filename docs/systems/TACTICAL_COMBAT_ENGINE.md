# ⚔️ Tactical Combat Engine

The **Tactical Combat Engine** provides a grid-based interface for resolving encounters within Faerûn. It translates the abstract stats in the Atlas (Enemies, Spells, Weapons) into spatial actions.

## 🧩 Spatial Mechanics

### 1. The Grid
- **Scale**: 1 Square = 5 Feet.
- **Coordinate System**: `[x, y]` integer-based grid.
- **Unit Sizing**:
    - **Tiny/Small/Medium**: 1x1 Square (5ft).
    - **Large**: 2x2 Squares (10ft).
    - **Huge**: 3x3 Squares (15ft).
    - **Gargantuan**: 4x4+ Squares (20ft+).

### 2. Movement & Range
- **Speed**: Represented in feet. A creature with 30ft speed can move 6 squares.
- **Range**: Spell and weapon ranges are converted to squares (e.g., *Fireball* 150ft = 30 squares).
- **Diagonal Movement**: Following the 5-10-5 rule (The first diagonal costs 5ft, the second costs 10ft).

### 3. Area of Effect (AOE)
- **Sphere/Circle**: Rendered as a radial highlight from a point.
- **Cube/Square**: Rendered as a square highlight from a point.
- **Cone**: 45-degree or 90-degree angular highlight.
- **Line**: Straight path highlight between two points.

## 🔄 The Combat Loop

### 1. Initiative (Setup)
- Roll `1d20 + Dex Modifier` for all participants.
- Sort participants into the **Initiative Queue**.
- Set the first participant as the "Active Unit."

### 2. Turn Sequence (Active Unit)
A unit has access to:
- **Movement**: Up to their speed.
- **Action**: Attack, Cast Spell, Dash, Disengage, etc.
- **Bonus Action**: Specialized traits (e.g., Goblin's *Nimble Escape*).
- **Reaction**: Triggers on external events (e.g., *Attack of Opportunity*).

### 3. Resolution
- **To Hit**: `1d20 + Attack Bonus` vs. `Target Armor Class`.
- **Saving Throws**: Target rolls `1d20 + Ability Mod` vs. `Attacker DC`.
- **Damage**: Roll specified dice (e.g., `8d6 fire`) and subtract from target `hp`.

## 🤖 AI Interaction
- **Tactical Strategy**: The AI DM uses the `resolveCombatAction` tool to move enemies and select targets.
- **Narrative Overlay**: The AI narrates the results of the spatial resolution (e.g., "The goblin dodges the fire, but its sleeve is singed").

## 🛠️ Data Integration
- **Enemies**: Fetched from `public/assets/atlas/enemies/json/`.
- **Spells**: Fetched from `public/assets/atlas/spell/json/`.
- **Items**: Fetched from `public/assets/atlas/equipment/json/`.

---
*Status: Initializing Phase 2 (Tactical Foundations).*
