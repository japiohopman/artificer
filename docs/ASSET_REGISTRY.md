# Artificer Asset Registry

## Overview
This registry tracks all non-code assets used in the project, including sounds, images, and data schemas.

## Sounds
- **Location**: `public/assets/sounds/`
- **Structure**:
  - `system/`: UI, notifications, menus.
  - `voice/`: NPC and PC voice lines.
  - `sfx/`: Magic, combat, environment effects.
  - `creatures/`: Monster sounds.
  - `ambient/`: Background loops (Nature, Caves, Taverns).
  - `music/`: Thematic tracks.

## Atlas Data (JSON)
- **Location**: `public/assets/atlas/`
- **Key Domains**:
  - `enemies/`: Monster stats and traits.
  - `equipment/`: Items, weapons, and armor.
  - `spell/`: Magic definitions.
  - `maps/`: Tactical and world maps.

## Images
## Icons
- **Location**: `src/assets/icons/`
- **Category Files**: 
  - `core.ts`: System UI, navigation, and core combat icons.
  - `equipment.ts`: Item category icons.
  - `attacks.ts`: Weapon and natural attack icons.
  - `feats.ts`, `features.ts`, `traits.ts`: Character ability icons.
  - `magic_schools.ts`, `alignments.ts`, `languages.ts`: Lore and mechanic icons.
  - `proficiencies.ts`, `skill.ts`, `ability_score.ts`: Character stat icons.
- **Usage**: Icons are registered in `index.ts` and used via the `GameIcon` component by name.
- **Characters**: `public/assets/atlas/characters/`
- **Items**: `public/assets/atlas/equipment/images/`
- **Monsters**: `public/assets/atlas/enemies/images/`

## Tracking & Quality
- **Validation**: Run `npm run validate:assets` to check path integrity.
- **Normalization**: Assets should use `snake_case` filenames and `.webp` or `.png` formats for images.
