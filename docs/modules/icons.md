# Solo SVG Icon System Documentation

## Overview
The Artificer project utilizes a state-of-the-art, high-performance **Solo SVG Icon System**. Instead of storing raw SVG paths in legacy TypeScript files, all icons are managed as standard, standalone `.svg` files located in the `public/assets/icons/svg/` directory.

This architecture offers major benefits:
1. **Thematic Clarity**: Icons are organized cleanly in semantic folders (e.g., `ui`, `actions`, `statuses`, `items`).
2. **Dynamic Autodiscovery**: New icons are registered automatically when dropped into the appropriate folder, without editing constant definitions.
3. **Multi-path & Animation Support**: Icons support full SVG features, including multi-paths, gradients, colors, custom viewBox configurations, and CSS animations.
4. **Rich Metadata**: Custom `data-*` attributes inside SVG files provide instant localization and tooling integration (labels, descriptions, usage).

## Architecture

All icons reside in the public assets directory:
- **Registry**: `public/assets/icons/index.ts`
- **Solo SVGs**: `public/assets/icons/svg/`
- **UI Component**: `src/game_icons.tsx`

### Automatic Registries
The central registry at `public/assets/icons/index.ts` uses Vite's fast build-time glob import:
```ts
const svgModules = import.meta.glob('/public/assets/icons/svg/**/*.svg', { query: '?raw', eager: true });
```
Vite loads all `.svg` files inside the directory, parses their XML content on build, extracts attributes (viewBox, custom datasets), and exposes them as structured `IconDefinition` instances.

## Icon Categories
Subdirectories inside `public/assets/icons/svg/` correspond to standard categories used across game subsystems:

- **ui/**: Core navigational elements, window controls, and interface states (e.g., `chevron_left`, `close`, `save`, `plus`).
- **action/**: Core combat and exploration actions (e.g., `dodge`, `dash`, `hide`, `jump`).
- **actors/**: Creature types and identifiers (e.g., `beast`, `dragon`, `humanoid`).
- **damage/**: D&D 5e damage types (e.g., `fire`, `cold`, `lightning`).
- **statuses/**: Status conditions and ailments (e.g., `burning`, `poisoned`, `stunned`).
- **dice/**: Polyhedral dice representations.
- **items/**: Weapons, armor, and adventuring gear.
- **schools/**: Arcane schools of magic (e.g., `abjuration`, `evocation`).
- **tarot/**: Tarot-based arcana and divination cards.
- **equipment_doll/**: Indicators for equipment slot layout.

## How to Use Icons

### The GameIcon Component
Render any icon using the centralized `<GameIcon>` component:

```tsx
import { GameIcon } from '@/src/game_icons';

// Simple rendering by name
<GameIcon name="save" size={24} color="#8B0000" />

// Title / Tooltip support
<GameIcon name="chevron_left" size={16} title="Back to previous page" />
```

### Dynamic categories & direct imports
For custom rendering engines (e.g. World Maps, Tactical Grids), categorized indices can be imported directly:

```tsx
import { WORLD_ATLAS_ICONS, UI_ICONS } from '@/public/assets/icons';

const path = WORLD_ATLAS_ICONS['settlement']?.path;
```

## Adding New Icons
To add a new icon, simply:
1. Identify its folder under `public/assets/icons/svg/` (e.g. `public/assets/icons/svg/ui/`).
2. Save your SVG file inside the folder (e.g., `my_new_icon.svg`).
3. Embed optional semantic data attributes into your SVG tag:
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" 
        data-label="My New Icon" 
        data-description="Custom system control icon.">
     <path d="M..." />
   </svg>
   ```
4. Use it directly in React with `<GameIcon name="my_new_icon" />`. It is automatically rewired, bundled, and made available!
