# Dice System & Chat Interface Documentation

This document outlines the current implementation of the 3D Dice system and the Chat Interface, including the libraries used, the architecture, and planned improvements.

## 1. Dice System Architecture

The dice system is integrated into the Arcane Codex to provide both visual (3D) and logical dice rolling capabilities.

### Key Components
- **`DiceService` (`src/dice_roller/diceService.ts`)**: The core logic provider. It handles the initialization of the 3D dice box, performs background rolls using a parser, and triggers 3D animations.
- **`DiceBoxCanvas` (`src/dice_roller/DiceBoxCanvas.tsx`)**: A global React component that provides the container for the `@3d-dice/dice-box` canvas. It is mounted at the top level of the application (`App.tsx`).
- **`DiceRollOverlay` (`src/dice_roller/DiceRollOverlay.tsx`)**: A notification system that displays recent dice results in a D&D-styled parchment UI.
- **Zustand Store Integration (`src/store/useStore.ts`)**:
  - `rollDice3D(notation, label)`: Triggers a 3D roll and updates the `recentRolls` state.
  - `rollDice(label, modifier, dieType)`: Fallback/Background roll that doesn't trigger 3D animations.

### Used Packages
- **[@3d-dice/dice-box](https://fantasticdice.games/docs/)**: Handles the 3D physics-based dice rendering using Babylon.js.
- **[@3d-dice/dice-roller-parser](https://github.com/3d-dice/dice-roller-parser)**: A comprehensive D&D dice notation parser that supports complex expressions (e.g., `2d20kh1 + 5`).

### 3D Assets
Assets for the dice box (models, textures, themes) are located in `public/assets/dice-box/`. This includes the `ammo/` directory for physics and `themes/` for visual customization.

---

## 2. Chat Interface

The Chat Interface is located in `src/components/hud/ChatPanel.tsx` and serves as a preview of the upcoming "AI Dungeon Master" orchestration.

### Current Features
- **UI Mockup**: A high-fidelity chat window with parchment-themed history and a glassmorphism input bar.
- **Dynamic Backgrounds**: The chat panel reflects the current location's environment and time of day (Day/Night).
- **Emotion Integration**: Simple keyword detection changes the NPC's displayed emotion.
- **Commands**:
  - `/roll [notation]`: Triggers the 3D dice system directly from chat.
- **Animal Interaction Test**: Includes logic to trigger animal communication sequences, testing the "Matrix" NPC layout system.

---

## 3. Roadmap & Planned Improvements

While the core functionality is in place, several areas are targeted for the next update:

### Dice Enhancements
- **Theming**: Implement the ability to change dice themes (colors, materials) based on character or context.
- **Sound Effects**: Integrate dice rolling and collision sounds with the `soundService`.
- **Advanced Result Parsing**: Better handling of complex notations in the results UI (e.g., showing which dice were dropped in Advantage/Disadvantage rolls).
- **Manual Interaction**: Enabling the "box controls" to allow users to interact with dice on the table.

### Chat & Orchestration
- **Gemini Integration**: Fully wire the chat input to the Gemini AI proxy for dynamic NPC conversations.
- **Context Awareness**: Pass character state, inventory, and local lore to the AI to ensure consistent roleplay.
- **Action Triggers**: Allow the AI to trigger game actions (e.g., initiating combat, giving items, requesting checks).

### Layout Refinement
- **HUD Integration**: Ensure the Chat Panel and Dice Roller work seamlessly with the rest of the HUD (Action View, NPC Display).
- **Mobile Optimization**: Improve the touch interaction for both the dice and the chat interface.
