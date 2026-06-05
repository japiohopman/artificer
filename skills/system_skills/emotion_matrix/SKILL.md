# NPC Portrait Matrix Generation Skill

This document outlines the precise prompting strategy for generating high-quality 3x3 NPC emotion matrices for the NPC Matrix Forge.

## Core Requirements (Strict Enforcement)
- **Aspect Ratio**: 3:2 (Landscape). This is MANDATORY for the 3x3 layout.
- **Grid Structure**: EXACTLY 3 COLUMNS AND 3 ROWS (9 total portraits). 
- **STRICT PROHIBITION**: DO NOT GENERATE 4 COLUMNS. DO NOT GENERATE 12 CELLS.
- **Subject**: Same character in every cell.
- **Background**: Solid, vibrant chroma-key green (#00FF00). NO shadows, NO gradients, NO lighting variations on the green.
- **Framing**: Waist-up or bust. 
- **Grounding (CRITICAL)**: The torso MUST touch the bottom edge of each cell. No floating characters. No white margins or borders around the character.
- **Consistency**: head shape, proportions, clothing, hair, lighting, and color palette must remain identical across all cells.

## The 3x3 Emotion Matrix Layout
The grid must follow this specific order of emotions:
1. **Top-Left**: Neutral
2. **Top-Center**: Curious
3. **Top-Right**: Skeptical
4. **Middle-Left**: Happy
5. **Middle-Center**: Greedy
6. **Middle-Right**: Angry
7. **Bottom-Left**: Sad
8. **Bottom-Center**: Surprised
9. **Bottom-Right**: Proud

## Art Direction (Prompt Injector)
- **Style**: Cinematic, high-fidelity digital painting.
- **Aesthetic**: Baldur's Gate 3 / Classic D&D (Forgotten Realms) style.
- **Tone**: Adult-themed, gritty, realistic textures, dramatic lighting.
- **Detail**: Hyper-detailed skin textures, fabric weaves, and metallic reflections.

## Prompting Strategy

### System Instruction
"Generate a high-quality 2D character sheet. The image MUST be a strictly organized grid of THREE COLUMNS AND THREE ROWS, containing EXACTLY 9 individual portrait cells. DO NOT generate more than 3 columns. Use a solid, flat, vibrant chroma-key green background (#00FF00) for every cell. Ensure the character is framed from the waist up, and their body is grounded at the bottom of each cell frame with no empty space or borders beneath them."

### Negative Prompt (Essential)
"4 columns, 5 columns, 6 columns, 4x3 grid, 4x4 grid, 12 cells, 16 cells, white outlines, white borders, white margins, white background, clipped hair, clipped shoulders, shields exiting frame, weapons exiting frame, green spill on skin, green reflections, green tint in hair, multiple characters in one cell, text, labels, watermarks, full body, floating, inconsistent features, messy layout, gradients in background, shadows on background, vignette, shadows on green, dark edges."

## Quality Checks
- **Hair/Edges**: Ensure hair is not "clipped" or missing pieces. Avoid green tints in hair that might be keyed out.
- **Outlines**: No white or light outlines around the subject. The transition from subject to green must be sharp and clean.
- **Framing**: Ensure the character's head and shoulders are fully within the frame, but the torso is anchored to the bottom.
