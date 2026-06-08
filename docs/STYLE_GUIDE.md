# 🎨 Artificer House Style Guide

This document defines the visual language for the **Artificer** project. All agents and developers should strictly adhere to these guidelines to ensure UI/UX consistency across the application and generated content.

## 🏛️ The "Parchment & Dragonstone" Aesthetic

Artificer does **not** follow the typical "modern dark mode" trend. Instead, it uses a tactile, physicalist aesthetic inspired by ancient grimoires, dungeoneering journals, and arcane blueprints.

### 🎨 Color Palette

| Name | Hex Code | Description |
| :--- | :--- | :--- |
| **Parchment Base** | `#f9f4e8` | Primary background color (Light, warm off-white). |
| **Dragon Red** | `#8b0000` | Primary accent color for headers, buttons, and "danger" elements. |
| **Dragon Gold** | `#d4af37` | Secondary accent color for borders, highlights, and legendary items. |
| **Deep Charcoal** | `#523b23` | Primary text color (Warm brown-black) for high legibility on parchment. |
| **Dragon Dark Red**| `#5a0000` | Deepest red used for dark text variations or deep shadows. |

### 🖋️ Typography

Typography is the "soul" of this project. Use the following font pairings:

- **Display Headers**: `Cinzel`, `Cinzel Decorative` (Classic, serif, grandiose).
- **Utility Headers**: `Anton`, `Rajdhani` (Impactful, semi-condensed for data/stats).
- **Body Text**: `Crimson Text`, `STIX Two Text` (Elegant, traditional serif reading experience).
- **Technical/Mono**: `JetBrains Mono` (Clean, technical for values and logs).
- **Ancient Script**: `Elvish`, `Handjet` (Used for flavor and mysterious accents).

### 📐 Visual Layout & Texture

1. **Textures**: Always overlay components with the `bg-paper-texture` utility (defined in `index.css`). Use the `old_paper.webp` background for large surfaces.
2. **Physicality & Elevation**:
   - **Shallow**: `shadow-md border border-dragon-gold/10` (standard cards).
   - **Lifted**: `shadow-xl border-dragon-gold/30 -translate-y-0.5` (hover states).
   - **Deep**: `shadow-inner bg-parchment-200/50` (pockets, inset wells).
3. **Interactive States**:
   - **Buttons**: Use `bg-dragon-red` with `text-parchment-50`. On hover, use `brightness-110 shadow-lg`.
   - **Click Feedback**: Add `active:scale-95 transition-transform` to clickable elements for a tactile feel.
4. **Character Art**:
   - Use **Chroma Keying** (via `ChromaKeyImage` component) for portraits to eliminate backgrounds.
   - Assets should look like physical Standees or cutouts with a subtle drop shadow.

## ✨ "Arcane" Special Effects (Magic)

For legendary items, high-level spells, or "Critical" moments:
- **Gifts of the Dragon**: Use `drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]` for a golden glow.
- **Blood of the Mountain**: Use `animate-pulse-slow` with `text-dragon-red` for rhythmic, organic pulsing.
- **Glint**: Use a subtle diagonal linear gradient shimmer for "new" or "unidentified" items.

## 🤖 Art Style for AI Generators

When generating content via Gemini (Monsters, Items, NPCs):

- **Image Style**: Portraits should be high-fantasy illustration style, isolated against a solid green background (for chroma keying) or an atmospheric D&D scenario.
- **Narrative Tone**: Professional, high-fantasy wording. Avoid modern slang or meta-humor.
- **Data Structure**: Adhere strictly to the `atlasService` formats.

---
*Last updated: 2026-06-08*
