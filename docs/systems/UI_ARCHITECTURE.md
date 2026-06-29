# Artificer UI Architecture

## Philosophy: "Layered Depth"
The Artificer UI is designed to balance deep narrative immersion (Interaction) with spatial exploration (Navigation). It uses a layered approach where different functional planes are stacked or removed based on the current focus.

## Core Layout Structures (src/components/hud/GameScreen.tsx)

### 1. The Map Plane (Bottom Layer)
- **Component**: `WorldMap`
- **Z-Index**: `z-0`
- **Visibility**: Always present. When in "Action Mode", it is dimmed and scaled slightly to provide a sense of background depth. When in "Map Mode", it is fully opaque and interactive.

### 2. The Visual Plane (Action View)
- **Component**: `ActionView`
- **Z-Index**: `z-10`
- **Behavior**: Slides **UP** to hide when switching to Map Mode. This provides a clear transition between "looking at the world" and "interacting with a scene".

### 3. The Character Plane (NPC Display)
- **Component**: `NPCDisplay`
- **Z-Index**: `z-20`
- **Behavior**: Slides **UP** from the bottom staging area when an NPC is present and chat is expanded. It sits between the visuals and the chat interface.

### 4. The Narrative Plane (Chat & Notifications)
- **Notification Window**: Stationary at the top (`z-200`), providing constant system feedback.
- **Chat Panel**: Anchored to the bottom (`z-40`). It consists of a fixed input bar and a history area that expands **UPWARDS** when toggled.

### 5. Higher Priority Overlays
- **Simulator Cards**: `z-100`. Interactive entity cards.
- **Party Logistics**: `z-7000`. Full-screen tactical manifest modal.

## Navigation vs. Interaction Modes
Controlled by the `chatExpanded` state in `useStore`:

- **Interaction Mode (`chatExpanded: true`)**:
  - `ActionView` slides down to `y: 0`.
  - `NPCDisplay` is visible.
  - `ChatPanel` history is expanded.
  - `WorldMap` is dimmed/blurred.
- **Map Focus Mode (`chatExpanded: false`)**:
  - `ActionView` slides up to `y: -1000`.
  - `NPCDisplay` is hidden.
  - `ChatPanel` history is collapsed.
  - `WorldMap` is fully active.

## Implementation Guidelines
- **Maintain Layer Independence**: Components should not be nested in a single flex column that changes height; instead, they should be absolute layers that animate independently to avoid "choppy" layout shifts.
- **Respect `pointer-events`**: The main staging area uses `pointer-events-none` to allow map interaction through the layers, while individual interactive components use `pointer-events-auto`.

## Historical Context
In the Phase 2 refactor, the "Interaction Shard" (a consolidated flex column) was abandoned in favor of this layered approach to resolve animation choppiness and restore the sense of depth between the game world (Map) and the narrative scene (ActionView).
