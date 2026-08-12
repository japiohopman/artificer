# Dice System

## Status

**Implemented / evolving**

The dice system provides deterministic/logical dice resolution and a visual 3D dice presentation for supported UI flows.

## Responsibility

The dice domain owns dice notation parsing, roll resolution and the interface between logical results and optional visual dice presentation.

Chat is a consumer of the dice system, not part of the dice module itself.

## Architecture

```text
Feature / UI
    ↓
dice service / dice domain
    ├── logical roll
    └── optional 3D presentation
          ↓
      result / roll state
```

The exact implementation API is defined by the current TypeScript source under `src/dice_roller/` and its consumers.

## Ownership

Do not assign ownership of the module to a specific coding agent. Architecture and source code are the authority.

## Runtime behavior

The system supports the distinction between:

- **logical/background rolls** — used when a visual animation is unnecessary;
- **3D rolls** — used when the UI should present a physical dice animation.

A logical result must remain authoritative; visual dice should not independently become a second source of truth.

## Chat integration

The chat interface may invoke dice actions such as `/roll`, but chat-specific orchestration belongs to the chat/AI layer.

This separation allows dice resolution to be reused by combat, checks, generators and other systems without depending on the chat UI.

## Assets and presentation

3D dice presentation may use assets/themes under the dice-roller/public asset paths. Asset loading details should follow the current implementation rather than old documentation assumptions.

## Known limitations

The exact current limitations should be taken from the active source/tests when changing this module. Historical TODO lists should not be treated as active requirements.

## Future direction

Potential improvements include:

- stronger result metadata for checks/attacks;
- richer integration with combat/rules resolution;
- audio feedback through the existing audio system;
- improved mobile interaction;
- AI/tool-call integration through validated domain actions.

These are design directions, not claims of completed functionality.

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/systems/TACTICAL_COMBAT_ENGINE.md`
