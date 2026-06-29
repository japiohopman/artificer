client:851 [vite] connecting...
client:955 [vite] connected.
WorldExplorer.tsx:1  Failed to load resource: the server responded with a status of 404 (Not Found)
The deferred DOM Node could not be resolved to a valid node.
favicon.ico:1  GET http://localhost:3000/favicon.ico 404 (Not Found)


PowerShell Extension v2025.4.0
Copyright (c) Microsoft Corporation.

https://aka.ms/vscode-powershell
Type 'help' to get help.

PS C:\Users\japie\OneDrive\Documents\GitHub\artificer> (Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& c:\Users\japie\OneDrive\Documents\GitHub\artificer\.venv\Scripts\Activate.ps1)
(.venv) PS C:\Users\japie\OneDrive\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

[dotenv@17.3.1] injecting env (5) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
Server running on http://localhost:3000
18:44:06 [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/components/devkit/WorldExplorer.tsx:15:1 ]
    │
 15 │ <<<<<<< Updated upstream
    │ ───┬───  
    │    ╰───── between this marker and `=======` is the code that we're merging into
    │ 
 17 │ =======
    │ ───┬───  
    │    ╰───── between this marker and `>>>>>>>` is the incoming code
    │ 
 19 │ >>>>>>> Stashed changes
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
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/devkit/WorldExplorer.tsx
18:44:07 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/components/devkit/WorldExplorer.tsx:15:1 ]
    │
 15 │ <<<<<<< Updated upstream
    │ ───┬───  
    │    ╰───── between this marker and `=======` is the code that we're merging into
    │ 
 17 │ =======
    │ ───┬───  
    │    ╰───── between this marker and `>>>>>>>` is the incoming code
    │ 
 19 │ >>>>>>> Stashed changes
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
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/devkit/WorldExplorer.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20)
18:45:01 [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/components/devkit/WorldExplorer.tsx:15:1 ]
    │
 15 │ <<<<<<< Updated upstream
    │ ───┬───  
    │    ╰───── between this marker and `=======` is the code that we're merging into
    │ 
 17 │ =======
    │ ───┬───  
    │    ╰───── between this marker and `>>>>>>>` is the incoming code
    │ 
 19 │ >>>>>>> Stashed changes
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
  File: C:/Users/japie/OneDrive/Documents/GitHub/artificer/src/components/devkit/WorldExplorer.tsx
      at transformWithOxc (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3344:19)
      at TransformPluginContext.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:3415:26)
      at EnvironmentPluginContainer.transform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:30387:51)
      at async loadAndTransform (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24646:26)
      at async viteTransformMiddleware (C:\Users\japie\OneDrive\Documents\GitHub\artificer\node_modules\vite\dist\node\chunks\node.js:24440:20) (x2)

