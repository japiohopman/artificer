# Icon System Documentation

## Overview
The Artificer project uses a custom, path-based icon system designed for maximum flexibility, performance, and thematic consistency. Unlike traditional libraries (e.g., Lucide or FontAwesome), we store raw SVG path data in TypeScript constants. This allows for easy tree-shaking, minimal bundle size, and full control over styling through standard SVG attributes.

## Architecture
The icon system is located in `src/assets/icons/`. It is organized into categorized files to ensure maintainability and clear ownership of icon sets.

### Directory Structure
- `src/assets/icons/index.ts`: The central registry that aggregates and exports all icon maps.
- `src/assets/icons/*.ts`: Categorized icon map files (e.g., `ui.ts`, `features.ts`, `equipment.ts`).
- `src/game_icons.tsx`: The primary `GameIcon` React component used to render icons throughout the application.

## Icon Categories
Icons are grouped by their functional role in the game:

- **UI_ICONS (`ui.ts`)**: General interface elements (navigation, controls, common status indicators). Merged from former Core, Logistics, and Navigation maps.
- **WORLD_ATLAS_ICONS (`world_atlas.ts`)**: Locations, regions, and landmarks for the world map and discovery systems. Recently expanded with more settlement and terrain types.
- **EDITOR_ICONS (`editor.ts`)**: Icons specific to internal tools, editors, and development utilities (formerly `DEVKIT_ICONS`).
- **BOOK_READER_ICONS (`book_reader.ts`)**: Controls and indicators for the in-game book reading experience.
- **TAROT_ICONS (`tarot.ts`)**: Illustrations for the tarot/divination system.
- **EQUIPMENT_DOLL (`equipment_doll.ts`)**: Slot indicators for the character equipment interface (Head, Chest, Boots, etc.).
- **MATERIALS (`materials.ts`)**: Categorized icons for crafting materials and resources.
- **SUBCLASS_ICONS (`subclasses.ts`)**: Unique identifiers for character archetypes.
- **ACTION_ICONS (`actions.ts`)**: Combat and exploration actions (Attack, Dash, Hide, etc.).
- **FEATURE_ICONS (`features.ts`)**: Class features, racial traits, and special abilities.
- **EQUIPMENT_ICONS (`equipment.ts`)**: Weapons, armor, and adventuring gear.
- **STAT_COMPARISON_ICONS (`stat_comparison.ts`)**: Indicators for value changes (improvement/reduction).

## How to Use Icons

### Standard Usage
Use the `GameIcon` component with the `name` prop:

```tsx
import { GameIcon } from '@/game_icons';

// Simple usage
<GameIcon name="save" size={24} color="#8B0000" />

// Within a button
<button>
  <GameIcon name="plus" size={16} />
  <span>Add Item</span>
</button>
```

### Adding New Icons
1.  **Identify the Category**: Choose the appropriate file in `src/assets/icons/`.
2.  **Add the Key**: Add a new key to the exported constant with an empty string or the SVG path data.
    ```ts
    export const UI_ICONS = {
      // ... existing icons
      new_icon_key: "M...", // SVG path data here
    };
    ```
3.  **Update the Registry**: If you created a *new* category file, you must import and export it in `src/assets/icons/index.ts`.

## Guiding Principles
- **Avoid Duplication**: Check if a similar icon already exists in `UI_ICONS` or other categories before adding a new one.
- **Path Data Only**: We do not use React Icon components (like those from `lucide-react`) directly in the game systems to maintain a consistent "Parchment & Dragonstone" aesthetic.
- **Semantic Naming**: Name icon keys based on their *meaning* or *function* (e.g., `magic_effect`, `range`, `panel`) rather than their visual appearance (e.g., `sparkles`, `target`, `layout`).
- **No Generic Names**: Avoid abstract or cryptic names like `zap`, `bot`, `activity`, or `knowledge`. Use descriptive names like `energy`, `identity`, `vitality`, or `lore`.
- **Consistency**: Features and variants should share icons where appropriate. Avoid redundant class-specific prefixes or level-based suffixes if the icon is functionally identical.

## Performance
By importing specific icon maps directly (e.g., `import { UI_ICONS } from '@/assets/icons/ui'`), Vite can tree-shake unused icons from the final build. Avoid using `ALL_ICONS` in production components.
