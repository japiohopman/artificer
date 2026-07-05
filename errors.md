App.tsx:22  GET http://localhost:3000/src/components/character/CharacterProfile.tsx net::ERR_ABORTED 404 (Not Found)

(.venv) PS C:\Users\japie\OneDrive\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

[dotenv@17.3.1] injecting env (5) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
Server running on http://localhost:3000
14:31:24 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `)` but found `:`
     ╭─[ src/components/character/CharacterProfile.tsx:465:34 ]
     │
 460 │                              <div className={cn(
     │                                                ┬  
     │                                                ╰── Opened here
     │ 
 465 │                                  : "bg-black/5 border-dragon-red/20 opacity-40 hover:opacity-100"
     │                                  ┬  
     │                                  ╰── `,` or `)` expected
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/character/CharacterProfile.tsx
14:31:26 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `)` but found `:`
     ╭─[ src/components/character/CharacterProfile.tsx:465:34 ]
     │
 460 │                              <div className={cn(
     │                                                ┬  
     │                                                ╰── Opened here
     │ 
 465 │                                  : "bg-black/5 border-dragon-red/20 opacity-40 hover:opacity-100"
     │                                  ┬  
     │                                  ╰── `,` or `)` expected
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/character/CharacterProfile.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)

