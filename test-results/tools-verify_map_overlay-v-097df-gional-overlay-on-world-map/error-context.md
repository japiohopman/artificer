# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tools/verify_map_overlay.spec.ts >> verify regional overlay on world map
- Location: tools/verify_map_overlay.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[title="Zoom Out"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button[title="Zoom Out"]').first()
    - waiting for" http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"

```

```yaml
- img
- heading "Dungeons Dragons" [level=1]
- paragraph: The Arcane Forge & Database
- heading "New Game" [level=2]
- button "New Game":
  - img
  - text: New Game
- paragraph: "\"Create a fresh identity in the codex. Existing manifest in chosen slot will be purged.\""
- heading "Continue Adventure" [level=2]
- button "Slot 01 Empty Slot" [disabled]:
  - text: Slot 01
  - heading "Empty Slot" [level=3]
- button "Slot 02 Empty Slot" [disabled]:
  - text: Slot 02
  - heading "Empty Slot" [level=3]
- button "Slot 03 Empty Slot" [disabled]:
  - text: Slot 03
  - heading "Empty Slot" [level=3]
- button "Continue Adventure" [disabled]:
  - img
  - text: Continue Adventure
- text: Version 3.0.0 // Prime Protocol
- img "Loading Art"
- img
- text: Chronicles of Artificer
- heading "Decrypting Save Data..." [level=2]
- paragraph: The threads of fate are weaving together...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify regional overlay on world map', async ({ page }) => {
  4  |   await page.setViewportSize({ width: 1280, height: 720 });
  5  |   await page.goto('http://localhost:3000');
  6  |
  7  |   // Force Start via evaluate to skip character creation and title screen overlays
  8  |   await page.evaluate(() => {
  9  |     const uiStore = (window as any).useUIStore;
  10 |     const gameStore = (window as any).useGameStore;
  11 |     if (uiStore && gameStore) {
  12 |        uiStore.getState().setGameMode('exploration');
  13 |        uiStore.getState().setCurrentView('world');
  14 |        gameStore.getState().setIsGameStarted(true);
  15 |     }
  16 |   });
  17 |
  18 |   await page.waitForSelector('.leaflet-container', { state: 'visible' });
  19 |
  20 |   // Wait for the Zoom Out button to be visible and click it
  21 |   const zoomOutButton = page.locator('button[title="Zoom Out"]').first();
> 22 |   await expect(zoomOutButton).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  23 |   await zoomOutButton.dispatchEvent('click');
  24 |
  25 |   // Wait for Zoom level to become 3
  26 |   await page.waitForTimeout(3000);
  27 |
  28 |   // Get zoom level from global store
  29 |   const zoomLevel = await page.evaluate(() => {
  30 |     const store = (window as any).useWorldStore;
  31 |     return store ? store.getState().mapZoom : null;
  32 |   });
  33 |   console.log(`Zoom level after Zoom Out click: ${zoomLevel}`);
  34 |
  35 |   // Take screenshot before click
  36 |   await page.screenshot({ path: '/home/jules/verification/map_before_click.png' });
  37 |
  38 |   const firstPath = page.locator('path.pointer-events-auto').first();
  39 |   await expect(firstPath).toBeVisible();
  40 |
  41 |   // Dispatch click
  42 |   await firstPath.dispatchEvent('click');
  43 |
  44 |   await page.waitForTimeout(2000);
  45 |
  46 |   const zoomLevelAfterClick = await page.evaluate(() => {
  47 |     const store = (window as any).useWorldStore;
  48 |     return store ? store.getState().mapZoom : null;
  49 |   });
  50 |   console.log(`Zoom level after regional click: ${zoomLevelAfterClick}`);
  51 |
  52 |   // If zoom level changed or is valid
  53 |   expect(zoomLevelAfterClick).toBeGreaterThan(1);
  54 |
  55 |   await page.screenshot({ path: '/home/jules/verification/world_map_region_click.png' });
  56 | });
  57 |
```