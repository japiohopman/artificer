# 🏛️ World Panel Architecture

The **World Panel** (`src/components/hud/WorldPanel.tsx`) is the central UI hub for environmental and group status information. It follows a modular composition pattern.

## 🧩 Component Hierarchy

`WorldPanel.tsx` (Container)
├── `Clock.tsx`: Visualizes `gameTime`, `gameDay`, and Solar Cycle.
├── `Weather.tsx`: Displays current `weather` type and regional temperature.
├── `Location.tsx`: Detailed view of `currentLocation` (Banners, Descriptions).
├── `TravelStatus.tsx`: Progress bars for active travel and travel mode toggles.
├── `Cities.tsx`: List of nearby settlements and quick-travel links.
├── `Shop.tsx`: Integrated view of the `currentShop` if the party is inside.
├── `PartyStatus.tsx`: Group-level health, supplies, and rest controls.
└── `EventFeed.tsx`: Log of recent world/party events.

## 🏗️ Architectural Guidelines
- **Composition over Logic**: The World Panel manages the layout (Framer Motion) and the order of sub-components.
- **Store-Driven**: Sub-components subscribe to specific slices (e.g., `Clock` subscribes to `useWorldStore`).
- **Decoupled Actions**: UI interactions (like clicking "Rest") call actions in the respective store (`restoreSlots`, `advanceTime`), not within the component.

## 🎨 Visual Language
- Uses the **Parchment-and-Dragonstone** aesthetic (see `STYLE_GUIDE.md`).
- Employs `bg-paper-texture` and `border-dragon-red` for consistency with the Arcane Codex.
