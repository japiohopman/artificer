# Dice Rolling Integration & Ability Score Workflows

## Overview

The D&D Character Creator and Tactical Engine utilize standard 3D dice rolling notation (`4d6`, `1d20`, `d10`, etc.) backed by Fantastic Dice (`https://fantasticdice.games/docs/intro`) visual rendering and integrated audio cues (`soundService`).

---

## Supported Ability Score Generation Modes

1. **Standard Array**
   - Fixed pool of canonical scores: `[15, 14, 13, 12, 10, 8]`.
   - Players assign scores sequentially to the 6 core attributes (STR, DEX, CON, INT, WIS, CHA).

2. **Point Buy (27 Point Budget)**
   - All attributes initialize at score `8`.
   - 27 points budget to allocate across attributes up to a max score of `15`.
   - Point costs:
     - Scores 8–13: 1 point per score increase.
     - Scores 14–15: 2 points per score increase.

3. **4d6 Drop Lowest Rolling**
   - Each attribute features an individual `[ROLL 4d6]` action control as well as a "Roll All 6 Attributes" option.
   - For each roll:
     1. Four six-sided dice (`4d6`) are rolled.
     2. The single lowest die is discarded (e.g., `6, 5, 3, 1` -> remove `1`).
     3. The top 3 dice are summed (`6 + 5 + 3 = 14`).
     4. The result is assigned to the target attribute.

---

## Audio & Visual Integration

- **Visual Rendering:** Uses Fantastic Dice 3D canvas and Framer Motion animation triggers.
- **Audio Integration:** Triggers `soundService.playEffect('DICE_ROLL')` on action execution.
- **Fallback Behavior:** If WebGL or 3D canvas rendering is unavailable, rolls seamlessly fallback to RNG calculation while maintaining exact dice rules.
