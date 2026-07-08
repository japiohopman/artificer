PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (5) from .env // tip: ⌘ enable debugging { debug: true }
Server running on http://localhost:3000
13:17:41 [vite] (client) Pre-transform error: Failed to resolve import "howler" from "src/services/audio/audioEngine.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/services/audio/audioEngine.ts:1:21
  1  |  import { Howl } from "howler";
     |                        ^
  2  |  import { useAudioStore } from "../../store/useAudioStore";
  3  |  export class SoundInstance {
13:17:45 [vite] Internal server error: Failed to resolve import "howler" from "src/services/audio/audioEngine.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/services/audio/audioEngine.ts:1:21
  1  |  import { Howl } from "howler";
     |                        ^
  2  |  import { useAudioStore } from "../../store/useAudioStore";
  3  |  export class SoundInstance {
      at TransformPluginContext._formatLog (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42658:41)
      at TransformPluginContext.error (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42655:16)
      at normalizeUrl (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40634:23)
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async <anonymous> (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40753:37)
      at async Promise.all (index 0)
      at async TransformPluginContext.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:40680:7)
      at async EnvironmentPluginContainer.transform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:42453:18)
      at async loadAndTransform (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:35845:27)
      at async viteTransformMiddleware (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\dep-Dm0c1Wj2.js:37369:24)

      