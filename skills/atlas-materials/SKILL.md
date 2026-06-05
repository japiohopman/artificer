---
name: "atlas-materials"
description: >
  Image Generation Guidelines for Materials (Herbs, Monster Parts, Oils, Ores). Defines artistic direction,
  chroma key void requirements, and specific physical forms for different material sub-categories.
---

# Image Generation Guidelines: Materials

This document defines the artistic direction and prompt engineering for generating material assets for the Arcane Codex crafting system.

## Enforced Rules for Image Generation

Materials must be clearly identifiable and isolated for use in inventory and crafting UIs.

### 1. The Chroma Key Void (MANDATORY)
- **Background**: 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
- **No Environment**: NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props.
- **No Context**: The subject must appear to be floating in a pure green digital void.
- **No Lighting Contamination**: NO shadows cast on the background, NO gradients, NO lighting effects on the green background.
- **No Vignette**: NO borders, NO frame, NO edge darkening, NO corner shadows. The green must be perfectly uniform with no lighting falloff.

### 2. Physical Representation (The "Waterproof" Shapes)
To maintain consistency in the asset database, materials must follow these physical forms based on their category:

- **BUNDLED MATERIALS**: Neatly tied bundles, often wrapped with simple twine or sitting in a small, organized stack.
- **COMMON MATERIALS**: Clean, refined versions of base materials (e.g., standard fabric scraps, basic leather patches).
- **CONSUMABLES**: Focused on the item itself (e.g., a loaf of bread, a dried ration). High focus on appetizing but gritty textures.
- **HERBS**: Freshly picked sprigs, leaves, or roots. They should look organic and raw. **ABSOLUTELY NO leather straps, NO labels, NO furniture.** Just the botanical specimen.
- **MONSTER PARTS**: Organic, visceral components (e.g., a dragon scale, a beholder eyestalk, a vial of manticore blood). They should look trophy-like but raw.
- **OILS**: A single, elegant glass vial or bottle containing the translucent fluid. Focus on light refraction and fluid viscosity.
- **RAW MATERIALS (Metal/Stone)**: Raw, jagged chunks of ore or stone. Focus on mineral veins.
- **REFINED MATERIALS (Metal)**: Solid, rectangular ingots or bars. Focus on metallic luster and sharp edges.

### 3. Artistic Direction
- **Core Style**: Realistic, high-fidelity digital painting. 
- **Inspiration**: Baldur's Gate 3, Realistic Alchemy.
- **Tone**: Gritty, functional, professional game asset.
- **Exclusions**: NO text, NO labels, NO characters, NO people, NO hands, NO furniture, NO props.

## Prompt Engineering

### Base Prompt Template
> "A high-fidelity, cinematic digital painting of [MATERIAL_NAME], a [MATERIAL_TYPE]. [PHYSICAL_DESCRIPTION]. 
> 
> **CRITICAL BACKGROUND RULE:** 
> - The background MUST be a 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
> - THE SUBJECT MUST BE THE ONLY THING IN THE IMAGE.
> - NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props, NO environment.
> - NO shadows on the background, NO gradients, NO lighting effects on the background.
> - NO VIGNETTE, NO BORDERS, NO FRAME, NO EDGE DARKNESS.
> - The subject should appear as if it is floating in a pure, flat green digital void.
> 
> Style: Realistic, gritty texture, high craftsmanship.
> Composition: Centered, static pose. Aspect ratio 9:16.
> NO text, NO labels, NO characters, NO people, NO hands.
> --no cartoon, --no mobile game, --no low-quality."

### Aspect Ratio
- **Target**: 9:16 (portrait).
- **Resolution**: 1024x1024 (1K).

## Baking & Saving
- **Directory**: `public/assets/atlas/crafting/`
- **Format**: `.webp`
- **Naming**: `[material_index].webp`
