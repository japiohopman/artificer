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
