# Spell Sprite Sheets Master Index & Layout Specifications

This directory contains the recommended visual layout and grid ordering for spell spritesheets used in Artificer / Arcane Codex.

## Grid Specifications
- **Grid Layout**: 4 columns × 4 rows (16 cells per spritesheet)
- **Cell Dimensions**: 512 × 512 pixels (Recommended canvas size: 2048 × 2048 pixels)
- **File Format**: Transparent PNG or WebP with alpha channel
- **Naming Convention**: `cantrips_01.webp`, `spells_level1_01.webp`, `spells_level1_02.webp`, etc.

## Spritesheet Layout Files
1. [`cantrips_01.md`](./cantrips_01.md) - Primary Cantrip Spells (Level 0)
2. [`spells_level1_01.md`](./spells_level1_01.md) - 1st-Level Offense, Defense & Healing Spells
3. [`spells_level1_02.md`](./spells_level1_02.md) - 1st-Level Utility, Control & Buff Spells

## Grid Indexing Formula
- `Row = Math.floor(cell_index / 4)`
- `Col = cell_index % 4`
- `X_Offset = Col * 512px`
- `Y_Offset = Row * 512px`
