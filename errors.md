[vite] connected.
game_icons.tsx:2  GET http://localhost:3000/src/assets/icons/index.ts net::ERR_ABORTED 404 (Not Found)
site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.

PS C:\Users\japie\Downloads\arcane-ambiance> 
 *  History restored 

PS C:\Users\japie\Downloads\arcane-ambiance> npm install
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'undici@8.3.0',
npm WARN EBADENGINE   required: { node: '>=22.19.0' },
npm WARN EBADENGINE   current: { node: 'v22.18.0', npm: '10.2.3' }
npm WARN EBADENGINE }

up to date, audited 293 packages in 3s

38 packages are looking for funding
  run `npm fund` for details

4 vulnerabilities (1 moderate, 3 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
PS C:\Users\japie\Downloads\arcane-ambiance> npm audit
# npm audit report

esbuild  0.17.0 - 0.28.0
Severity: high
esbuild: Missing binary integrity verification in Deno module enables remote code execution via NPM_CONFIG_REGISTRY - https://github.com/advisories/GHSA-gv7w-rqvm-qjhr
esbuild allows arbitrary file read when running the development server on Windows - https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
fix available via `npm audit fix --force`
Will install esbuild@0.28.1, which is a breaking change
node_modules/esbuild
node_modules/tsx/node_modules/esbuild
  vite  <=8.0.3
  Depends on vulnerable versions of esbuild
  node_modules/vite

form-data  4.0.0 - 4.0.5
Severity: high
form-data: CRLF injection in form-data via unescaped multipart field names and filenames - https://github.com/advisories/GHSA-hmw2-7cc7-3qxx
fix available via `npm audit fix`
node_modules/form-data

protobufjs  <=7.6.2
Severity: moderate
protobufjs : Schema-derived names can shadow runtime-significant properties - https://github.com/advisories/GHSA-f38q-mgvj-vph7
fix available via `npm audit fix`
node_modules/protobufjs


4 vulnerabilities (1 moderate, 3 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
PS C:\Users\japie\Downloads\arcane-ambiance> npm audit fix
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'undici@8.3.0',
npm WARN EBADENGINE   required: { node: '>=22.19.0' },
npm WARN EBADENGINE   current: { node: 'v22.18.0', npm: '10.2.3' }
npm WARN EBADENGINE }

removed 1 package, changed 5 packages, and audited 292 packages in 8s

38 packages are looking for funding
  run `npm fund` for details

# npm audit report

esbuild  0.17.0 - 0.28.0
Severity: high
esbuild: Missing binary integrity verification in Deno module enables remote code execution via NPM_CONFIG_REGISTRY - https://github.com/advisories/GHSA-gv7w-rqvm-qjhr
fix available via `npm audit fix --force`
Will install esbuild@0.28.1, which is a breaking change
node_modules/esbuild
  vite  4.2.0-beta.0 - 8.0.3
  Depends on vulnerable versions of esbuild
  node_modules/vite

2 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
PS C:\Users\japie\Downloads\arcane-ambiance> npm audit fix --force
npm WARN using --force Recommended protections disabled.
npm WARN audit Updating esbuild to 0.28.1, which is a SemVer major change.
npm WARN audit Updating vite to 8.0.16, which is a SemVer major change.
npm WARN idealTree Removing dependencies.vite in favor of devDependencies.vite

added 9 packages, removed 6 packages, changed 4 packages, and audited 295 packages in 12s

39 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\japie\Downloads\arcane-ambiance> npm run dev             

> react-example@0.0.0 dev
> tsx watch server.ts

◇ injected env (11) from .env // tip: ⌘ override existing { override: true }
ElevenLabs Keys Configured: 3 accounts active.
22:05:39 [vite] (client) Re-optimizing dependencies because lockfile has changed
Server running on http://localhost:3000
[Server 2026-06-15T20:05:50.095Z] GET /api/bridge/requests hit
[Server] Reading requests from: C:\Users\japie\Downloads\arcane-ambiance\bridge\AUDIO_REQUESTS.json
[Server 2026-06-15T20:05:50.105Z] GET /api/bridge/requests hit
[Server] Reading requests from: C:\Users\japie\Downloads\arcane-ambiance\bridge\AUDIO_REQUESTS.json
PS C:\Users\japie\Downloads\arcane-ambiance> cd ..
PS C:\Users\japie\Downloads> cd .\workmap15\
PS C:\Users\japie\Downloads\workmap15> cd .\artificer-main\
PS C:\Users\japie\Downloads\workmap15\artificer-main> npm run dev         
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path C:\Users\japie\Downloads\workmap15\artificer-main\package.json
npm ERR! errno -4058
npm ERR! enoent Could not read package.json: Error: ENOENT: no such file or directory, open 'C:\Users\japie\Downloads\workmap15\artificer-main\package.json'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent 

npm ERR! A complete log of this run can be found in: C:\Users\japie\AppData\Local\npm-cache\_logs\2026-06-15T20_06_39_542Z-debug-0.log
PS C:\Users\japie\Downloads\workmap15\artificer-main> dir


    Directory: C:\Users\japie\Downloads\workmap15\artificer-main


Mode                 LastWriteTime         Length Name                                                           
----                 -------------         ------ ----                                                           
d-----         15-6-2026     21:15                artificer-main                                                 


PS C:\Users\japie\Downloads\workmap15\artificer-main> cd .\artificer-main\
PS C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main> npm install
npm WARN deprecated node-domexception@1.0.0: Use your platform's native DOMException instead

added 421 packages, and audited 422 packages in 34s

132 packages are looking for funding
  run `npm fund` for details

11 vulnerabilities (1 low, 5 moderate, 4 high, 1 critical)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
PS C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main> npm audit fix

removed 1 package, changed 34 packages, and audited 421 packages in 16s

132 packages are looking for funding
  run `npm fund` for details

# npm audit report

esbuild  0.17.0 - 0.28.0
Severity: high
esbuild: Missing binary integrity verification in Deno module enables remote code execution via NPM_CONFIG_REGISTRY - https://github.com/advisories/GHSA-gv7w-rqvm-qjhr
fix available via `npm audit fix --force`
Will install vite@8.0.16, which is a breaking change
node_modules/vite/node_modules/esbuild
  vite  4.2.0-beta.0 - 8.0.3
  Depends on vulnerable versions of esbuild
  node_modules/vite

2 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
PS C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main> npm audit fix --force
npm WARN using --force Recommended protections disabled.
npm WARN audit Updating vite to 8.0.16, which is a SemVer major change.
npm WARN idealTree Removing dependencies.vite in favor of devDependencies.vite

added 9 packages, removed 5 packages, changed 2 packages, and audited 425 packages in 4s

133 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main> npm run dev          

> react-example@0.0.0 dev
> tsx server.ts

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚡️ secrets for agents: https://dotenvx.com/as2
Server running on http://localhost:3000
22:08:33 [vite] (client) [optimizer] scanning dependencies...
22:08:39 [vite] (client) [optimizer] bundling dependencies...
22:08:55 [vite] (client) Pre-transform error: Failed to resolve import "./pouch" from "src/assets/icons/index.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/japie/Downloads/workmap15/artificer-main/artificer-main/src/assets/icons/index.ts:10:28
  8  |  import { DICE_ICONS } from "./dice";
  9  |  import { CHARACTER_ICONS } from "./character";
  10 |  import { POUCH_ICONS } from "./pouch";
     |                               ^
  11 |  import { MATERIALS_ICONS } from "./materials";
  12 |  import { WORLD_ATLAS_ICONS } from "./world_atlas";
22:08:56 [vite] Internal server error: Failed to resolve import "./pouch" from "src/assets/icons/index.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/japie/Downloads/workmap15/artificer-main/artificer-main/src/assets/icons/index.ts:10:28
  8  |  import { DICE_ICONS } from "./dice";
  9  |  import { CHARACTER_ICONS } from "./character";
  10 |  import { POUCH_ICONS } from "./pouch";
     |                               ^
  11 |  import { MATERIALS_ICONS } from "./materials";
  12 |  import { WORLD_ATLAS_ICONS } from "./world_atlas";
      at TransformPluginContext._formatLog (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30602:39)
      at TransformPluginContext.error (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30599:14)
      at normalizeUrl (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27842:18)
      at async <anonymous> (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27905:30)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27873:4)
      at async EnvironmentPluginContainer.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30387:14)
      at async loadAndTransform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24440:20)
22:11:02 [vite] Internal server error: Failed to resolve import "./pouch" from "src/assets/icons/index.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/japie/Downloads/workmap15/artificer-main/artificer-main/src/assets/icons/index.ts:10:28
  8  |  import { DICE_ICONS } from "./dice";
  9  |  import { CHARACTER_ICONS } from "./character";
  10 |  import { POUCH_ICONS } from "./pouch";
     |                               ^
  11 |  import { MATERIALS_ICONS } from "./materials";
  12 |  import { WORLD_ATLAS_ICONS } from "./world_atlas";
      at TransformPluginContext._formatLog (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30602:39)
      at TransformPluginContext.error (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30599:14)
      at normalizeUrl (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27842:18)
      at async <anonymous> (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27905:30)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27873:4)
      at async EnvironmentPluginContainer.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30387:14)
      at async loadAndTransform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24440:20) (x2)
22:11:39 [vite] (client) hmr update /src/game_icons.tsx
22:11:40 [vite] (client) Pre-transform error: Failed to resolve import "./skill_icons" from "src/assets/icons/index.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/japie/Downloads/workmap15/artificer-main/artificer-main/src/assets/icons/index.ts:14:28
  12 |  import { WORLD_ATLAS_ICONS } from "./world_atlas";
  13 |  import { ABILITY_SCORE_ICONS } from "./ability_score_icons";
  14 |  import { SKILL_ICONS } from "./skill_icons";
     |                               ^
  15 |  import { FEAT_ICONS } from "./feats";
  16 |  import { FEATURE_ICONS } from "./features";
22:11:42 [vite] Internal server error: Failed to resolve import "./pouch" from "src/assets/icons/index.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/japie/Downloads/workmap15/artificer-main/artificer-main/src/assets/icons/index.ts:10:28
  8  |  import { DICE_ICONS } from "./dice";
  9  |  import { CHARACTER_ICONS } from "./character";
  10 |  import { POUCH_ICONS } from "./pouch";
     |                               ^
  11 |  import { MATERIALS_ICONS } from "./materials";
  12 |  import { WORLD_ATLAS_ICONS } from "./world_atlas";
      at TransformPluginContext._formatLog (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30602:39)
      at TransformPluginContext.error (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30599:14)
      at normalizeUrl (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27842:18)
      at async <anonymous> (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27905:30)
      at async Promise.all (index 8)
      at async TransformPluginContext.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:27873:4)
      at async EnvironmentPluginContainer.transform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:30387:14)
      at async loadAndTransform (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\Downloads\workmap15\artificer-main\artificer-main\node_modules\vite\dist\node\chunks\node.js:24440:20)

      