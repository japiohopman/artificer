<<<<<<< HEAD
[plugin:vite:import-analysis] Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?

C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34

7  |  import { useUIStore } from "../../../store/useUIStore";
8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
   |                                     ^
10 |  import { GameIcon } from "../../../game_icons";
11 |  import { cn } from "../../../lib/utils";

    at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
    at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
    at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
    at async Promise.all (index 7)
    at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
    at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
    at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
    at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24

Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.ts.

    |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:16:07 [vite] (client) hmr update /src/components/hud/GameScreen.tsx, /src/index.css, /src/components/core/TitleScreen.tsx, /src/components/bookreader/BookReader.tsx, /src/components/character/SpellbookReader.tsx, /src/components/character/MonsterProfile.tsx, /src/components/core/LoadingScreen.tsx, /src/components/character/TransportProfile.tsx, /src/components/character/FullInventoryMenu.tsx, /src/components/character/CharacterCreator.tsx, /src/components/character/CharacterProfile.tsx, /src/components/character/LevelUpOverlay.tsx, /src/components/devkit/DevKit.tsx, /src/components/character/EquipmentDoll.tsx, /src/components/character/PartyInventory.tsx, /src/components/hud/Journal.tsx, /src/components/hud/WorldPanel.tsx, /src/components/character/CharacterCreator/StatsStep.tsx, /src/components/character/CharacterCreator/WelcomeStep.tsx, /src/components/dice/DiceText.tsx, /src/components/character/CharacterCreator/SkillsStep.tsx, /src/components/hud/nav/Nav.tsx, /src/components/character/CharacterCreator/SpellsStep.tsx, /src/components/character/CharacterCreator/AppearanceStep.tsx, /src/components/character/CharacterCreator/EquipmentStep.tsx, /src/components/character/CharacterCreator/ReviewStep.tsx, /src/components/character/CharacterCreator/IdentityStep.tsx, /src/components/character/CharacterCreator/BackstoryStep.tsx, /src/components/character/CharacterCreator/ChoicesStep.tsx, /src/components/character/CharacterCreator/SlotStep.tsx, /src/components/character/CharacterCreator/SelectionStep.tsx, /src/components/atlas/EquipmentCard.tsx, /src/components/devkit/equipment-image_generator.tsx, /src/components/devkit/FlagManager.tsx, /src/components/devkit/AssetExplorer.tsx, /src/components/devkit/AudioLaboratory.tsx, /src/components/devkit/Simulator.tsx, /src/components/devkit/enemy-image_generator.tsx, /src/components/devkit/material-image_generator.tsx, /src/components/devkit/WorldExplorer.tsx, /src/components/devkit/Jane.tsx, /src/components/devkit/CombatTester.tsx, /src/components/devkit/npc_tester.tsx, /src/components/audio/Mixer.tsx, /src/components/devkit/npc_generator.tsx, /src/components/character/DraggableInventoryItem.tsx, /src/components/ui/PartyLogistics.tsx, /src/components/hud/journal/QuestTab.tsx, /src/components/hud/journal/DiaryTab.tsx, /src/components/hud/journal/BestiaryTab.tsx, /src/components/hud/journal/LoreTab.tsx, /src/components/dice/DiceRollerPanel.tsx, /src/components/core/ErrorBoundary.tsx, /src/components/hud/game/ActionView.tsx, /src/components/hud/game/MapNavigation.tsx, /src/components/atlas/SpellCard.tsx, /src/components/atlas/MaterialCard.tsx, /src/components/hud/NotificationWindow.tsx, /src/components/hud/NPCDisplay.tsx, /src/components/hud/chat/ChatPanel.tsx, /src/components/atlas/MonsterCard.tsx, /src/components/hud/game/Travel.tsx, /src/components/hud/game/CombatGrid.tsx, /src/components/hud/game/MapLegend.tsx, /src/components/hud/chat/ChatHistory.tsx, /src/components/hud/game/Entrance.tsx, /src/components/hud/chat/ChatInput.tsx, /src/components/hud/game/Rest.tsx, /src/components/hud/game/Token.tsx, /src/components/hud/game/TokenActionHUD.tsx, /src/components/hud/view/NPCDisplay.tsx
00:16:09 [vite] (client) hmr update /src/components/character/CharacterCreator/SlotStep.tsx, /src/index.css
00:16:09 [vite] (client) hmr update /src/components/character/CharacterCreator/SlotStep.tsx, /src/index.css (x2)
00:16:09 [vite] (client) hmr update /src/components/core/TitleScreen.tsx, /src/index.css
00:16:09 [vite] (client) page reload src/components/devkit/audio/SoundStudio.tsx
00:16:10 [vite] (client) page reload src/components/devkit/audio/SoundStudio.tsx (x2)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x2)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x3)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x4)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x5)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x6)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x7)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x8)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x9)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x10)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x11)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x12)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x13)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x14)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x15)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x16)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x17)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x18)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x19)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x20)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x21)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x22)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x23)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x24)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x25)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x26)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x27)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x28)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x29)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x30)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x31)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x32)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x33)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x34)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x35)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x36)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x37)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x38)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x39)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x40)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x41)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x42)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x43)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x44)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x45)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x46)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x47)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x48)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x49)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x50)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x51)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x52)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x53)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x54)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x55)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x56)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x57)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x58)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x59)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x60)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x61)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x62)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x63)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x64)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x65)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x66)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x67)
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
00:16:41 [vite] (client) Pre-transform error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
00:17:03 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:17:03 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x2)
00:17:03 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x3)
00:17:03 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x4)
00:17:04 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:17:06 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 7)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:17:06 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:17:07 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:27:53 [vite] (client) hmr update /src/components/character/CharacterCreator/SlotStep.tsx, /src/index.css
00:27:53 [vite] (client) hmr update /src/components/core/TitleScreen.tsx, /src/index.css
00:27:54 [vite] (client) page reload src/components/devkit/audio/SoundStudio.tsx
00:27:57 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:28:22 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x2)
00:28:22 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => { (x3)
00:28:24 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
=======
Uncaught SyntaxError: The requested module 'http://localhost:3000/src/services/storageService.ts?t=1783724329035' doesn't provide an export named: 'getEnemyArtworkUrl' MonsterProfile.tsx:11:29


_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
>>>>>>> 82e51d92d8fb77f91314228da70f60d217587635
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:26 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:27 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 7)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:27 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
<<<<<<< HEAD
=======
00:29:21 [vite] (client) page reload errors.md
00:29:47 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:42:39 [vite] (client) page reload dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/tactical-grid-main/tactical-grid-main/README.md
00:43:45 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 7)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:45:26 [vite] (client) hmr update /src/components/core/TitleScreen.tsx, /src/index.css, /src/components/bookreader/BookReader.tsx, /src/components/character/SpellbookReader.tsx, /src/components/character/MonsterProfile.tsx, /src/components/core/LoadingScreen.tsx, /src/components/character/TransportProfile.tsx, /src/components/character/FullInventoryMenu.tsx, /src/components/character/CharacterCreator.tsx, /src/components/character/CharacterProfile.tsx, /src/components/character/LevelUpOverlay.tsx, /src/components/devkit/DevKit.tsx, /src/components/character/EquipmentDoll.tsx, /src/components/character/PartyInventory.tsx, /src/components/hud/Journal.tsx, /src/components/hud/WorldPanel.tsx, /src/components/hud/GameScreen.tsx, /src/components/character/CharacterCreator/StatsStep.tsx, /src/components/character/CharacterCreator/WelcomeStep.tsx, /src/components/dice/DiceText.tsx, /src/components/character/CharacterCreator/SkillsStep.tsx, /src/components/hud/nav/Nav.tsx, /src/components/character/CharacterCreator/SpellsStep.tsx, /src/components/character/CharacterCreator/AppearanceStep.tsx, /src/components/character/CharacterCreator/EquipmentStep.tsx, /src/components/character/CharacterCreator/ReviewStep.tsx, /src/components/character/CharacterCreator/IdentityStep.tsx, /src/components/character/CharacterCreator/BackstoryStep.tsx, /src/components/character/CharacterCreator/ChoicesStep.tsx, /src/components/character/CharacterCreator/SlotStep.tsx, /src/components/character/CharacterCreator/SelectionStep.tsx, /src/components/atlas/EquipmentCard.tsx, /src/components/devkit/equipment-image_generator.tsx, /src/components/devkit/FlagManager.tsx, /src/components/devkit/AssetExplorer.tsx, /src/components/devkit/AudioLaboratory.tsx, /src/components/devkit/Simulator.tsx, /src/components/devkit/enemy-image_generator.tsx, /src/components/devkit/material-image_generator.tsx, /src/components/devkit/WorldExplorer.tsx, /src/components/devkit/Jane.tsx, /src/components/devkit/CombatTester.tsx, /src/components/devkit/npc_tester.tsx, /src/components/audio/Mixer.tsx, /src/components/devkit/npc_generator.tsx, /src/components/character/DraggableInventoryItem.tsx, /src/components/ui/PartyLogistics.tsx, /src/components/hud/journal/QuestTab.tsx, /src/components/hud/journal/DiaryTab.tsx, /src/components/hud/journal/BestiaryTab.tsx, /src/components/hud/journal/LoreTab.tsx, /src/components/dice/DiceRollerPanel.tsx, /src/components/core/ErrorBoundary.tsx, /src/components/hud/game/ActionView.tsx, /src/components/hud/game/MapNavigation.tsx, /src/components/atlas/SpellCard.tsx, /src/components/atlas/MaterialCard.tsx, /src/components/hud/NotificationWindow.tsx, /src/components/hud/NPCDisplay.tsx, /src/components/hud/chat/ChatPanel.tsx, /src/components/atlas/MonsterCard.tsx, /src/components/hud/game/Travel.tsx, /src/components/hud/game/CombatGrid.tsx, /src/components/hud/game/MapLegend.tsx, /src/components/hud/chat/ChatHistory.tsx, /src/components/hud/game/Entrance.tsx, /src/components/hud/chat/ChatInput.tsx, /src/components/hud/game/Rest.tsx, /src/components/hud/game/Token.tsx, /src/components/hud/game/TokenActionHUD.tsx, /src/components/hud/view/NPCDisplay.tsx
00:45:27 [vite] (client) hmr update /src/components/hud/GameScreen.tsx, /src/index.css
00:45:27 [vite] (client) hmr update /src/components/hud/GameScreen.tsx, /src/index.css (x2)
00:46:13 [vite] (client) page reload dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x/README.md
01:13:09 [vite] (client) hmr update /src/game_icons.tsx, /src/index.css
01:13:09 [vite] (client) hmr update /src/components/hud/WorldMap.tsx, /src/index.css
01:13:09 [vite] (client) hmr update /src/components/hud/game/LocationMap.tsx, /src/index.css

_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:26 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:27 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 7)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:28:27 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:29:21 [vite] (client) page reload errors.md
00:29:47 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:42:39 [vite] (client) page reload dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/tactical-grid-main/tactical-grid-main/README.md
00:43:45 [vite] Internal server error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/game/LocationMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/game/LocationMap.tsx:7:34
  7  |  import { useUIStore } from "../../../store/useUIStore";
  8  |  import { useWorldStore, CategoryIcons } from "../../../store/useWorldStore";
  9  |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  10 |  import { GameIcon } from "../../../game_icons";
  11 |  import { cn } from "../../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 7)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] Internal server error: Failed to resolve import "@/public/assets/icons" from "src/components/hud/WorldMap.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/hud/WorldMap.tsx:9:34
  8  |  import { useUIStore } from "../../store/useUIStore";
  9  |  import { useWorldStore, CategoryIcons } from "../../store/useWorldStore";
  10 |  import { WORLD_ATLAS_ICONS } from "@/public/assets/icons";
     |                                     ^
  11 |  import { FogOfWar } from "./game/FogOfWar";
  12 |  import { MapNavigation } from "./game/MapNavigation";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
00:43:52 [vite] (client) Pre-transform error: Failed to resolve import "../public/assets/icons" from "src/game_icons.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/game_icons.tsx:2:26
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { ALL_ICONS } from "../public/assets/icons";
     |                             ^
  3  |  export const GAME_ICONS = ALL_ICONS;
  4  |  export const GameIcon = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
00:45:26 [vite] (client) hmr update /src/components/core/TitleScreen.tsx, /src/index.css, /src/components/bookreader/BookReader.tsx, /src/components/character/SpellbookReader.tsx, /src/components/character/MonsterProfile.tsx, /src/components/core/LoadingScreen.tsx, /src/components/character/TransportProfile.tsx, /src/components/character/FullInventoryMenu.tsx, /src/components/character/CharacterCreator.tsx, /src/components/character/CharacterProfile.tsx, /src/components/character/LevelUpOverlay.tsx, /src/components/devkit/DevKit.tsx, /src/components/character/EquipmentDoll.tsx, /src/components/character/PartyInventory.tsx, /src/components/hud/Journal.tsx, /src/components/hud/WorldPanel.tsx, /src/components/hud/GameScreen.tsx, /src/components/character/CharacterCreator/StatsStep.tsx, /src/components/character/CharacterCreator/WelcomeStep.tsx, /src/components/dice/DiceText.tsx, /src/components/character/CharacterCreator/SkillsStep.tsx, /src/components/hud/nav/Nav.tsx, /src/components/character/CharacterCreator/SpellsStep.tsx, /src/components/character/CharacterCreator/AppearanceStep.tsx, /src/components/character/CharacterCreator/EquipmentStep.tsx, /src/components/character/CharacterCreator/ReviewStep.tsx, /src/components/character/CharacterCreator/IdentityStep.tsx, /src/components/character/CharacterCreator/BackstoryStep.tsx, /src/components/character/CharacterCreator/ChoicesStep.tsx, /src/components/character/CharacterCreator/SlotStep.tsx, /src/components/character/CharacterCreator/SelectionStep.tsx, /src/components/atlas/EquipmentCard.tsx, /src/components/devkit/equipment-image_generator.tsx, /src/components/devkit/FlagManager.tsx, /src/components/devkit/AssetExplorer.tsx, /src/components/devkit/AudioLaboratory.tsx, /src/components/devkit/Simulator.tsx, /src/components/devkit/enemy-image_generator.tsx, /src/components/devkit/material-image_generator.tsx, /src/components/devkit/WorldExplorer.tsx, /src/components/devkit/Jane.tsx, /src/components/devkit/CombatTester.tsx, /src/components/devkit/npc_tester.tsx, /src/components/audio/Mixer.tsx, /src/components/devkit/npc_generator.tsx, /src/components/character/DraggableInventoryItem.tsx, /src/components/ui/PartyLogistics.tsx, /src/components/hud/journal/QuestTab.tsx, /src/components/hud/journal/DiaryTab.tsx, /src/components/hud/journal/BestiaryTab.tsx, /src/components/hud/journal/LoreTab.tsx, /src/components/dice/DiceRollerPanel.tsx, /src/components/core/ErrorBoundary.tsx, /src/components/hud/game/ActionView.tsx, /src/components/hud/game/MapNavigation.tsx, /src/components/atlas/SpellCard.tsx, /src/components/atlas/MaterialCard.tsx, /src/components/hud/NotificationWindow.tsx, /src/components/hud/NPCDisplay.tsx, /src/components/hud/chat/ChatPanel.tsx, /src/components/atlas/MonsterCard.tsx, /src/components/hud/game/Travel.tsx, /src/components/hud/game/CombatGrid.tsx, /src/components/hud/game/MapLegend.tsx, /src/components/hud/chat/ChatHistory.tsx, /src/components/hud/game/Entrance.tsx, /src/components/hud/chat/ChatInput.tsx, /src/components/hud/game/Rest.tsx, /src/components/hud/game/Token.tsx, /src/components/hud/game/TokenActionHUD.tsx, /src/components/hud/view/NPCDisplay.tsx
00:45:27 [vite] (client) hmr update /src/components/hud/GameScreen.tsx, /src/index.css
00:45:27 [vite] (client) hmr update /src/components/hud/GameScreen.tsx, /src/index.css (x2)
00:46:13 [vite] (client) page reload dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x/README.md
01:13:09 [vite] (client) hmr update /src/game_icons.tsx, /src/index.css
01:13:09 [vite] (client) hmr update /src/components/hud/WorldMap.tsx, /src/index.css
01:13:09 [vite] (client) hmr update /src/components/hud/game/LocationMap.tsx, /src/index.css
07:40:27 [vite] (client) hmr update /src/index.css


the app takes a long time to open. than errors like Uncaught SyntaxError: The requested module 'http://localhost:3000/src/services/storageService.ts?t=1783724329035' doesn't provide an export named: 'getEnemyArtworkUrl' MonsterProfile.tsx:11:29

​

>>>>>>> 82e51d92d8fb77f91314228da70f60d217587635


11-7 09:00

Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/SpellsStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/hud/EnvironmentalEngine.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/remark-gfm.js?v=fbd55e7d’ is mislukt. MonsterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/Simulator.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/StatsStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/SlotStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/zustand.js?v=d367886a’ is mislukt. useGameStore.ts
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/AssetExplorer.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/enemy-image_generator.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/equipment-image_generator.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/services/ai/imageService.ts’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/ChoicesStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/services/ai/npcService.ts’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/react.js?v=6242eb72’ is mislukt. main.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/atlas/EquipmentCard.tsx’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/IdentityStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/Jane.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/lib/firebase.ts’ is mislukt. FirebaseProvider.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/audio/Mixer.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/BackstoryStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/firebase_auth.js?v=ce18b28c’ is mislukt. FirebaseProvider.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/ui/ChromaKeyImage.tsx’ is mislukt. MonsterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/@dnd-kit_sortable.js?v=77564136’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/store/useAuthStore.ts’ is mislukt. FirebaseProvider.tsx
Laden voor de module met bron ‘http://localhost:3000/src/lib/combatUtils.ts’ is mislukt. useGameStore.ts
Laden voor de module met bron ‘http://localhost:3000/src/store/useInventoryStore.ts’ is mislukt. useWorldStore.ts
Laden voor de module met bron ‘http://localhost:3000/src/components/hud/WorldPanel.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/hud/GameScreen.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterPanel.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/hud/Journal.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/hud/nav/Nav.tsx’ is mislukt. HUD.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/@fortawesome_react-fontawesome.js?v=13ff21a5’ is mislukt. TitleScreen.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/@fortawesome_free-brands-svg-icons.js?v=994cfbfb’ is mislukt. TitleScreen.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/motion_react.js?v=a91181d3’ is mislukt. App.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/firebase_firestore.js?v=27accbd6’ is mislukt. FirebaseProvider.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/SelectionStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/Inventory.tsx’ is mislukt. FullInventoryMenu.tsx
Laden voor de module met bron ‘http://localhost:3000/src/lib/atlasUtils.ts’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/services/ai/monsterService.ts’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/lucide-react.js?v=9a634028’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/services/soundService.ts’ is mislukt. TitleScreen.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/react-markdown.js?v=eeb0018b’ is mislukt. MonsterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/character/CharacterCreator/AppearanceStep.tsx’ is mislukt. CharacterCreator.tsx
Laden voor de module met bron ‘http://localhost:3000/src/lib/currencyUtils.ts’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/@dnd-kit_utilities.js?v=f1706258’ is mislukt. CharacterProfile.tsx
Laden voor de module met bron ‘http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=8826d2f5’ is mislukt. main.tsx
Laden voor de module met bron ‘http://localhost:3000/src/components/devkit/npc_tester.tsx’ is mislukt. DevKit.tsx
Laden voor de module met bron ‘http://localhost:3000/src/lib/npcGeneratorUtils.ts’ is mislukt. DevKit.tsx
Uncaught SyntaxError: The requested module 'http://localhost:3000/src/services/storageService.ts' doesn't provide an export named: 'getEnemyArtworkUrl' MonsterProfile.tsx:11:29

​

PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev -- --force

> react-example@0.0.0 dev
> tsx server.ts --force

◇ injected env (6) from .env // tip: ⌁ auth for agents [www.vestauth.com]
Server running on http://localhost:3000
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm install           
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead

added 504 packages, and audited 505 packages in 2m

138 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm fund
react-example@0.0.0
├── https://opencollective.com/express
│   └── cors@2.8.6, express@4.22.2, http-errors@2.0.1, multer@2.2.0, content-type@2.0.0
├── https://dotenvx.com
│   └── dotenv@17.4.2
├── https://github.com/sponsors/puzrin
│   └── js-yaml@5.2.1
├── https://github.com/sponsors/ljharb
│   └── qs@6.15.3, side-channel@1.1.1, object-inspect@1.13.4, side-channel-list@1.0.1, side-channel-map@1.0.1, call-bound@1.0.4, side-channel-weakmap@1.0.2, get-intrinsic@1.3.0, function-bind@1.1.2, gopd@1.2.0, has-symbols@1.1.0, has-tostringtag@1.0.2
├─┬ https://opencollective.com/unified
│ │ └── react-markdown@10.1.0, hast-util-to-jsx-runtime@2.3.6, estree-util-is-identifier-name@3.0.0, hast-util-whitespace@3.0.0, mdast-util-mdx-expression@2.0.1, mdast-util-from-markdown@2.0.3, mdast-util-to-string@4.0.0, unist-util-stringify-position@4.0.0, mdast-util-to-markdown@2.1.2, mdast-util-phrasing@4.1.0, unist-util-is@6.0.1, mdast-util-mdx-jsx@3.2.0, mdast-util-mdxjs-esm@2.0.1, unist-util-position@5.0.0, vfile-message@4.0.3, html-url-attributes@3.0.1, mdast-util-to-hast@13.2.1, remark-parse@11.0.0, remark-rehype@11.1.2, unified@11.0.5, unist-util-visit@5.1.0, unist-util-visit-parents@6.0.2, vfile@6.0.3, rehype-raw@7.0.0, hast-util-raw@9.1.0, hast-util-from-parse5@8.0.3, hastscript@9.0.1, hast-util-parse-selector@4.0.0, vfile-location@5.0.3, hast-util-to-parse5@8.0.1, remark-gfm@4.0.1, mdast-util-gfm@3.1.0, mdast-util-gfm-autolink-literal@2.0.1, mdast-util-find-and-replace@3.0.2, mdast-util-gfm-footnote@2.1.0, mdast-util-gfm-strikethrough@2.0.0, mdast-util-gfm-table@2.0.0, mdast-util-gfm-task-list-item@2.0.0, micromark-extension-gfm@3.0.0, micromark-extension-gfm-autolink-literal@2.1.0, micromark-extension-gfm-footnote@2.1.0, micromark-extension-gfm-strikethrough@2.1.0, micromark-extension-gfm-table@2.1.1, micromark-extension-gfm-tagfilter@2.0.0, micromark-extension-gfm-task-list-item@2.1.0, remark-stringify@11.0.0
│ └── https://github.com/sponsors/wooorm
│     └── devlop@1.1.0, comma-separated-tokens@2.0.3, decode-named-character-reference@1.3.0, character-entities@2.0.2, longest-streak@3.1.0, zwitch@2.0.4, ccount@2.0.1, parse-entities@4.0.2, character-entities-legacy@3.0.0, character-reference-invalid@2.0.1, is-alphanumerical@2.0.1, is-alphabetical@2.0.1, is-decimal@2.0.1, is-hexadecimal@2.0.1, stringify-entities@4.0.4, character-entities-html4@2.1.0, property-information@7.2.0, space-separated-tokens@2.0.2, trim-lines@3.0.1, bail@2.0.2, trough@2.2.0, html-void-elements@3.0.0, web-namespaces@2.0.1, markdown-table@3.0.4
├── https://github.com/sponsors/dcastil
│   └── tailwind-merge@3.6.0
├─┬ https://opencollective.com/postcss/
│ │ └── autoprefixer@10.5.2, postcss@8.5.16
│ └── https://github.com/sponsors/rawify
│     └── fraction.js@5.3.4
├─┬ https://github.com/vitejs/vite?sponsor=1
│ │ └── vite@6.4.3
│ ├── https://github.com/sponsors/jonschlinkert
│ │   └── picomatch@4.0.5
│ └── https://github.com/sponsors/SuperchupuDev
│     └── tinyglobby@0.2.17
├── https://github.com/sponsors/feross
│   └── base64-js@1.5.1, safe-buffer@5.2.1
├─┬ https://opencollective.com/node-fetch
│ │ └── node-fetch@3.3.2
│ └── https://github.com/sponsors/jimmywarting
│     └── fetch-blob@3.2.0, node-domexception@1.0.0
├── https://opencollective.com/parcel
│   └── lightningcss@1.32.0, lightningcss-win32-x64-msvc@1.32.0
├── https://opencollective.com/webpack
│   └── tapable@2.3.3
├─┬ https://opencollective.com/babel
│ │ └── @babel/core@7.29.7
│ └── https://opencollective.com/browserslist
│     └── browserslist@4.28.4, caniuse-lite@1.0.30001802, update-browserslist-db@1.2.3
├── https://github.com/sponsors/RubenVerborgh
│   └── follow-redirects@1.16.0
└─┬ https://github.com/chalk/wrap-ansi?sponsor=1
  │ └── wrap-ansi@7.0.0
  └── https://github.com/chalk/ansi-styles?sponsor=1
      └── ansi-styles@4.3.0

PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev -- --force

> react-example@0.0.0 dev
> tsx server.ts --force

◇ injected env (6) from .env // tip: ⌘ override existing { override: true }
Server running on http://localhost:3000
Error:   Failed to scan for dependencies from entries:
  C:/Users/Gebruiker/Documents/GitHub/artificer/index.html

  X [ERROR] No matching export in "src/services/storageService.ts" for import "getEnemyArtworkUrl"

    src/components/character/MonsterProfile.tsx:11:28:
      11 │ ...t { normalizeImageUrl, getEnemyArtworkUrl } from '../../service...
         ╵                           ~~~~~~~~~~~~~~~~~~


    at failureErrorWithLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:1467:15)
    at C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:926:25
    at runOnEndCallbacks (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:1307:45)
    at buildResponseToResult (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:924:7)
    at C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:936:9
    at new Promise (<anonymous>)
    at requestCallbacks.on-end (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:935:54)
    at handleRequest (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:628:17)
    at handleIncomingPacket (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:653:7)
    at Socket.readFromStdout (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\node_modules\esbuild\lib\main.js:581:7)
    at Socket.emit (node:events:508:28)
    at addChunk (node:internal/streams/readable:559:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)
    at Readable.push (node:internal/streams/readable:390:5)
    at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
08:56:10 [vite] (client) hmr update /src/components/hud/WorldMap.tsx, /src/index.css
08:56:10 [vite] (client) hmr update /src/components/hud/game/LocationMap.tsx, /src/index.css
08:56:10 [vite] (client) page reload src/components/minigames/CoinFlip.tsx
08:56:10 [vite] (client) page reload src/components/minigames/paperScissorRock.tsx

GET
http://localhost:3000/
[HTTP/1.1 200 OK 222ms]

GET
https://fonts.googleapis.com/css2?family=Anton&family=Bitcount+Grid+Double:wght@100..900&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Bodoni+Moda+SC:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Handjet:wght,ELSH@100..900,2&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&family=Quintessential&family=STIX+Two+Text:ital,wght@0,400..700;1,400..700&display=swap
[HTTP/3 200 OK 0ms]

GET
http://localhost:3000/@vite/client
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/src/main.tsx
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/@react-refresh
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/react.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/App.tsx
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/src/index.css
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/components/core/FirebaseProvider.tsx
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/store/useCharacterStore.ts
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/store/useUIStore.ts
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/store/useGameStore.ts
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/store/useChatStore.ts
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/src/store/useWorldStore.ts
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/node_modules/vite/dist/client/env.mjs
[HTTP/1.1 304 Not Modified 14ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-F73QCPJP.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-2TUXWMP5.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

[vite] connecting... client:789:9
GET
http://localhost:3000/src/components/hud/HUD.tsx
[HTTP/1.1 304 Not Modified 193ms]

GET
http://localhost:3000/src/components/core/TitleScreen.tsx
[HTTP/1.1 304 Not Modified 179ms]

GET
http://localhost:3000/src/components/devkit/DevKit.tsx
[HTTP/1.1 304 Not Modified 180ms]

GET
http://localhost:3000/src/store/useAtlasStore.ts
[HTTP/1.1 304 Not Modified 182ms]

GET
http://localhost:3000/src/services/storageService.ts
[HTTP/1.1 304 Not Modified 183ms]

GET
http://localhost:3000/src/dice_roller/DiceBoxCanvas.tsx
[HTTP/1.1 304 Not Modified 187ms]

GET
http://localhost:3000/src/components/core/LoadingScreen.tsx
[HTTP/1.1 304 Not Modified 172ms]

GET
http://localhost:3000/node_modules/.vite/deps/motion_react.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/components/bookreader/BookReader.tsx
[HTTP/1.1 304 Not Modified 172ms]

GET
http://localhost:3000/src/components/character/SpellbookReader.tsx
[HTTP/1.1 304 Not Modified 172ms]

GET
http://localhost:3000/src/components/character/FullInventoryMenu.tsx
[HTTP/1.1 304 Not Modified 174ms]

GET
http://localhost:3000/src/components/character/CharacterProfile.tsx
[HTTP/1.1 304 Not Modified 173ms]

GET
http://localhost:3000/src/components/character/MonsterProfile.tsx
[HTTP/1.1 304 Not Modified 174ms]

GET
http://localhost:3000/src/components/character/TransportProfile.tsx
[HTTP/1.1 304 Not Modified 237ms]

GET
http://localhost:3000/src/components/character/CharacterCreator.tsx
[HTTP/1.1 304 Not Modified 66ms]

GET
http://localhost:3000/src/components/character/LevelUpOverlay.tsx
[HTTP/1.1 304 Not Modified 66ms]

GET
http://localhost:3000/src/store/useBookStore.ts
[HTTP/1.1 304 Not Modified 68ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_auth.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_firestore.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/lib/firebase.ts
[HTTP/1.1 304 Not Modified 68ms]

GET
http://localhost:3000/src/store/useAuthStore.ts
[HTTP/1.1 304 Not Modified 69ms]

GET
http://localhost:3000/node_modules/.vite/deps/zustand.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/lib/combatUtils.ts
[HTTP/1.1 304 Not Modified 24ms]

GET
http://localhost:3000/src/store/useInventoryStore.ts
[HTTP/1.1 304 Not Modified 17ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-3XYMS4SN.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
ws://localhost:24678/?token=fU4gn0OU6JKK
[HTTP/1.1 101 Switching Protocols 25ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-CXP6WFUZ.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-SKZZMX5M.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

[vite] connected. client:912:15
GET
http://localhost:3000/node_modules/.vite/deps/chunk-D2XLQKTU.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@fortawesome_react-fontawesome.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@fortawesome_free-brands-svg-icons.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/services/soundService.ts
[HTTP/1.1 304 Not Modified 34ms]

GET
http://localhost:3000/src/store/useAudioStore.ts
[HTTP/1.1 304 Not Modified 39ms]

GET
http://localhost:3000/src/game_icons.tsx
[HTTP/1.1 304 Not Modified 45ms]

GET
http://localhost:3000/src/components/hud/WorldPanel.tsx
[HTTP/1.1 304 Not Modified 41ms]

GET
http://localhost:3000/src/components/hud/GameScreen.tsx
[HTTP/1.1 304 Not Modified 37ms]

GET
http://localhost:3000/src/components/character/CharacterPanel.tsx
[HTTP/1.1 304 Not Modified 41ms]

GET
http://localhost:3000/src/components/hud/Journal.tsx
[HTTP/1.1 304 Not Modified 35ms]

GET
http://localhost:3000/src/components/hud/nav/Nav.tsx
[HTTP/1.1 304 Not Modified 38ms]

GET
http://localhost:3000/src/components/hud/EnvironmentalEngine.tsx
[HTTP/1.1 304 Not Modified 1364ms]

GET
http://localhost:3000/src/lib/utils.ts
[HTTP/1.1 304 Not Modified 1318ms]

GET
http://localhost:3000/src/components/bookreader/PageView.tsx
[HTTP/1.1 304 Not Modified 1317ms]

GET
http://localhost:3000/src/dice_roller/diceService.ts
[HTTP/1.1 304 Not Modified 1318ms]

GET
http://localhost:3000/src/services/ai/monsterService.ts
[HTTP/1.1 304 Not Modified 1292ms]

GET
http://localhost:3000/src/services/ai/itemService.ts
[HTTP/1.1 304 Not Modified 1285ms]

GET
http://localhost:3000/src/services/ai/imageService.ts
[HTTP/1.1 304 Not Modified 1240ms]

GET
http://localhost:3000/src/components/devkit/enemy-image_generator.tsx
[HTTP/1.1 304 Not Modified 1275ms]

GET
http://localhost:3000/src/components/devkit/equipment-image_generator.tsx
[HTTP/1.1 304 Not Modified 1275ms]

GET
http://localhost:3000/src/components/devkit/material-image_generator.tsx
[HTTP/1.1 304 Not Modified 1276ms]

GET
http://localhost:3000/src/services/ai/npcService.ts
[HTTP/1.1 304 Not Modified 1276ms]

GET
http://localhost:3000/src/lib/npcGeneratorUtils.ts
[HTTP/1.1 304 Not Modified 1276ms]

GET
http://localhost:3000/src/services/atlasService.ts
[HTTP/1.1 304 Not Modified 1276ms]

GET
http://localhost:3000/src/components/devkit/npc_generator.tsx
[HTTP/1.1 304 Not Modified 1346ms]

GET
http://localhost:3000/src/components/devkit/npc_tester.tsx
[HTTP/1.1 304 Not Modified 1345ms]

GET
http://localhost:3000/src/components/devkit/CombatTester.tsx
[HTTP/1.1 304 Not Modified 1356ms]

GET
http://localhost:3000/src/components/devkit/Simulator.tsx
[HTTP/1.1 304 Not Modified 1357ms]

GET
http://localhost:3000/src/components/devkit/Jane.tsx
[HTTP/1.1 304 Not Modified 1353ms]

GET
http://localhost:3000/src/components/audio/Mixer.tsx
[HTTP/1.1 304 Not Modified 1352ms]

GET
http://localhost:3000/src/components/devkit/AssetExplorer.tsx
[HTTP/1.1 304 Not Modified 1647ms]

GET
http://localhost:3000/src/components/devkit/WorldExplorer.tsx
[HTTP/1.1 304 Not Modified 1642ms]

GET
http://localhost:3000/src/components/devkit/FlagManager.tsx
[HTTP/1.1 304 Not Modified 1641ms]

GET
http://localhost:3000/src/components/devkit/AudioLaboratory.tsx
[HTTP/1.1 304 Not Modified 1632ms]

GET
http://localhost:3000/src/lib/statCalculations.ts
[HTTP/1.1 304 Not Modified 1633ms]

GET
http://localhost:3000/src/components/character/Inventory.tsx
[HTTP/1.1 304 Not Modified 1622ms]

GET
http://localhost:3000/src/components/character/PartyInventory.tsx
[HTTP/1.1 304 Not Modified 1765ms]

GET
http://localhost:3000/src/components/ui/ChromaKeyImage.tsx
[HTTP/1.1 304 Not Modified 1766ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-markdown.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/remark-gfm.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/components/dice/DiceText.tsx
[HTTP/1.1 304 Not Modified 1695ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_core.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_sortable.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_utilities.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/lucide-react.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/components/character/EquipmentDoll.tsx
[HTTP/1.1 304 Not Modified 1701ms]

GET
http://localhost:3000/src/components/atlas/EquipmentCard.tsx
[HTTP/1.1 304 Not Modified 1702ms]

GET
http://localhost:3000/src/lib/equipmentConstants.ts
[HTTP/1.1 304 Not Modified 1704ms]

GET
http://localhost:3000/src/lib/colors.ts
[HTTP/1.1 304 Not Modified 1741ms]

GET
http://localhost:3000/src/lib/atlasUtils.ts
[HTTP/1.1 304 Not Modified 1742ms]

GET
http://localhost:3000/src/lib/currencyUtils.ts
[HTTP/1.1 304 Not Modified 1742ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_app.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_storage.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/firebase-applet-config.json?import
[HTTP/1.1 304 Not Modified 1739ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/WelcomeStep.tsx
[HTTP/1.1 304 Not Modified 1739ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SelectionStep.tsx
[HTTP/1.1 304 Not Modified 1740ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SpellsStep.tsx
[HTTP/1.1 304 Not Modified 1784ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/EquipmentStep.tsx
[HTTP/1.1 304 Not Modified 1780ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/ChoicesStep.tsx
[HTTP/1.1 304 Not Modified 1780ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/StatsStep.tsx
[HTTP/1.1 304 Not Modified 1783ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SkillsStep.tsx
[HTTP/1.1 304 Not Modified 1788ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/AppearanceStep.tsx
[HTTP/1.1 304 Not Modified 1787ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/IdentityStep.tsx
[HTTP/1.1 304 Not Modified 1799ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/ReviewStep.tsx
[HTTP/1.1 304 Not Modified 1804ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SlotStep.tsx
[HTTP/1.1 304 Not Modified 1821ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/BackstoryStep.tsx
[HTTP/1.1 304 Not Modified 1824ms]

GET
http://localhost:3000/src/services/saveService.ts
[HTTP/1.1 304 Not Modified 1824ms]

GET
http://localhost:3000/src/lib/fontLoader.ts
[HTTP/1.1 304 Not Modified 1826ms]

GET
http://localhost:3000/src/lib/itemPacks.ts
[HTTP/1.1 304 Not Modified 1842ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-JO5CP42X.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-6BY3CDWF.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-WLB7R6ZN.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-GT2H5WNP.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-2GWC7C6F.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/services/audio/audioEngine.ts
[HTTP/1.1 304 Not Modified 1441ms]

GET
http://localhost:3000/src/services/audio/audioManifest.ts
[HTTP/1.1 304 Not Modified 1422ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-P6RJ62LD.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/assets/icons/index.ts
[HTTP/1.1 304 Not Modified 1264ms]

GET
http://localhost:3000/src/components/character/CharacterStats.tsx
[HTTP/1.1 304 Not Modified 1158ms]

GET
http://localhost:3000/src/components/ui/PartyLogistics.tsx
[HTTP/1.1 304 Not Modified 1158ms]

GET
http://localhost:3000/src/store/useJournalStore.ts
[HTTP/1.1 304 Not Modified 1266ms]

GET
http://localhost:3000/src/components/hud/game/Travel.tsx
[HTTP/1.1 304 Not Modified 1266ms]

GET
http://localhost:3000/src/components/dice/DiceRollerPanel.tsx
[HTTP/1.1 304 Not Modified 1267ms]

GET
http://localhost:3000/src/components/hud/WorldMap.tsx
[HTTP/1.1 304 Not Modified 1266ms]

GET
http://localhost:3000/src/components/hud/game/LocationMap.tsx
[HTTP/1.1 304 Not Modified 1261ms]

GET
http://localhost:3000/src/components/hud/NPCDisplay.tsx
[HTTP/1.1 304 Not Modified 1262ms]

GET
http://localhost:3000/src/components/hud/chat/ChatPanel.tsx
[HTTP/1.1 304 Not Modified 1266ms]

GET
http://localhost:3000/src/components/hud/NotificationWindow.tsx
[HTTP/1.1 304 Not Modified 1265ms]

GET
http://localhost:3000/src/components/hud/game/MapNavigation.tsx
[HTTP/1.1 304 Not Modified 1266ms]

GET
http://localhost:3000/src/components/atlas/DraggableCard.tsx
[HTTP/1.1 304 Not Modified 1252ms]

GET
http://localhost:3000/src/components/core/ErrorBoundary.tsx
[HTTP/1.1 304 Not Modified 1222ms]

GET
http://localhost:3000/src/components/hud/game/ActionView.tsx
[HTTP/1.1 304 Not Modified 1237ms]

GET
http://localhost:3000/src/components/hud/journal/DiaryTab.tsx
[HTTP/1.1 304 Not Modified 1250ms]

GET
http://localhost:3000/src/components/hud/journal/QuestTab.tsx
[HTTP/1.1 304 Not Modified 1250ms]

GET
http://localhost:3000/src/components/hud/journal/BestiaryTab.tsx
[HTTP/1.1 304 Not Modified 1249ms]

GET
http://localhost:3000/src/components/hud/journal/LoreTab.tsx
[HTTP/1.1 304 Not Modified 1262ms]

GET
http://localhost:3000/src/components/hud/TemporalWidget.tsx
[HTTP/1.1 304 Not Modified 1263ms]

GET
http://localhost:3000/node_modules/.vite/deps/clsx.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/tailwind-merge.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-box.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-roller-parser.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-parser-interface.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/rehype-raw.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/services/ai/config.ts
[HTTP/1.1 304 Not Modified 559ms]

GET
http://localhost:3000/src/types/inventory.ts
[HTTP/1.1 304 Not Modified 977ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-CTIQSCVC.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-5EZQ5JFA.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/lib/characterPipeline.ts
[HTTP/1.1 304 Not Modified 862ms]

GET
http://localhost:3000/src/lib/npcChoiceResolver.ts
[HTTP/1.1 304 Not Modified 860ms]

GET
http://localhost:3000/src/types/audio.ts
[HTTP/1.1 304 Not Modified 913ms]

GET
http://localhost:3000/src/data/regions.ts
[HTTP/1.1 304 Not Modified 568ms]

GET
http://localhost:3000/src/components/atlas/MonsterCard.tsx
[HTTP/1.1 304 Not Modified 736ms]

GET
http://localhost:3000/src/components/atlas/MaterialCard.tsx
[HTTP/1.1 304 Not Modified 737ms]

GET
http://localhost:3000/src/components/atlas/SpellCard.tsx
[HTTP/1.1 304 Not Modified 734ms]

GET
http://localhost:3000/src/components/character/DraggableInventoryItem.tsx
[HTTP/1.1 304 Not Modified 251ms]

GET
http://localhost:3000/src/lib/bookUtils.ts
[HTTP/1.1 304 Not Modified 170ms]

GET
http://localhost:3000/src/lib/inventoryUtils.ts
[HTTP/1.1 304 Not Modified 84ms]

GET
http://localhost:3000/src/assets/icons/ui.ts
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/assets/icons/attacks.ts
[HTTP/1.1 304 Not Modified 3ms]

GET
http://localhost:3000/src/assets/icons/equipment.ts
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/assets/icons/damage_types.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/conditions.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/creatures.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/dice.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/character.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/currency.ts
[HTTP/1.1 304 Not Modified 9ms]

GET
http://localhost:3000/src/assets/icons/materials.ts
[HTTP/1.1 304 Not Modified 5ms]

GET
http://localhost:3000/src/assets/icons/world_atlas.ts
[HTTP/1.1 304 Not Modified 9ms]

GET
http://localhost:3000/src/assets/icons/ability_score.ts
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/assets/icons/skill.ts
[HTTP/1.1 304 Not Modified 9ms]

GET
http://localhost:3000/src/assets/icons/feats.ts
[HTTP/1.1 304 Not Modified 12ms]

GET
http://localhost:3000/src/assets/icons/features.ts
[HTTP/1.1 304 Not Modified 9ms]

GET
http://localhost:3000/src/assets/icons/traits.ts
[HTTP/1.1 304 Not Modified 7ms]

GET
http://localhost:3000/src/assets/icons/magic_schools.ts
[HTTP/1.1 304 Not Modified 10ms]

GET
http://localhost:3000/src/assets/icons/actions.ts
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/assets/icons/subclasses.ts
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/assets/icons/stat_comparison.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/assets/icons/editor.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/assets/icons/musical_instruments.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/assets/icons/book_reader.ts
[HTTP/1.1 304 Not Modified 5ms]

GET
http://localhost:3000/src/assets/icons/tarot.ts
[HTTP/1.1 304 Not Modified 5ms]

GET
http://localhost:3000/src/assets/icons/equipment_doll.ts
[HTTP/1.1 304 Not Modified 7ms]

GET
http://localhost:3000/src/assets/icons/minigame.ts
[HTTP/1.1 304 Not Modified 5ms]

GET
http://localhost:3000/node_modules/.vite/deps/howler.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-leaflet.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/.vite/deps/leaflet.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/leaflet/dist/leaflet.css
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/components/hud/game/Entrance.tsx
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/services/narratorService.ts
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/components/hud/chat/ChatHistory.tsx
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/src/components/hud/chat/ChatInput.tsx
[HTTP/1.1 304 Not Modified 3ms]

GET
http://localhost:3000/src/components/hud/game/MapLegend.tsx
[HTTP/1.1 304 Not Modified 4ms]

GET
http://localhost:3000/node_modules/.vite/deps/framer-motion.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/components/hud/game/FogOfWar.tsx
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/components/hud/view/FirstPersonView.tsx
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/components/hud/game/CombatGrid.tsx
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/components/hud/game/Rest.tsx
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/services/magicService.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/lib/dataUtils.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-A2646ZNO.js?v=b4062b16
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/src/components/hud/view/NPCDisplay.tsx
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/lib/npcUtils.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/components/hud/game/Token.tsx
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/components/hud/game/TokenActionHUD.tsx
[HTTP/1.1 304 Not Modified 2ms]

GET
http://localhost:3000/src/lib/tokenActionHud.ts
[HTTP/1.1 304 Not Modified 1ms]

Uncaught SyntaxError: The requested module 'http://localhost:3000/src/services/storageService.ts' doesn't provide an export named: 'getEnemyArtworkUrl' MonsterProfile.tsx:9:10
GET
http://localhost:3000/favicon-96x96.png
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/favicon.svg
[HTTP/1.1 200 OK 0ms]

