# 🏛️ World Panel Documentation

## Overview
The **World Panel** (`src/components/hud/WorldPanel.tsx`) is a dynamic, schema-driven interface that serves as the primary information hub for locations, settlements, and tactical threats in the game world.

## Architecture: Schema-Driven Rendering
Unlike traditional UI components that use hardcoded fields, the World Panel dynamically inspects the selected atlas object's metadata and renders sections based on the available data.

### 1. Dynamic Section Generation
The panel iterates through a predefined map of schema keys to human-readable titles. If a key (e.g., `government`, `economy`, `wildlife`) exists in the location's JSON data, the panel renders the corresponding section.

```typescript
const SCHEMA_MAP = {
   history: 'History & Lore',
   government: 'Government',
   population: 'Population',
   economy: 'Economy & Trade',
   climate: 'Climate',
   biome: 'Biome',
   wildlife: 'Wildlife',
   factions: 'Factions',
   religion: 'Religion',
   services: 'Services',
   inventory: 'Inventory',
   quests: 'Rumors & Quests',
   districts: 'Districts'
};
```

### 2. Markdown Integration
The panel supports rich text via `react-markdown`. If a `lore` field is present (pointing to a `.md` file), the panel fetches and renders the content with custom fantasy-themed styling.

### 3. Sub-Map Transition
When the party arrives at a destination, the panel provides an "Enter Location" action. This triggers a transition to `LocationMap.tsx`, swapping the global atlas view for a detailed local map.

## Component Modules
- **Header**: Displays the location's banner image, name, and category. Adapts visually to the time of day (Day/Night cycles).
- **Threat Feed**: During combat mode, this section lists all active monsters with real-time HP bars and selection hooks.
- **Lore Content**: The primary scrollable area for descriptions and schema-driven metadata.
- **Footer Widgets**:
    - **AdvancedRoller**: Persistent dice utility.
    - **Travel**: Movement controls and expedition status.
    - **Lore Codex Link**: Quick access to the full Journal/Codex view.

## Visual Style
- **Aesthetic**: Parchment & Dragonstone.
- **Transitions**: Uses `framer-motion` for smooth panel expansion and content updates.
- **Icons**: Exclusively uses the centralized `GameIcon` system from `src/assets/icons/`.

## Data Integration
- **Stores**: Subscribes to `useWorldStore` (location data), `useGameStore` (combat state), and `useUIStore` (visibility).
- **Atlas Service**: Relies on `atlasService.ts` for fetching detailed location JSON and markdown lore.
