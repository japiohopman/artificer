# ☁️ Weather System

The **Weather System** provides atmospheric immersion and mechanical challenges based on region and time.

## 🧩 Weather Simulation

### 1. Weather Types
- `Sunny`: Standard visibility and movement.
- `Cloudy`: Normal mechanics, atmospheric change.
- `Rainy`: Disadvantage on long-range attacks/Perception. Fires may be extinguished.
- `Stormy`: Dangerous travel. Risk of lightning. Severe disadvantage on spatial checks.
- `Snowy`: Difficult terrain. Cold hazards.
- `Foggy`: Heavily obscured. Navigation checks required to avoid getting lost.

### 2. Regional Patterns
Weather is not global; it is filtered by the `region` in `WorldState`.
- **The North**: Higher probability of `Snowy` and `Stormy`.
- **Sword Coast South**: Higher probability of `Rainy` and `Sunny`.
- **Underdark**: Static "Eerie Calm" or "Magic Fog" (Time-independent).

### 3. Gameplay Impact
- **Travel Speed**: Storms or Heavy Snow can reduce travel speed by 50%.
- **Combat**: Weather affects AOE spells (e.g., *Fog Cloud* is redundant in `Foggy` weather).
- **Audio**: Sunny (The Bard) layers environmental SFX based on the current weather.

## 🔄 Daily Forecast
The World State generates a new weather pattern every 24 game-hours or upon entering a new region.
