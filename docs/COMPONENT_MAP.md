# Artificer Component Map

This document describes the current React component architecture under `src/components/`. It is a navigation document, not a full implementation specification. Feature-specific architecture belongs in `docs/modules/` or `docs/systems/`.

> **Maintenance rule:** when a component moves, a new major module is introduced, or responsibility changes materially, update this document in the same change.

## 📁 `core/`
Essential application-level components and providers.
- **`ArcaneCodex.tsx`**: Main application UI/container and navigation orchestration.
- **`TitleScreen.tsx`**: Initial landing screen.
- **`FirebaseProvider.tsx`**: Firebase authentication/Firestore provider.
- **`ErrorBoundary.tsx`**: UI error boundary.

## 📁 `atlas/`
Presentation components for Atlas-backed entities and data.
- **`MonsterCard.tsx`**: Monster details, actions and loot.
- **`SpellCard.tsx` / `SpellSheet.tsx`**: Spell detail presentation; `SpellSheet` is the target canonical name for the large inspection surface during the current migration.
- **`EquipmentCard.tsx`**: Equipment details.
- **`MaterialCard.tsx`**: Crafting material details.
- **`DraggableCard.tsx`**: Draggable Atlas card wrapper.

## 📁 `ui/`
Shared reusable UI and inspection components.
- **`ChromaKeyImage.tsx`**: Canvas-based chroma-key utility.
- **`FocusView.tsx`**: Global entity/item inspection overlay.
- **`PartyLogistics.tsx`**: Party status/navigation information.

## 📁 `dice/`
3D dice UI and roll presentation.
- **`DiceRollerPanel.tsx`**
- **`DiceText.tsx`**

## 📁 `character/`
Character creation, character presentation and inventory/equipment UI.
- **`CharacterCreator/`**: Coherent guided character creation workflow (`WelcomeStep`, `SlotStep`, `IdentityStep`, `SelectionStep`, `ChoicesStep`, `StatsStep`, `SpellsStep`, `EquipmentStep`, `AppearanceStep`, `BackstoryStep`, `ValidationOverlay`, `ReviewStep`, `ChoiceCard`).
- **`CreatorRightPanel.tsx`**: Creator host/context for the canonical Character Panel; should not reconstruct a second panel from individual primitives.
- **`panel/`**: Canonical reusable Character Panel presentation layer. Target sections include `CharacterPanelStats`, `CharacterPanelSkills`, `CharacterPanelTraits`, `CharacterPanelSpells`, `CharacterPanelEquipment` and `CharacterPanelBio`. The persistent Character Mirror background/body belongs to this shared presentation model.
- **`CharacterProfile.tsx`**: Character profile/screen shell consuming reusable character presentation primitives; not a second Character Panel implementation.
- **`inventory/`**: Reusable inventory workspace components (`Inventory.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `DraggableInventoryItem.tsx`, `SpellInventory.tsx`).
- **`equipment/`**: Equipment presentation components (`EquipmentDoll.tsx`, `StarterWeaponSprite.tsx`, `starterWeaponSpriteMap.ts`).
- **`CharacterPanel.tsx`**: Stable public facade/re-export for the canonical Character Panel; not an independent implementation.
- **`LevelUpOverlay.tsx`**: Level-up workflow.

## 📁 `hud/`
Runtime game HUD and player-facing gameplay views.
- **`chat/`**: AI DM chat and history.
- **`game/`**: Gameplay actions, rest and tactical UI.
- **`game/CombatGrid.tsx`**: Runtime tactical combat grid.
- **`game/Travel.tsx`**: Travel controls and progression.
- **`game/LocationMap.tsx`**: Location/sub-map rendering.
- **`game/MapLegend.tsx`**: Dynamic map legend.
- **`view/`**: First-person and NPC presentation.
- **`WorldMap.tsx`**: Interactive world map.
- **`CharacterPanel.tsx`**: Runtime host/container for the canonical character panel; it must not become a second panel implementation.
- **`journal/`**: Campaign journal, quests and bestiary.

## 📁 `minigames/`
Interactive social/chance mechanics.
- **`CoinFlip.tsx`**
- **`paperScissorRock.tsx`**

## 📁 `bookreader/`
In-game document/lore reading system.
- **`BookReader.tsx`**
- **`PageView.tsx`**
- **`BookFocus.tsx`**

## 📁 `audio/`
Audio management UI.
- **`Mixer.tsx`**: Multi-layered audio mixer.

## 📁 `devkit/`
Developer/DM authoring and testing tools. DevKit modules are not automatically runtime systems; they may author data that is later consumed by runtime modules.

- **`DevKit.tsx`**: Central DevKit shell and navigation.
- **`Jane.tsx`**: World-building/Atlas authoring tool.
- **`CombatTester.tsx`**: Tactical combat sandbox; loads canonical BattleMap authoring files via `battleMapStorage.ts` and transforms them via `battleMapToCombatGrid.ts`.
- **`BattleMapEditor/`**: Battle-map authoring module.
  - `BattleMapEditor.tsx` is the composition root.
  - Editor state, tools, rendering, geometry, commands and persistence are kept inside the module.
  - Authoring maps persist under `public/assets/atlas/combat/combat_maps/`.
  - Shared server loading and persistence live in `persistence/battleMapStorage.ts`.
  - Conversion to runtime combat state lives strictly in `persistence/battleMapToCombatGrid.ts`.
  - The editor produces authoring data; it must not become a second `CombatGrid` implementation.

### Runtime vs authoring boundary

```text
DevKit authoring
      ↓
BattleMap / authored content
      ↓
validated adapter
      ↓
runtime stores / services
      ↓
HUD components such as CombatGrid
```

The DevKit may have editor-only state, metadata, hidden content and authoring controls that should never be copied wholesale into runtime state.

## Character Panel ownership summary

```text
CreatorRightPanel ──┐
HUD CharacterPanel ──┼──> canonical Character Panel (`character/panel/`)
CharacterProfile ───┘
                         │
                         ├── Stats
                         ├── Skills
                         ├── Traits
                         ├── Spells
                         ├── Equipment
                         └── Bio
```

The canonical Character Panel keeps the persistent Character Mirror surface: full-panel background/environment, body SVG beneath the active tab, and tab content as overlays. See `docs/modules/characterPanel.md` for the authoritative design and migration plan.
