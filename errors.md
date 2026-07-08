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

      GET
http://localhost:3000/src/services/audio/audioEngine.ts
NS_ERROR_CORRUPTED_CONTENT

	
GET
	http://localhost:3000/src/services/audio/audioEngine.ts
Status
404
Not Found
VersieHTTP/1.1
Overgebracht286 B (grootte 0 B)
Referrer-beleidstrict-origin-when-cross-origin
DNS-omzettingSysteem

    	
    Connection
    	keep-alive
    Content-Length
    	172
    Content-Security-Policy
    	default-src 'none'
    Content-Type
    	text/html; charset=utf-8
    Date
    	Wed, 08 Jul 2026 12:21:08 GMT
    Keep-Alive
    	timeout=5
    Vary
    	Origin
    X-Content-Type-Options
    	nosniff
    X-Powered-By
    	Express
    	
    Accept
    	*/*
    Accept-Encoding
    	gzip, deflate, br, zstd
    Accept-Language
    	nl,en-US;q=0.9,en;q=0.8
    Connection
    	keep-alive
    Host
    	localhost:3000
    Referer
    	http://localhost:3000/src/services/soundService.ts
    Sec-Fetch-Dest
    	script
    Sec-Fetch-Mode
    	cors
    Sec-Fetch-Site
    	same-origin
    User-Agent
    	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0

Laden van module vanaf ‘http://localhost:3000/src/services/audio/audioEngine.ts’ is geblokkeerd vanwege een niet-toegestaan MIME-type (‘text/html’).

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options?utm_source=devtools&utm_medium=firefox-console-errors&utm_campaign=default 