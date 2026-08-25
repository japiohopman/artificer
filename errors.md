WEBGL_debug_renderer_info is deprecated in Firefox and will be removed. Please use RENDERER. chunk-KUQYGPWD.js:3293:24
React has detected a change in the order of Hooks called by FullInventoryMenu. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useCallback                useCallback
2. useCallback                useCallback
3. useSyncExternalStore       useSyncExternalStore
4. useDebugValue              useDebugValue
5. useCallback                useCallback
6. useCallback                useCallback
7. useSyncExternalStore       useSyncExternalStore
8. useDebugValue              useDebugValue
9. useCallback                useCallback
10. useCallback               useCallback
11. useSyncExternalStore      useSyncExternalStore
12. useDebugValue             useDebugValue
13. undefined                 useMemo
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
react-dom_client.js:5594:21
    React 3
    useSensor useSensor.ts:9
    FullInventoryMenu FullInventoryMenu.tsx:45
    React 13
Uncaught Error: Rendered more hooks than during the previous render.
    React 4
    useSensor useSensor.ts:9
    FullInventoryMenu FullInventoryMenu.tsx:45
    React 13
react-dom_client.js:5792:19
An error occurred in the <FullInventoryMenu> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.
react-dom_client.js:6966:17

