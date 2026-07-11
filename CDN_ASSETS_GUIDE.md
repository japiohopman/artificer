# Artificer CDN & Asset Management Guide

This document defines the rules and requirements for managing the assets used on the **Artificer Promotional Site**.

**Live Site:** [https://japiohopman.github.io/artificer_site_promo](https://japiohopman.github.io/artificer_site_promo)

## 🌐 The CDN Architecture
The promotional site is built to be "evergreen." It pulls all visual assets directly from the main Artificer repository via the GitHub Raw CDN.

**CDN Root:** `https://raw.githubusercontent.com/japiohopman/artificer/main/docs/site/assets/`

Any file added or updated in the `docs/site/assets/` directory of the Artificer repo will automatically reflect on the promo site.

---

## 📏 Asset Rules & Naming Conventions

To keep the site clean and high-performance, follow these rules:

### 1. File Naming
- Use **snake_case** for all files (e.g., `tactical_table_alpha.png`).
- Prefix assets based on their section:
  - `promo_` : General marketing/hero images.
  - `module_` : Individual tool/feature screenshots.
  - `devkit_` : Creator/GM tool specific assets.
  - `ui_` : Small UI elements or icons.

### 2. Format & Size
- **Hero/Full-width Images:** 1920x1080px (minimum), highly compressed PNG or WebP.
- **Module Thumbnails:** 1280x720px (16:9 aspect ratio).
- **Icons/Logos:** SVG preferred, otherwise 512x512px transparent PNG.

---

## 🛠 Required Assets (Action Items)

The current promo site uses placeholders or internal screenshots. We need the following high-quality replacements to be placed in `docs/site/assets/`:

### 1. DevKit / GM Kit Section
- `devkit_audio_orchestration.png`: A clean view of the 11Labs/AI audio generator panel.
- `devkit_entity_generator.png`: A screenshot showing the NPC or Habitat generator in action.
- `devkit_mechanics_validator.png`: A view of the dice/mechanical audit log.

### 2. The Foundry (Modules)
- `module_atlas_zoomed.png`: A view showing the detailed zoom tiers of the World Atlas.
- `module_journal_entry.png`: A clean session entry with AI-assisted tags or summaries.
- `module_inventory_grid.png`: The registry-based inventory system with items equipped.

### 3. Tavern & Mini-Games
- `mini_game_tda_full.png`: A high-resolution capture of the *Three Dragon Ante* interface.

---

## 🔄 Update Workflow
1. Create/Capture the asset.
2. Optimize for web (use tools like TinyPNG).
3. Push to `docs/site/assets/` in the `artificer` repository.
4. Verify the change on the live promo site.

---
*Maintained by The Lorekeeper Collective.*
