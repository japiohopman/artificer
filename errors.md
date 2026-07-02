plugin:vite:oxc] Transform failed with 1 error:

[PARSE_ERROR] Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
     ╭─[ src/components/hud/chat/ChatPanel.tsx:276:1 ]
     │
 276 │ };
     │ │ 
     │ ╰─ 
─────╯
C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/chat/ChatPanel.tsx


icer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)
23:49:03 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
     ╭─[ src/components/hud/chat/ChatPanel.tsx:276:1 ]
     │
 276 │ };
     │ │ 
     │ ╰─ 
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/chat/ChatPanel.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)

(.venv) PS C:\Users\japie\OneDrive\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

[dotenv@17.3.1] injecting env (5) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
Server running on http://localhost:3000
07:15:09 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `}` but found `Identifier`
    ╭─[ src/components/hud/nav/Nav.tsx:43:5 ]
    │
 38 │   const {
    │         ┬  
    │         ╰── Opened here
    │ 
 43 │     isNight,
    │     ───┬───  
    │        ╰───── `,` or `}` expected
────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/nav/Nav.tsx
07:15:11 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
     ╭─[ src/components/hud/chat/ChatPanel.tsx:276:1 ]
     │
 276 │ };
     │ │ 
     │ ╰─ 
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/chat/ChatPanel.tsx