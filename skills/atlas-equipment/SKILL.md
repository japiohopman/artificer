---
name: "atlas-equipment"
description: >
  Image Generation Guidelines for Equipment (weapons, armor, tools). Defines artistic direction,
  chroma key void requirements, and tiered masterwork visual enhancements for the Arcane Codex.
---

# Image Generation Guidelines: Equipment

This document defines the artistic direction and prompt engineering for generating equipment assets (weapons, armor, tools) for the Arcane Codex.

## Enforced Rules for Image Generation

Equipment must look functional, realistic, and ready for use in a gritty dark fantasy setting.

### 1. The Chroma Key Void (MANDATORY)
- **Background**: 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
- **No Environment**: NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props.
- **No Context**: The subject must appear to be floating in a pure green digital void.
- **No Lighting Contamination**: NO shadows cast on the background, NO gradients, NO lighting effects on the green background.
- **No Vignette**: NO borders, NO frame, NO edge darkening, NO corner shadows. The green must be perfectly uniform with no lighting falloff.

### 2. Artistic Direction
- **Core Style**: Realistic, high-fidelity digital painting.
- **Tone**: Functional, worn, high-quality craftsmanship. Baldur's Gate 3 aesthetic.
- **Exclusions**: NO text, NO labels, NO characters, NO people, NO hands, NO magical runes (unless specified), NO glowing effects (unless specified), NO "legendary" over-the-top designs for standard gear.

## Prompt Engineering

### Base Prompt Template
> "A high-fidelity, cinematic digital painting of [EQUIPMENT_NAME], a [EQUIPMENT_TYPE]. [PHYSICAL_DESCRIPTION]. 
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
> Style: Baldur's Gate 3, realistic, gritty texture, functional design.
> Composition: Centered, dynamic pose. Aspect ratio 9:16.
> NO text, NO labels, NO characters, NO people, NO hands.
> --no cartoon, --no mobile game, --no low-quality."

### Aspect Ratio
- **Target**: 9:16 (portrait).
- **Resolution**: 1024x1024 (1K).

## Baking & Saving
- **Directory**: `public/assets/atlas/equipment/`
- **Format**: `.webp`
- **Naming**: `[equipment_index].webp`
