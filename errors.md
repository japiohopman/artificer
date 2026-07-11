PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

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
08:42:03 [vite] (client) hmr update /src/components/hud/WorldMap.tsx, /src/index.css
08:42:03 [vite] (client) hmr update /src/components/hud/game/LocationMap.tsx, /src/index.css
08:42:03 [vite] (client) page reload src/components/minigames/CoinFlip.tsx
08:42:04 [vite] (client) page reload src/components/minigames/paperScissorRock.tsx
08:42:41 [vite] (client) page reload server_log.txt
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
08:58:24 [vite] (client) page reload errors.md
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev -- --force
   
> react-example@0.0.0 dev
> tsx server.ts --force

◇ injected env (6) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Server running on http://localhost:3000
09:35:35 [vite] (client) page reload errors.md
PS C:\Users\Gebruiker\Documents\GitHub\artificer> rm -rf node_modules/.vite
Remove-Item : A parameter cannot be found that matches parameter name 'rf'.
At line:1 char:4
+ rm -rf node_modules/.vite
+    ~~~
    + CategoryInfo          : InvalidArgument: (:) [Remove-Item], ParameterBindingException
    + FullyQualifiedErrorId : NamedParameterNotFound,Microsoft.PowerShell.Commands.RemoveItemCommand
 
PS C:\Users\Gebruiker\Documents\GitHub\artificer> rm  node_modules/.vite   

Confirm
The item at C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\.vite has children and the 
Recurse parameter was not specified. If you continue, all children will be removed with the item. Are 
you sure you want to continue?
[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): a
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev -- --force   

> react-example@0.0.0 dev
> tsx server.ts --force

◇ injected env (6) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
[Server] Force flag detected. Instructing Vite to rebuild dependency cache...
10:01:39 [vite] (client) Forced re-optimization of dependencies
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

    GET
http://localhost:3000/
[HTTP/1.1 200 OK 4880ms]

GET
https://fonts.googleapis.com/css2?family=Anton&family=Bitcount+Grid+Double:wght@100..900&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Bodoni+Moda+SC:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Handjet:wght,ELSH@100..900,2&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&family=Quintessential&family=STIX+Two+Text:ital,wght@0,400..700;1,400..700&display=swap
[HTTP/2 200 OK 0ms]

GET
http://localhost:3000/@vite/client
[HTTP/1.1 200 OK 4182ms]

GET
http://localhost:3000/src/main.tsx
[HTTP/1.1 200 OK 54013ms]

GET
http://localhost:3000/@react-refresh
[HTTP/1.1 304 Not Modified 3869ms]

GET
http://localhost:3000/favicon-96x96.png
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/favicon.svg
[HTTP/1.1 200 OK 0ms]

GET
http://localhost:3000/node_modules/vite/dist/client/env.mjs
[HTTP/1.1 304 Not Modified 1985ms]

[vite] connecting... client:789:9
GET
ws://localhost:24678/?token=hC_MEuaz01ec
[HTTP/1.1 101 Switching Protocols 383ms]

[vite] connected. client:912:15
GET
http://localhost:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=09f3655f
[HTTP/1.1 200 OK 11826ms]

GET
http://localhost:3000/node_modules/.vite/deps/react.js?v=09f3655f
[HTTP/1.1 200 OK 11791ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ced8b07b
[HTTP/1.1 200 OK 12511ms]

GET
http://localhost:3000/src/App.tsx
[HTTP/1.1 200 OK 493ms]

GET
http://localhost:3000/src/index.css
[HTTP/1.1 304 Not Modified 5527ms]

GET
http://localhost:3000/src/components/core/FirebaseProvider.tsx
[HTTP/1.1 200 OK 497ms]

GET
http://localhost:3000/src/store/useCharacterStore.ts
[HTTP/1.1 200 OK 555ms]

GET
http://localhost:3000/src/store/useUIStore.ts
[HTTP/1.1 200 OK 566ms]

GET
http://localhost:3000/src/store/useGameStore.ts
[HTTP/1.1 200 OK 566ms]

GET
http://localhost:3000/src/store/useChatStore.ts
[HTTP/1.1 200 OK 566ms]

GET
http://localhost:3000/src/store/useWorldStore.ts
[HTTP/1.1 200 OK 577ms]

GET
http://localhost:3000/src/components/hud/HUD.tsx
[HTTP/1.1 200 OK 31ms]

GET
http://localhost:3000/src/components/core/TitleScreen.tsx
[HTTP/1.1 200 OK 25ms]

GET
http://localhost:3000/src/components/devkit/DevKit.tsx
[HTTP/1.1 200 OK 25ms]

GET
http://localhost:3000/src/store/useAtlasStore.ts
[HTTP/1.1 200 OK 27ms]

GET
http://localhost:3000/src/services/storageService.ts
[HTTP/1.1 304 Not Modified 26ms]

GET
http://localhost:3000/src/dice_roller/DiceBoxCanvas.tsx
[HTTP/1.1 200 OK 38ms]

GET
http://localhost:3000/src/components/core/LoadingScreen.tsx
[HTTP/1.1 200 OK 42ms]

GET
http://localhost:3000/node_modules/.vite/deps/motion_react.js?v=8edee78d
[HTTP/1.1 200 OK 11085ms]

GET
http://localhost:3000/src/components/bookreader/BookReader.tsx
[HTTP/1.1 200 OK 112ms]

GET
http://localhost:3000/src/components/character/SpellbookReader.tsx
[HTTP/1.1 200 OK 115ms]

GET
http://localhost:3000/src/components/character/FullInventoryMenu.tsx
[HTTP/1.1 200 OK 115ms]

GET
http://localhost:3000/src/components/character/CharacterProfile.tsx
[HTTP/1.1 200 OK 128ms]

GET
http://localhost:3000/src/components/character/MonsterProfile.tsx
[HTTP/1.1 200 OK 134ms]

GET
http://localhost:3000/src/components/character/TransportProfile.tsx
[HTTP/1.1 200 OK 137ms]

GET
http://localhost:3000/src/components/character/CharacterCreator.tsx
[HTTP/1.1 200 OK 142ms]

GET
http://localhost:3000/src/components/character/LevelUpOverlay.tsx
[HTTP/1.1 200 OK 147ms]

GET
http://localhost:3000/src/store/useBookStore.ts
[HTTP/1.1 200 OK 148ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_auth.js?v=3158106f
[HTTP/1.1 200 OK 10999ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_firestore.js?v=7a64e8a4
[HTTP/1.1 200 OK 13618ms]

GET
http://localhost:3000/src/lib/firebase.ts
[HTTP/1.1 200 OK 11965ms]

GET
http://localhost:3000/src/store/useAuthStore.ts
[HTTP/1.1 200 OK 11982ms]

GET
http://localhost:3000/node_modules/.vite/deps/zustand.js?v=c089e841
[HTTP/1.1 200 OK 11756ms]

GET
http://localhost:3000/src/lib/combatUtils.ts
[HTTP/1.1 304 Not Modified 11757ms]

GET
http://localhost:3000/src/store/useInventoryStore.ts
[HTTP/1.1 200 OK 11893ms]

GET
http://localhost:3000/src/components/hud/WorldPanel.tsx
[HTTP/1.1 200 OK 11718ms]

GET
http://localhost:3000/src/components/hud/GameScreen.tsx
[HTTP/1.1 200 OK 11792ms]

GET
http://localhost:3000/src/components/character/CharacterPanel.tsx
[HTTP/1.1 200 OK 11779ms]

GET
http://localhost:3000/src/components/hud/Journal.tsx
[HTTP/1.1 200 OK 11749ms]

GET
http://localhost:3000/src/components/hud/nav/Nav.tsx
[HTTP/1.1 200 OK 11872ms]

GET
http://localhost:3000/src/components/hud/EnvironmentalEngine.tsx
[HTTP/1.1 200 OK 11997ms]

GET
http://localhost:3000/node_modules/.vite/deps/@fortawesome_react-fontawesome.js?v=6986f480
[HTTP/1.1 200 OK 11976ms]

GET
http://localhost:3000/node_modules/.vite/deps/@fortawesome_free-brands-svg-icons.js?v=96b74ecc
[HTTP/1.1 200 OK 11975ms]

GET
http://localhost:3000/src/services/soundService.ts
[HTTP/1.1 304 Not Modified 11975ms]

GET
http://localhost:3000/src/store/useAudioStore.ts
[HTTP/1.1 200 OK 12106ms]

GET
http://localhost:3000/src/game_icons.tsx
[HTTP/1.1 200 OK 12097ms]

GET
http://localhost:3000/src/services/ai/monsterService.ts
[HTTP/1.1 304 Not Modified 11930ms]

GET
http://localhost:3000/src/services/ai/itemService.ts
[HTTP/1.1 304 Not Modified 11930ms]

GET
http://localhost:3000/src/services/ai/imageService.ts
[HTTP/1.1 304 Not Modified 11930ms]

GET
http://localhost:3000/src/components/devkit/enemy-image_generator.tsx
[HTTP/1.1 200 OK 11995ms]

GET
http://localhost:3000/src/components/devkit/equipment-image_generator.tsx
[HTTP/1.1 200 OK 12139ms]

GET
http://localhost:3000/src/components/devkit/material-image_generator.tsx
[HTTP/1.1 200 OK 12172ms]

GET
http://localhost:3000/src/services/ai/npcService.ts
[HTTP/1.1 304 Not Modified 12187ms]

GET
http://localhost:3000/src/lib/npcGeneratorUtils.ts
[HTTP/1.1 304 Not Modified 12187ms]

GET
http://localhost:3000/src/services/atlasService.ts
[HTTP/1.1 304 Not Modified 12192ms]

GET
http://localhost:3000/src/components/devkit/npc_generator.tsx
[HTTP/1.1 200 OK 12355ms]

GET
http://localhost:3000/src/components/devkit/npc_tester.tsx
[HTTP/1.1 200 OK 12357ms]

GET
http://localhost:3000/src/components/devkit/CombatTester.tsx
[HTTP/1.1 200 OK 12358ms]

GET
http://localhost:3000/src/components/devkit/Simulator.tsx
[HTTP/1.1 200 OK 12362ms]

GET
http://localhost:3000/src/components/devkit/Jane.tsx
[HTTP/1.1 200 OK 12370ms]

GET
http://localhost:3000/src/components/audio/Mixer.tsx
[HTTP/1.1 200 OK 12379ms]

GET
http://localhost:3000/src/components/devkit/AssetExplorer.tsx
[HTTP/1.1 200 OK 12383ms]

GET
http://localhost:3000/src/components/devkit/WorldExplorer.tsx
[HTTP/1.1 200 OK 12383ms]

GET
http://localhost:3000/src/components/devkit/FlagManager.tsx
[HTTP/1.1 200 OK 12382ms]

GET
http://localhost:3000/src/components/devkit/AudioLaboratory.tsx
[HTTP/1.1 200 OK 12389ms]

GET
http://localhost:3000/src/dice_roller/diceService.ts
[HTTP/1.1 200 OK 12390ms]

GET
http://localhost:3000/src/lib/utils.ts
[HTTP/1.1 200 OK 12391ms]

GET
http://localhost:3000/src/components/bookreader/PageView.tsx
[HTTP/1.1 200 OK 12432ms]

GET
http://localhost:3000/src/lib/statCalculations.ts
[HTTP/1.1 304 Not Modified 12386ms]

GET
http://localhost:3000/src/components/character/Inventory.tsx
[HTTP/1.1 200 OK 12365ms]

GET
http://localhost:3000/src/components/character/PartyInventory.tsx
[HTTP/1.1 200 OK 12364ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_core.js?v=f655970e
[HTTP/1.1 200 OK 12364ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_sortable.js?v=96410850
[HTTP/1.1 200 OK 12369ms]

GET
http://localhost:3000/node_modules/.vite/deps/@dnd-kit_utilities.js?v=381d4584
[HTTP/1.1 200 OK 12373ms]

GET
http://localhost:3000/node_modules/.vite/deps/lucide-react.js?v=1653152c
[HTTP/1.1 200 OK 12834ms]

GET
http://localhost:3000/src/components/character/EquipmentDoll.tsx
[HTTP/1.1 200 OK 12383ms]

GET
http://localhost:3000/src/components/atlas/EquipmentCard.tsx
[HTTP/1.1 200 OK 12385ms]

GET
http://localhost:3000/src/lib/equipmentConstants.ts
[HTTP/1.1 200 OK 12387ms]

GET
http://localhost:3000/src/components/ui/ChromaKeyImage.tsx
[HTTP/1.1 200 OK 12388ms]

GET
http://localhost:3000/src/lib/colors.ts
[HTTP/1.1 304 Not Modified 12387ms]

GET
http://localhost:3000/src/lib/atlasUtils.ts
[HTTP/1.1 304 Not Modified 12388ms]

GET
http://localhost:3000/src/lib/currencyUtils.ts
[HTTP/1.1 304 Not Modified 12390ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-markdown.js?v=9d4e843b
[HTTP/1.1 200 OK 12391ms]

GET
http://localhost:3000/node_modules/.vite/deps/remark-gfm.js?v=5c90e40e
[HTTP/1.1 200 OK 12392ms]

GET
http://localhost:3000/src/components/dice/DiceText.tsx
[HTTP/1.1 200 OK 12392ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/WelcomeStep.tsx
[HTTP/1.1 200 OK 12397ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SelectionStep.tsx
[HTTP/1.1 200 OK 12400ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SpellsStep.tsx
[HTTP/1.1 200 OK 12401ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/EquipmentStep.tsx
[HTTP/1.1 200 OK 12404ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/ChoicesStep.tsx
[HTTP/1.1 200 OK 12407ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/StatsStep.tsx
[HTTP/1.1 200 OK 12405ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SkillsStep.tsx
[HTTP/1.1 200 OK 12406ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/AppearanceStep.tsx
[HTTP/1.1 200 OK 12407ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/IdentityStep.tsx
[HTTP/1.1 200 OK 12410ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/ReviewStep.tsx
[HTTP/1.1 200 OK 12267ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/SlotStep.tsx
[HTTP/1.1 200 OK 12251ms]

GET
http://localhost:3000/src/components/character/CharacterCreator/BackstoryStep.tsx
[HTTP/1.1 200 OK 12252ms]

GET
http://localhost:3000/src/services/saveService.ts
[HTTP/1.1 304 Not Modified 12239ms]

GET
http://localhost:3000/src/lib/fontLoader.ts
[HTTP/1.1 304 Not Modified 12238ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-F73QCPJP.js?v=cfdd55cd
[HTTP/1.1 200 OK 2157ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-2TUXWMP5.js?v=cfdd55cd
[HTTP/1.1 200 OK 2164ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-D2XLQKTU.js?v=cfdd55cd
[HTTP/1.1 200 OK 2167ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-CXP6WFUZ.js?v=cfdd55cd
[HTTP/1.1 200 OK 2042ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-SKZZMX5M.js?v=cfdd55cd
[HTTP/1.1 200 OK 2030ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-3XYMS4SN.js?v=cfdd55cd
[HTTP/1.1 200 OK 1525ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_app.js?v=c2df9095
[HTTP/1.1 200 OK 1324ms]

GET
http://localhost:3000/node_modules/.vite/deps/firebase_storage.js?v=2802d749
[HTTP/1.1 200 OK 1119ms]

GET
http://localhost:3000/firebase-applet-config.json?import
[HTTP/1.1 304 Not Modified 1053ms]

GET
http://localhost:3000/src/lib/itemPacks.ts
[HTTP/1.1 304 Not Modified 1057ms]

GET
http://localhost:3000/src/store/useJournalStore.ts
[HTTP/1.1 200 OK 913ms]

GET
http://localhost:3000/src/components/hud/game/Travel.tsx
[HTTP/1.1 200 OK 915ms]

GET
http://localhost:3000/src/components/dice/DiceRollerPanel.tsx
[HTTP/1.1 200 OK 915ms]

GET
http://localhost:3000/src/components/hud/WorldMap.tsx
[HTTP/1.1 200 OK 832ms]

GET
http://localhost:3000/src/components/hud/game/LocationMap.tsx
[HTTP/1.1 200 OK 501ms]

GET
http://localhost:3000/src/components/hud/NPCDisplay.tsx
[HTTP/1.1 200 OK 396ms]

GET
http://localhost:3000/src/components/hud/chat/ChatPanel.tsx
[HTTP/1.1 200 OK 394ms]

GET
http://localhost:3000/src/components/hud/NotificationWindow.tsx
[HTTP/1.1 200 OK 394ms]

GET
http://localhost:3000/src/components/hud/game/MapNavigation.tsx
[HTTP/1.1 200 OK 396ms]

GET
http://localhost:3000/src/components/atlas/DraggableCard.tsx
[HTTP/1.1 200 OK 397ms]

GET
http://localhost:3000/src/components/core/ErrorBoundary.tsx
[HTTP/1.1 200 OK 397ms]

GET
http://localhost:3000/src/components/hud/game/ActionView.tsx
[HTTP/1.1 200 OK 397ms]

GET
http://localhost:3000/src/components/hud/journal/DiaryTab.tsx
[HTTP/1.1 200 OK 398ms]

GET
http://localhost:3000/src/components/hud/journal/QuestTab.tsx
[HTTP/1.1 200 OK 398ms]

GET
http://localhost:3000/src/components/hud/journal/BestiaryTab.tsx
[HTTP/1.1 200 OK 399ms]

GET
http://localhost:3000/src/components/hud/journal/LoreTab.tsx
[HTTP/1.1 200 OK 399ms]

GET
http://localhost:3000/src/components/character/CharacterStats.tsx
[HTTP/1.1 200 OK 404ms]

GET
http://localhost:3000/src/components/ui/PartyLogistics.tsx
[HTTP/1.1 200 OK 395ms]

GET
http://localhost:3000/src/components/hud/TemporalWidget.tsx
[HTTP/1.1 200 OK 397ms]

GET
http://localhost:3000/src/assets/icons/index.ts
[HTTP/1.1 304 Not Modified 25ms]

GET
http://localhost:3000/src/services/audio/audioEngine.ts
[HTTP/1.1 200 OK 24ms]

GET
http://localhost:3000/src/services/audio/audioManifest.ts
[HTTP/1.1 304 Not Modified 24ms]

GET
http://localhost:3000/src/services/ai/config.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/src/types/inventory.ts
[HTTP/1.1 304 Not Modified 292ms]

GET
http://localhost:3000/src/lib/characterPipeline.ts
[HTTP/1.1 304 Not Modified 177ms]

GET
http://localhost:3000/src/lib/npcChoiceResolver.ts
[HTTP/1.1 304 Not Modified 178ms]

GET
http://localhost:3000/src/types/audio.ts
[HTTP/1.1 304 Not Modified 121ms]

GET
http://localhost:3000/src/components/atlas/MonsterCard.tsx
[HTTP/1.1 200 OK 126ms]

GET
http://localhost:3000/src/components/atlas/MaterialCard.tsx
[HTTP/1.1 200 OK 127ms]

GET
http://localhost:3000/src/components/atlas/SpellCard.tsx
[HTTP/1.1 200 OK 14ms]

GET
http://localhost:3000/src/data/regions.ts
[HTTP/1.1 304 Not Modified 11ms]

GET
http://localhost:3000/node_modules/.vite/deps/clsx.js?v=84aad729
[HTTP/1.1 200 OK 11ms]

GET
http://localhost:3000/node_modules/.vite/deps/tailwind-merge.js?v=66444f7c
[HTTP/1.1 200 OK 13ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-JO5CP42X.js?v=cfdd55cd
[HTTP/1.1 200 OK 11ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-box.js?v=19d49882
[HTTP/1.1 200 OK 6ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-roller-parser.js?v=0b81f742
[HTTP/1.1 200 OK 7ms]

GET
http://localhost:3000/node_modules/.vite/deps/@3d-dice_dice-parser-interface.js?v=7327d7b8
[HTTP/1.1 200 OK 7ms]

GET
http://localhost:3000/node_modules/.vite/deps/rehype-raw.js?v=b443a159
[HTTP/1.1 200 OK 68ms]

GET
http://localhost:3000/src/components/character/DraggableInventoryItem.tsx
[HTTP/1.1 200 OK 68ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-6BY3CDWF.js?v=cfdd55cd
[HTTP/1.1 200 OK 69ms]

GET
http://localhost:3000/src/lib/bookUtils.ts
[HTTP/1.1 304 Not Modified 414ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-P6RJ62LD.js?v=cfdd55cd
[HTTP/1.1 200 OK 282ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-GT2H5WNP.js?v=cfdd55cd
[HTTP/1.1 200 OK 294ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-2GWC7C6F.js?v=cfdd55cd
[HTTP/1.1 200 OK 282ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-WLB7R6ZN.js?v=cfdd55cd
[HTTP/1.1 200 OK 295ms]

GET
http://localhost:3000/src/lib/inventoryUtils.ts
[HTTP/1.1 304 Not Modified 296ms]

GET
http://localhost:3000/node_modules/.vite/deps/react-leaflet.js?v=eeb285de
[HTTP/1.1 200 OK 271ms]

GET
http://localhost:3000/node_modules/leaflet/dist/leaflet.css
[HTTP/1.1 304 Not Modified 271ms]

GET
http://localhost:3000/node_modules/.vite/deps/leaflet.js?v=d93a050b
[HTTP/1.1 200 OK 272ms]

GET
http://localhost:3000/src/components/hud/game/FogOfWar.tsx
[HTTP/1.1 200 OK 274ms]

GET
http://localhost:3000/src/components/hud/game/Entrance.tsx
[HTTP/1.1 200 OK 275ms]

GET
http://localhost:3000/src/services/narratorService.ts
[HTTP/1.1 304 Not Modified 278ms]

GET
http://localhost:3000/src/components/hud/chat/ChatHistory.tsx
[HTTP/1.1 200 OK 293ms]

GET
http://localhost:3000/src/components/hud/chat/ChatInput.tsx
[HTTP/1.1 200 OK 294ms]

GET
http://localhost:3000/src/components/hud/game/MapLegend.tsx
[HTTP/1.1 200 OK 295ms]

GET
http://localhost:3000/node_modules/.vite/deps/framer-motion.js?v=5deb3cd6
[HTTP/1.1 200 OK 311ms]

GET
http://localhost:3000/src/components/hud/view/FirstPersonView.tsx
[HTTP/1.1 200 OK 312ms]

GET
http://localhost:3000/src/components/hud/game/CombatGrid.tsx
[HTTP/1.1 200 OK 315ms]

GET
http://localhost:3000/src/components/hud/game/Rest.tsx
[HTTP/1.1 200 OK 325ms]

GET
http://localhost:3000/node_modules/.vite/deps/howler.js?v=30b5f192
[HTTP/1.1 200 OK 313ms]

GET
http://localhost:3000/src/assets/icons/ui.ts
[HTTP/1.1 304 Not Modified 310ms]

GET
http://localhost:3000/src/assets/icons/attacks.ts
[HTTP/1.1 304 Not Modified 310ms]

GET
http://localhost:3000/src/assets/icons/equipment.ts
[HTTP/1.1 304 Not Modified 311ms]

GET
http://localhost:3000/src/assets/icons/damage_types.ts
[HTTP/1.1 304 Not Modified 311ms]

GET
http://localhost:3000/src/assets/icons/conditions.ts
[HTTP/1.1 304 Not Modified 314ms]

GET
http://localhost:3000/src/assets/icons/creatures.ts
[HTTP/1.1 304 Not Modified 314ms]

GET
http://localhost:3000/src/assets/icons/dice.ts
[HTTP/1.1 304 Not Modified 315ms]

GET
http://localhost:3000/src/assets/icons/character.ts
[HTTP/1.1 304 Not Modified 315ms]

GET
http://localhost:3000/src/assets/icons/currency.ts
[HTTP/1.1 304 Not Modified 313ms]

GET
http://localhost:3000/src/assets/icons/materials.ts
[HTTP/1.1 304 Not Modified 310ms]

GET
http://localhost:3000/src/assets/icons/world_atlas.ts
[HTTP/1.1 304 Not Modified 313ms]

GET
http://localhost:3000/src/assets/icons/ability_score.ts
[HTTP/1.1 304 Not Modified 314ms]

GET
http://localhost:3000/src/assets/icons/skill.ts
[HTTP/1.1 304 Not Modified 311ms]

GET
http://localhost:3000/src/assets/icons/feats.ts
[HTTP/1.1 304 Not Modified 307ms]

GET
http://localhost:3000/src/assets/icons/features.ts
[HTTP/1.1 304 Not Modified 307ms]

GET
http://localhost:3000/src/assets/icons/traits.ts
[HTTP/1.1 304 Not Modified 307ms]

GET
http://localhost:3000/src/assets/icons/magic_schools.ts
[HTTP/1.1 304 Not Modified 318ms]

GET
http://localhost:3000/src/assets/icons/actions.ts
[HTTP/1.1 304 Not Modified 320ms]

GET
http://localhost:3000/src/assets/icons/subclasses.ts
[HTTP/1.1 304 Not Modified 319ms]

GET
http://localhost:3000/src/assets/icons/stat_comparison.ts
[HTTP/1.1 304 Not Modified 319ms]

GET
http://localhost:3000/src/assets/icons/editor.ts
[HTTP/1.1 304 Not Modified 318ms]

GET
http://localhost:3000/src/assets/icons/musical_instruments.ts
[HTTP/1.1 304 Not Modified 318ms]

GET
http://localhost:3000/src/assets/icons/book_reader.ts
[HTTP/1.1 304 Not Modified 302ms]

GET
http://localhost:3000/src/assets/icons/tarot.ts
[HTTP/1.1 304 Not Modified 302ms]

GET
http://localhost:3000/src/assets/icons/equipment_doll.ts
[HTTP/1.1 304 Not Modified 302ms]

GET
http://localhost:3000/src/assets/icons/minigame.ts
[HTTP/1.1 304 Not Modified 303ms]

GET
http://localhost:3000/src/lib/dataUtils.ts
[HTTP/1.1 304 Not Modified 59ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-CTIQSCVC.js?v=cfdd55cd
[HTTP/1.1 200 OK 61ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-5EZQ5JFA.js?v=cfdd55cd
[HTTP/1.1 200 OK 64ms]

GET
http://localhost:3000/src/services/magicService.ts
[HTTP/1.1 304 Not Modified 1ms]

GET
http://localhost:3000/node_modules/.vite/deps/chunk-A2646ZNO.js?v=cfdd55cd
[HTTP/1.1 200 OK 3ms]

GET
http://localhost:3000/src/components/hud/view/NPCDisplay.tsx
[HTTP/1.1 200 OK 4ms]

GET
http://localhost:3000/src/lib/npcUtils.ts
[HTTP/1.1 304 Not Modified 5ms]

GET
http://localhost:3000/src/components/hud/game/Token.tsx
[HTTP/1.1 200 OK 6ms]

GET
http://localhost:3000/src/components/hud/game/TokenActionHUD.tsx
[HTTP/1.1 200 OK 5ms]

GET
http://localhost:3000/src/lib/tokenActionHud.ts
[HTTP/1.1 304 Not Modified 1ms]

Uncaught SyntaxError: The requested module 'http://localhost:3000/src/services/storageService.ts' doesn't provide an export named: 'getEnemyArtworkUrl' MonsterProfile.tsx:9:10
De verbinding met ws://localhost:24678/?token=hC_MEuaz01ec werd onderbroken tijdens het laden van de pagina. client:802:31
[vite] server connection lost. Polling for restart... client:964:19
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
GET
ws://localhost:24678/
NS_ERROR_CONNECTION_REFUSED

Firefox kan geen verbinding maken met de server op ws://localhost:24678/. client:1035:20
