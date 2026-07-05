(.venv) PS C:\Users\japie\OneDrive\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

[dotenv@17.3.1] injecting env (5) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
Server running on http://localhost:3000
12:01:23 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/assets/icons/index.ts:9:1 ]
    │
  9 │ <<<<<<< Updated upstream
    │ ───┬───  
    │    ╰───── between this marker and `=======` is the code that we're merging into
    │ 
 11 │ =======
    │ ───┬───  
    │    ╰───── between this marker and `>>>>>>>` is the incoming code
    │ 
 13 │ >>>>>>> Stashed changes
    │ ───┬───  
    │    ╰───── this marker concludes the conflict region
    │ 
    │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
    │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
    │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
    │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
    │       If you have nested conflicts, resolve the outermost conflict first.
────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/assets/icons/index.ts
12:01:30 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/assets/icons/index.ts:9:1 ]
    │
  9 │ <<<<<<< Updated upstream
    │ ───┬───  
    │    ╰───── between this marker and `=======` is the code that we're merging into
    │ 
 11 │ =======
    │ ───┬───  
    │    ╰───── between this marker and `>>>>>>>` is the incoming code
    │ 
 13 │ >>>>>>> Stashed changes
    │ ───┬───  
    │    ╰───── this marker concludes the conflict region
    │ 
    │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
    │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
    │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
    │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
    │       If you have nested conflicts, resolve the outermost conflict first.
────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/assets/icons/index.ts
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)
12:08:39 [vite] (client) hmr update /src/index.css
12:08:39 [vite] (client) hmr update /src/components/hud/WorldPanel.tsx, /src/index.css
12:08:39 [vite] (client) hmr update /src/index.css, /src/components/hud/game/ActionPanel.tsx
12:08:39 [vite] (client) hmr update /src/index.css, /src/components/hud/game/CombatGrid.tsx
12:08:39 [vite] (client) hmr update /src/App.tsx, /src/components/dice/DiceRollerPanel.tsx, /src/dice_roller/DiceRollOverlay.tsx, /src/components/core/TitleScreen.tsx, /src/dice_roller/DiceBoxCanvas.tsx, /src/components/character/MonsterProfile.tsx, /src/components/character/CharacterProfile.tsx, /src/components/character/CharacterCreator.tsx, /src/components/hud/WorldPanel.tsx, /src/components/hud/GameScreen.tsx, /src/components/dice/DiceText.tsx, /src/components/devkit/CombatTester.tsx, /src/components/hud/chat/ChatPanel.tsx and 6 more
12:08:45 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `>` but found `Identifier`
     ╭─[ src/components/hud/WorldPanel.tsx:137:13 ]
     │
 136 │           <div
     │           ┬  
     │           ╰── Opened here
 137 │             className="absolute inset-0 z-0 bg-no-repeat transition-all duration-1000"
     │             ────┬────  
     │                 ╰────── `,` or `>` expected
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/WorldPanel.tsx
12:08:45 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `>` but found `Identifier`
     ╭─[ src/components/hud/WorldPanel.tsx:137:13 ]
     │
 136 │           <div
     │           ┬  
     │           ╰── Opened here
 137 │             className="absolute inset-0 z-0 bg-no-repeat transition-all duration-1000"
     │             ────┬────  
     │                 ╰────── `,` or `>` expected
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/WorldPanel.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)
12:08:53 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Expected `,` or `>` but found `Identifier`
     ╭─[ src/components/hud/WorldPanel.tsx:137:13 ]
     │
 136 │           <div
     │           ┬  
     │           ╰── Opened here
 137 │             className="absolute inset-0 z-0 bg-no-repeat transition-all duration-1000"
     │             ────┬────  
     │                 ╰────── `,` or `>` expected
─────╯

  Plugin: vite:oxc
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/hud/WorldPanel.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20) (x2)
	  