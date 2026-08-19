# Dice System Architecture

This is the single authoritative source of truth for the Artificer Dice System.

## Architecture
The system uses ONE dice runtime.
- **Service Layer**: `src/dice_roller/diceService.ts` is the single runtime authority.
- **Upstream Package**: `@3d-dice/dice-box@1.1.4` (Reference: https://fantasticdice.games/docs/intro)
- **UI Components**: UI must never instantiate DiceBox directly.
- **Render Host**: `src/dice_roller/DiceBoxCanvas.tsx`

## Initialization & Canvas Lifecycle
- The `DiceBox` canvas container must have `display: block` and non-zero dimensions at the time of initialization.
- Instead of using `display: none` to hide the dice when inactive, we use `opacity: 0` and `pointer-events: none` while keeping `display: block`. This ensures the physics viewport initializes correctly without blocking user interactions.
- The render host is mounted with `z-index: 100000` to act as an overlay above other UI, but manages `pointer-events` properly.

## Asset Root & WASM
- **Asset Root**: `public/assets/dice-box/`
- **WASM Location**: `public/assets/dice-box/ammo/ammo.wasm.wasm`
- The system exclusively uses the dependencies from `node_modules`. No upstream internals (like `WorldFacade.js`) are manually vendored.

## Result Handling & Fallback
- `DiceService` owns all result interpretation using `@3d-dice/dice-parser-interface`. 
- If WebGL or WASM initialization fails, or if a roll fails to produce results, `DiceService` seamlessly falls back to a background random number generation. The application uses `rollBackground` ensuring the game state continues without interruption.

## Character Creator API
- **4d6 Drop-Lowest**: Character Creator rolls ability scores using the `diceService.rollAbilityScore()` API.
- This invokes a physical `4d6dl1` roll (4d6 drop lowest), waits for the physics to settle, extracts the actual dice faces, and sums the top 3.
- The UI strictly consumes the result emitted by the service rather than independently generating `Math.random()` values.

## Other Game Systems
- **Point Buy**: Handled independently from the dice rolling UI in `StatsStep.tsx`.
- **Advanced Roller**: `src/components/dice/DiceRollerPanel.tsx` uses `useGameStore().rollDice3D` for advanced combinations (e.g. advantage, disadvantage) routed entirely through `DiceService`.
