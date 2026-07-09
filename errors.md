14:57:22 [vite] Internal server error: Failed to resolve import "./audio/audioEngine" from "src/services/soundService.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/services/soundService.ts:3:28
  1  |  import { useAudioStore } from "../store/useAudioStore";
  2  |  import { audioEngine } from "./audio/audioEngine";
     |                               ^
  3  |  import { SOUND_MANIFEST } from "./audio/audioManifest";
  4  |  const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/japiohopman/artificer/main/public";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 1)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
14:57:29 [vite] Internal server error: Failed to resolve import "./AudioLaboratory" from "src/components/devkit/DevKit.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/devkit/DevKit.tsx:10:32
  9  |  import { Simulator } from "./Simulator";
  10 |  import { CombatTester } from "./CombatTester";
  11 |  import { AudioLaboratory } from "./AudioLaboratory";
     |                                   ^
  12 |  import { GameIcon } from "../../game_icons";
  13 |  import { cn } from "../../lib/utils";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 9)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
14:57:43 [vite] Internal server error: Failed to resolve import "./audio/audioEngine" from "src/services/soundService.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/services/soundService.ts:3:28
  1  |  import { useAudioStore } from "../store/useAudioStore";
  2  |  import { audioEngine } from "./audio/audioEngine";
     |                               ^
  3  |  import { SOUND_MANIFEST } from "./audio/audioManifest";
  4  |  const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/japiohopman/artificer/main/public";
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

 *  History restored 

PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Server running on http://localhost:3000
15:36:18 [vite] (client) page reload README.md
15:36:18 [vite] (client) page reload README.md (x2)
16:59:11 [vite] (client) hmr update /src/components/devkit/AudioLaboratory.tsx, /src/index.css
16:59:11 [vite] (client) page reload package.json
16:59:11 [vite] (client) page reload server.ts
16:59:11 [vite] (client) page reload server_log.txt
16:59:22 [vite] (client) Pre-transform error: Failed to resolve import "wavesurfer.js" from "src/components/devkit/audio/SoundEventEditor.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/devkit/audio/SoundEventEditor.tsx:5:23
  5  |  import { motion } from "motion/react";
  6  |  import { useHueStore } from "../../../store/useHueStore";
  7  |  import WaveSurfer from "wavesurfer.js";
     |                          ^
  8  |  import { hexToXy, xyToHex } from "./colorUtils";
  9  |  import { ColorWheel } from "./ColorWheel";
17:00:02 [vite] Internal server error: Failed to resolve import "wavesurfer.js" from "src/components/devkit/audio/SoundEventEditor.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/devkit/audio/SoundEventEditor.tsx:5:23
  5  |  import { motion } from "motion/react";
  6  |  import { useHueStore } from "../../../store/useHueStore";
  7  |  import WaveSurfer from "wavesurfer.js";
     |                          ^
  8  |  import { hexToXy, xyToHex } from "./colorUtils";
  9  |  import { ColorWheel } from "./ColorWheel";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 5)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
17:00:07 [vite] Internal server error: Failed to resolve import "wavesurfer.js" from "src/components/devkit/audio/SoundEventEditor.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/devkit/audio/SoundEventEditor.tsx:5:23
  5  |  import { motion } from "motion/react";
  6  |  import { useHueStore } from "../../../store/useHueStore";
  7  |  import WaveSurfer from "wavesurfer.js";
     |                          ^
  8  |  import { hexToXy, xyToHex } from "./colorUtils";
  9  |  import { ColorWheel } from "./ColorWheel";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 5)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24) (x2)
17:01:24 [vite] (client) page reload errors.md
17:01:50 [vite] Internal server error: Failed to resolve import "wavesurfer.js" from "src/components/devkit/audio/SoundEventEditor.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/devkit/audio/SoundEventEditor.tsx:5:23
  5  |  import { motion } from "motion/react";
  6  |  import { useHueStore } from "../../../store/useHueStore";
  7  |  import WaveSurfer from "wavesurfer.js";
     |                          ^
  8  |  import { hexToXy, xyToHex } from "./colorUtils";
  9  |  import { ColorWheel } from "./ColorWheel";
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 5)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm install  

added 65 packages, and audited 503 packages in 25s

137 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
17:03:55 [vite] (client) Re-optimizing dependencies because lockfile has changed
Server running on http://localhost:3000
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
18:36:51 [vite] .env changed, restarting server...
18:36:53 [vite] .env changed, restarting server... (x2)
18:37:06 [vite] server restarted.
19:06:22 [vite] (client) page reload server.ts
19:06:22 [vite] (client) hmr update /@fs/C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\devkit\AudioLaboratory.tsx, /src/index.css
[ElevenLabs] History fetch error: getElevenLabsKey is not defined
[ElevenLabs] History fetch error: getElevenLabsKey is not defined

in .env its like # GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY=""

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="D&D dev kid"

# GITHUB_TOKEN: Personal Access Token for committing bestiary data.
GITHUB_TOKEN=""

# GITHUB_REPO: The repository to commit to (e.g., "username/repo").
GITHUB_REPO="japiohopman/artificer"

# GITHUB_BRANCH: The branch to commit to (default: "main").
GITHUB_BRANCH="main"

# Eleven Labs API Keys (for voice and sound efx generation)
ACCOUNT_1_11LABS_KEY=""
ACCOUNT_2_11LABS_KEY=""
ACCOUNT_3_11LABS_KEY="" 