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
- **Characters**: `public/assets/atlas/characters/`
- **Items**: `public/assets/atlas/equipment/images/`
- **Monsters**: `public/assets/atlas/enemies/images/`

## Tracking & Quality
- **Validation**: Run `npm run validate:assets` to check path integrity.
- **Normalization**: Assets should use `snake_case` filenames and `.webp` or `.png` formats for images.
