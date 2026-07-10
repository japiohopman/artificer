# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tools/verify_loading_screens.spec.ts >> verify loading screen on title screen and transition
- Location: tools/verify_loading_screens.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("New Game")')
    - locator resolved to <button class="w-full group relative overflow-hidden bg-dragon-red py-8 rounded-sm border border-dragon-red/50 shadow-[0_0_30px_rgba(139,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">…</div> from <div class="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">…</div> from <div class="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    - waiting for" http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying
    - locator resolved to <button class="w-full group relative overflow-hidden bg-dragon-red py-8 rounded-sm border border-dragon-red/50 shadow-[0_0_30px_rgba(139,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">…</div> from <div class="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for" http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify loading screen on title screen and transition', async ({ page }) => {
  4  |   // 1. Initial Load (Save Decryption)
  5  |   await page.goto('http://localhost:3000');
  6  |
  7  |   // The loading screen should be visible initially
  8  |   const loadingScreen = page.locator('h2:has-text("Decrypting Save Data...")');
  9  |   await expect(loadingScreen).toBeVisible();
  10 |
  11 |   // Wait for it to disappear
  12 |   await expect(loadingScreen).not.toBeVisible({ timeout: 10000 });
  13 |
  14 |   // 2. Click "New Game" to trigger transition loading
  15 |   const newGameButton = page.locator('button:has-text("New Game")');
> 16 |   await newGameButton.click();
     |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  17 |
  18 |   // Transition loading screen should appear
  19 |   const transitionLoading = page.locator('h2:has-text("Entering Realm...")');
  20 |   await expect(transitionLoading).toBeVisible();
  21 |
  22 |   // Take a screenshot of the transition screen
  23 |   await page.screenshot({ path: 'docs/screenshots/loading_transition.png' });
  24 |
  25 |   // Wait for HUD to mount and loading to dismiss (HUD has 1s delay)
  26 |   await expect(transitionLoading).not.toBeVisible({ timeout: 10000 });
  27 |
  28 |   // Verify HUD is visible (e.g., Nav component)
  29 |   await expect(page.locator('nav')).toBeVisible();
  30 | });
  31 |
```