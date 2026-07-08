# Artificer Component Map

This document provides an overview of the React components used in the Artificer project, organized by their directory structure in `src/components/`.

## 📁 `core/`
Essential application-level components and providers.
- **`ArcaneCodex.tsx`**: The main entry point and container for the primary application UI. Handles layout, navigation mode, and global drag-and-drop context.
- **`TitleScreen.tsx`**: The initial landing screen of the application.
- **`FirebaseProvider.tsx`**: Context provider for Firebase Authentication and Firestore state.
- **`ErrorBoundary.tsx`**: A catch-all component to prevent the entire app from crashing on UI errors.

## 📁 `atlas/`
Components for visualizing data from the "Atlas" (D&D SRD and custom data).
- **`MonsterCard.tsx`**: Displays detailed stats, actions, and loot for a monster.
- **`SpellCard.tsx`**: Displays spell details including level, school, and description.
- **`EquipmentCard.tsx`**: Displays information about items, weapons, and armor.
- **`MaterialCard.tsx`**: Displays crafting materials and reagents.
- **`DraggableCard.tsx`**: A wrapper that makes any Atlas card draggable for inventory interactions.

## 📁 `ui/`
Shared, reusable UI components and utilities.
- **`ChromaKeyImage.tsx`**: Utility component that uses a Canvas to remove solid green/blue backgrounds (chroma keying) from images in real-time.
- **`FocusView.tsx`**: A global overlay for "inspecting" items or entities in detail.
- **`PartyLogistics.tsx`**: Navbar component showing group status (gold, weight, etc.).

## 📁 `dice/`
User interface components for the 3D dice system.
- **`DiceRollerPanel.tsx`**: The advanced dice tray for custom rolls.
- **`DiceText.tsx`**: Utility for rendering text with embedded dice notation as clickable roll triggers.

## 📁 `character/`
Components related to character management and the save system.
- **`CharacterCreator/`**: Multi-step wizard for building new characters.
- **`CharacterProfile.tsx`**: Detailed view of a single character's stats and features.
- **`Inventory.tsx` / `FullInventoryMenu.tsx`**: UI for managing personal and party items.
- **`EquipmentDoll.tsx`**: Visual representation of equipped items in specific slots.
- **`CharacterPanel.tsx`**: Sidebar view for quick access to character stats.
- **`LevelUpOverlay.tsx`**: UI for processing character level-ups and choices.

## 📁 `hud/`
Heads-Up Display components for the active game session.
- **`chat/`**: AI Chat interface and history.
- **`game/`**: Game-state specific views like `ActionView` and `Rest`.
- **`game/CombatGrid.tsx`**: Tactical grid overlay for turn-based combat (32x20 grid).
- **`game/Travel.tsx`**: Expedition management widget with FF/Skip logic.
- **`game/LocationMap.tsx`**: Detailed sub-map renderer using `ImageOverlay`.
- **`game/MapLegend.tsx`**: Dynamic legend that responds to map zoom tiers.
- **`view/`**: World visualization components like `FirstPersonView` and `NPCDisplay`.
- **`WorldMap.tsx`**: Interactive high-resolution tiled map system for Faerûn and Toril.
- **`journal/`**: Components for the Campaign Journal, Quest Log, and Bestiary.

## 📁 `minigames/`
Interactive social and chance-based mechanics.
- **`CoinFlip.tsx`**: 3D-rotating coin toss simulation.
- **`paperScissorRock.tsx`**: Dynamic Rock Paper Scissors arena with NPC skin-tone matching.

## 📁 `bookreader/`
Components for the in-game document/lore reading system.
- **`BookReader.tsx`**: High-fidelity book visualization with page-turning.
- **`PageView.tsx`**: Handles rendering of individual book pages.
- **`BookFocus.tsx`**: Contextual overlay when looking at a book in the world.

## 📁 `audio/`
Audio management UI.
- **`Mixer.tsx`**: Control panel for the multi-layered sound engine.

## 📁 `devkit/`
Developer-only tools for content creation and testing.
- **`DevKit.tsx`**: Main developer panel.
- **`DevKit.tsx`**: Central developer hub, grouped into Inspectors, Generators, and Testers.
- **`Jane.tsx`**: Universal World Builder supporting diverse geographic schemas and dynamic metadata.
- **`CombatTester.tsx`**: Sandbox for testing Tactical Combat Engine mechanics.
