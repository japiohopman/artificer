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
- Locations: `public/assets/images/world/[category]/[slug]/day.webp` and `night.webp`

## 3. Image Specifications

### A. Location Banner (Day/Night Matrix)
- **Aspect Ratio**: 16:9
- **Layout**: Divided into 2 horizontal rows, evenly divided.
  - **Top Row**: Day version of the location.
  - **Bottom Row**: Night version of the location.
- **Requirement**: The banner must be a single 16:9 image containing both states for UI flexibility.

### B. Location Images
- **Aspect Ratio**: 3:2
- **Quantity**: 2 separate images.
  - `day.webp`: Day version.
  - `night.webp`: Night version.

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

### External Content Support
If the `description` or `wiki` fields contain a `https://forgottenrealms.fandom.com/wiki/` URL, the generator should use this to pull extra descriptive content to ensure canonical accuracy in the prompt.

## 5. User-Friendly Features

The app must include the following controls:
- **Re-roll**: Ability to re-generate just one of the 3 images (Banner, Day, or Night) if the result is unsatisfactory.
- **Prompt Editor**: Users must be able to see and rework the generated image prompt before execution.
- **Auto-Fill**: Button to scan the current location's wiki link for supplemental prompt data.

## 6. Technical Instructions for Copilot
- **API**: Use the "Nano Banana" service (configured in the sandbox environment).
- **Paths**: Ensure all images are saved to `public/assets/images/world/` subdirectories matching the atlas structure.
- **Format**: All outputs must be `.webp`.
