# 📊 Audio Registry

This file tracks the status and health of all audio assets in the Artificer project. It serves as the primary reference for **Sunny** and the development team.

## 🗺️ Storage Map Summary
- `/ambient/`: Environmental loops (Environment specific).
- `/sfx/`: Event-based sound effects (Spells, UI, Action).
- `/npc_voice/`: Character dialogue and vocalizations.
- `/weather/`: Global weather layers (Rain, Thunder, Wind).

## 🎵 Asset Inventory (Manifest-Synchronized)

| Category | Asset Name | Status | Location | Version | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SFX** | fireball | Stored | `/assets/sounds/sfx/fireball.mp3` | 1.0 | Ported from sound_kit |
| **SFX** | thunderwave | Stored | `/assets/sounds/sfx/thunderwave.mp3` | 1.0 | Ported from sound_kit |
| **Weather** | weather_thunder | Stored | `/assets/sounds/weather/weather_thunder.mp3` | 1.0 | Ported from sound_kit |
| **Weather** | rain_loop | Stored | `/assets/sounds/weather/rain_loop.mp3` | 1.0 | Ported from sound_kit |
| **Ambient** | Fireball Hum | Stored | `sfx/fireball.mp3` | 1.0 | Paired with Fireball spell |
| **Ambient** | Underdark Pulse | Missing | `ambient/underdark_loop.wav` | - | Required for Underdark environment |
| **NPC Voice** | Tavern Barkeep | Missing | `npc_voice/barkeep_greet.wav` | - | High priority for Tavern encounter |

---
*Last updated by Sunny on 2026-06-08 (System Integration Update)*
