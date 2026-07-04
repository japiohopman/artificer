# Skill: Toril Location Image Generator

This document defines the requirements and technical specifications for the Toril Location Image Generator, a specialized tool designed to populate the `public/assets/atlas/world/` asset tree with high-quality, cinematic imagery.

## 1. Objective
Build a dedicated image generation utility (The "Toril Image Generator") to populate empty image slots for all `public/assets/atlas/world/` related assets. This tool will utilize the "Nano Banana" (Free Tier) capabilities to create immersive visuals based on D&D lore.

## 2. Directory & Path Mapping

### Input Data
The generator parses JSON files following the `city.schema.json` or `sub_region.schema.json` within:
- `public/assets/atlas/world/toril/faerun/cities/`
- `public/assets/atlas/world/toril/faerun/towns_settlements/`
- `public/assets/atlas/world/toril/faerun/fortresses_keeps/`
- *Other world categories (wetlands, forests, etc.)*

### Output Assets
Generated images must be stored in:
- `public/assets/images/world/[category]/[slug]/`
- Banners: `public/assets/images/world/[category]/[slug]/banner.webp`
- Locations: `public/assets/images/world/[category]/[slug]/[slug].webp`

## 3. Image Specifications

### A. Location Banner (Day/Night Matrix)
- **Aspect Ratio**: 16:9
- **Layout**: Divided into 2 horizontal rows, evenly divided.
  - **Top Row**: Day version of the location.
  - **Bottom Row**: Night version of the location.
- **Requirement**: The banner must be a single 16:9 image containing both states for UI flexibility. The `WorldPanel` component shifts the background position based on the game's time of day (day/night).

### B. Sub-Maps and Layers (Work in Progress)
- Sub maps and layers (such as sewers or building interiors) are placed in the same directory (e.g., `waterdeep_map.webp` and `waterdeep_map_sewers.webp`).
- Entries and exits are defined by detection areas (large boxes) on the map.
- Extremely large maps (like Waterdeep) may utilize a tiling system for higher resolution, though this requires high-res base assets.

## 4. Prompt Engineering Logic

### Data Extraction
The app must ingest the following fields from the location JSON (e.g., `baldurs_gate.json`):
- `type`: (e.g., "metropolis") - Defines the scale and density.
- `parent`: (e.g., "cities") - Defines the category context.
- `title`: (e.g., "Baldur's Gate: Metropolis of the Coast") - The formal descriptor.
- `description`: Detailed visual context (may contain wiki links).
- `wiki`: Summarized lore for atmosphere.
- `tags`: (e.g., `["city", "metropolis", "port"]`) - Direct prompt keywords.

### Style Injection (The "Skills" Style)
The app must use the established style used in the `skills/` directory:
- **Art Style**: Cinematic, high-fidelity digital painting, Baldur's Gate 3 / Classic D&D style, gritty texture, atmospheric lighting.
- **Composition**: Epic wide-angle landscape, centered for 3:2, panoramic for 16:9 rows.

## 5. D&D Markdown Styling
Location lore (from the `.md` files) is dynamically rendered in the `WorldPanel` using a custom D&D styling system:
- **H1 & H2**: Dark red (`#8B0000`), uppercase, tracking-widest.
- **HR**: Yellow/Gold (`#D4AF37`) separating borders.
- **Text**: Dark parchment text, serif font, italicized blockquotes with gold borders.

## 6. Technical Instructions for Copilot
- **API**: Use the "Nano Banana" service (configured in the sandbox environment).
- **Paths**: Ensure all images are saved to `public/assets/atlas/world/toril/faerun/[type]/[index]/[index].webp` subdirectories matching the atlas structure.
- **Format**: All outputs must be `.webp`.
