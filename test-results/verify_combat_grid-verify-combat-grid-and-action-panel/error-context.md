# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify_combat_grid.spec.ts >> verify combat grid and action panel
- Location: verify_combat_grid.spec.ts:3:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=End Turn') to be visible
    3 × waiting for" http://localhost:3000/" navigation to finish...
      - navigated to "http://localhost:3000/"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify combat grid and action panel', async ({ page }) => {
  4  |   await page.setViewportSize({ width: 1280, height: 720 });
  5  |   await page.goto('http://localhost:3000');
  6  |
  7  |   // Wait for TitleScreen
  8  |   await page.waitForSelector('h1:has-text("Dungeons")');
  9  |
  10 |   // Force Start
  11 |   await page.evaluate(() => {
  12 |     const uiStore = (window as any).useUIStore.getState();
  13 |     const gameStore = (window as any).useGameStore.getState();
  14 |
  15 |     gameStore.setIsGameStarted(true);
  16 |     uiStore.setGameMode('combat');
  17 |     gameStore.startCombat();
  18 |   });
  19 |
  20 |   // Wait for Canvas
  21 |   await page.waitForSelector('canvas', { timeout: 15000 });
  22 |   await page.screenshot({ path: 'docs/screenshots/combat_hud_canvas_grid.png' });
  23 |
  24 |   // Check for End Turn button in ActionPanel
> 25 |   await page.waitForSelector('text=End Turn', { timeout: 10000 });
     |              ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  26 |
  27 |   await page.screenshot({
  28 |     path: 'docs/screenshots/action_panel_zoom.png',
  29 |     clip: { x: 300, y: 500, width: 680, height: 220 }
  30 |   });
  31 |
  32 |   console.log('Screenshots captured successfully');
  33 | });
  34 |
```