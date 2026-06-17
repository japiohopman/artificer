---
name: "atlas-monsters"
description: >
  Image Generation Guidelines for Monsters and Enemies. Defines artistic direction (Baldur's Gate 3 / D&D),
  chroma key void requirements, and structural prompts for high-fidelity creature illustrations.
---

# Image Generation Guidelines: Monsters

This document defines the artistic direction and prompt engineering for generating monster illustrations for the Arcane Codex.

## Enforced Rules for Image Generation

To ensure every asset is perfectly keyable for the Arcane Codex UI, the following rules are **STRICTLY ENFORCED**. Any generation that includes environmental context is a failure.

### 1. The Chroma Key Void (MANDATORY)
- **Background**: 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
- **No Environment**: NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props.
- **No Context**: The subject must appear to be floating in a pure green digital void.
- **No Lighting Contamination**: NO shadows cast on the background, NO gradients, NO lighting effects on the green background.
- **No Vignette**: NO borders, NO frame, NO edge darkening, NO corner shadows. The green must be perfectly uniform with no lighting falloff.

### 2. Artistic Direction
- **Core Style**: Artistic, cinematic, dark fantasy.
- **Inspiration**: Baldur's Gate 3, classic D&D (Wizards of the Coast style), high-fidelity digital painting.
- **Tone**: Adult-themed, gritty, serious, epic.
- **Exclusions**: NO mobile game aesthetics, NO "kids" or "cartoonish" styles, NO generic MOBA art.

## Prompt Engineering

When generating an image prompt for a monster, use the following structure:

### Base Prompt Template
> "A high-fidelity, cinematic digital painting of [MONSTER_NAME], a [MONSTER_TYPE]. [MONSTER_DESCRIPTION]. 
> 
> **CRITICAL BACKGROUND RULE:** 
> - The background MUST be a 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
> - THE SUBJECT MUST BE THE ONLY THING IN THE IMAGE.
> - NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props, NO environment.
> - NO shadows on the background, NO gradients, NO lighting effects on the background.
> - NO VIGNETTE, NO BORDERS, NO FRAME, NO EDGE DARKENING, NO CORNER SHADOWS.
> - The green background must be perfectly uniform with no lighting falloff.
> - The subject should appear as if it is floating in a pure, flat green digital void.
> 
> Style: Baldur's Gate 3, classic D&D, dark fantasy, adult-themed, gritty texture. 
> Composition: Centered, dynamic pose. Aspect ratio 3:2.
> --no cartoon, --no mobile game, --no low-quality."

### Aspect Ratio
- **Target**: 3:2 (landscape).
- **Resolution**: 1024x1024 (1K) is sufficient for card display.

## Baking & Saving
- **Directory**: `public/assets/atlas/enemies/images`
- **Format**: `.webp`
- **Naming**: `[monster_index].webp` (lowercase, hyphens instead of spaces).
