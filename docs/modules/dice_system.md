# Dice System & Chat Interface Module

## Purpose
The Dice System provides both visual (3D) and logical dice rolling capabilities within the Arcane Codex. The Chat Interface serves as a high-fidelity preview of the upcoming "AI Dungeon Master" orchestration.

## Owner
Jules Agent

## Dependencies
- `@3d-dice/dice-box`: 3D dice physics engine.
- `@3d-dice/dice-parser-interface`: Unified interface for parsing and reconciling visual roll results.
- `src/store/useStore.ts`
- `public/assets/dice-box/`: Standardized asset location for dice themes and textures.

## Architecture
### Dice System
- **DiceService (`src/dice_roller/diceService.ts`)**: Core logic provider for 3D and background rolls. Integrates `DiceParser` from `@3d-dice/dice-parser-interface` for precise result reconciliation. It uses `parser.parseNotation()` to initialize the engine before each 3D roll.
- **DiceBoxCanvas (`src/dice_roller/DiceBoxCanvas.tsx`)**: Global React component container for the dice box.
- **DiceRollOverlay (`src/dice_roller/DiceRollOverlay.tsx`)**: Parchment UI for displaying recent roll results.
- **Zustand Integration**: `rollDice3D` and `rollDice` actions in the store.

### Chat Interface
- **ChatPanel (`src/components/hud/ChatPanel.tsx`)**: Main UI with parchment-themed history and glassmorphism input.
- **Dynamic Backgrounds**: Reflects location environment and time of day.
- **Command System**: Supports `/roll` and other interactive commands.

## API
### Dice Logic (diceService.ts)
- `diceService.roll3D(notation, label, theme)`: Triggers a 3D roll with an optional theme. Standard themes are located in `public/assets/dice-box/themes/`.
- `diceService.rollBackground(notation, label)`: Logical roll without animation.

### Store Integration (useStore.ts)
- `rollDice3D(notation, label, theme)`: Triggers a 3D roll and updates the `recentRolls` state.
- `rollDice(label, modifier, dieType)`: Fallback/Background roll.

### Chat Commands
- `/roll [notation]`: Chat command to trigger rolls directly from the interface.

## Known Issues
- Browser autoplay policies can block initial sound integration.
- Mobile touch interaction for dice and chat needs optimization.

## Themes
Dice themes are loaded as textures from `public/assets/dice-box/themes/`. Each theme folder must contain a `theme.config.json` and the corresponding diffuse/normal maps. Supported themes:
- **Default**: Classic opaque dice.
- **Rust**: Weathered metallic look.
- **Smooth**: Polished, vibrant plastic.
- **Wooden**: Natural wood grain texture.

## TODO's
- [x] Implement dice themes (colors, materials).
- [ ] Integrate dice sounds with `soundService`.
- [ ] Gemini AI integration for dynamic NPC conversations.
- [ ] Context awareness for the AI (character state, lore).
- [ ] AI-driven action triggers (combat, checks).
