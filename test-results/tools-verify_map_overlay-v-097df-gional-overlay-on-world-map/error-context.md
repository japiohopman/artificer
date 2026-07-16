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

Locator: locator('path.pointer-events-auto').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('path.pointer-events-auto').first()

```

```yaml
- navigation:
  - button "Tactical":
    - img
    - text: Shift+G
  - button "Atlas":
    - img
    - text: M
  - button "Journal": Alt+J
  - text: Time
  - img "Time Icon"
  - text: 08:01 Calendar 1st of Hammer, 1492 DR Temp
  - img "Temp"
  - text: 2.1°C Weather
  - img "Sunny"
  - text: Sunny
  - button "Stats": P
  - button "Logistics":
    - img
    - text: L
  - button "Hero":
    - img
    - text: C
- complementary:
  - text: Cartographic
  - heading "World Atlas" [level=2]
  - button "Minimize Travel"
  - button "Close World Panel":
    - img
  - button "Map_Legend":
    - heading "Map_Legend" [level=3]
    - img
  - img
  - text: Cities (Requires Level 3)
  - img
  - text: Towns & Villages (Requires Level 4)
  - img
  - text: Forts & Castles (Requires Level 4)
  - img
  - text: Ruins (Requires Level 6)
  - img
  - text: Points of Interest (Requires Level 6)
  - img
  - text: Hills & Mountains (Requires Level 2)
  - img
  - text: Forests (Requires Level 2)
  - img
  - text: Seas & Oceans (Requires Level 1)
  - img
  - text: Rivers & Flows (Requires Level 2) Lakes & Ponds (Requires Level 2)
  - img
  - text: Bays & Inlets (Requires Level 2) Coasts & Reefs (Requires Level 2)
  - img
  - text: Islands (Requires Level 2) Landmarks (Requires Level 5)
  - img
  - text: Temples & Shrines (Requires Level 5) Roads & Trails (Requires Level 6)
  - img
  - text: Cemeteries (Requires Level 6)
  - heading "Active_Domain" [level=3]
  - paragraph: The horizon stretches infinitely, a canvas of primal forces awaiting the touch of a pathfinder.
- img
- img
- button "Party"
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button:
  - img
- button:
  - img
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- button
- tooltip "Farshore Straits"
- tooltip "Strait of Silvanus"
- tooltip "Paddle Straits"
- tooltip "Alamber Sea"
- tooltip "Nixie Deep"
- tooltip "Dolphingulf"
- tooltip "Shining Sea"
- tooltip "Wizards' Reach"
- tooltip "Sea of Dlurg"
- tooltip "Sea of Fallen Stars"
- tooltip "Easting Reach"
- tooltip "Sea of Swords"
- tooltip "Deepwash"
- tooltip "Racewind Passage"
- tooltip "Cauldron of the Reach"
- tooltip "River Reaching"
- tooltip "Ardeep River"
- tooltip "Jaws Strait"
- tooltip "Moonsea"
- tooltip "Dragon Reach"
- tooltip "Gulf of Lath"
- tooltip "Even's Gulf"
- tooltip "Lotan's Abyss"
- tooltip "Waterdeep"
- tooltip "Baldur's Gate"
- tooltip "Trackless Sea"
- tooltip "Northwind Strait"
- tooltip "Asavir's Channel"
- tooltip "Strait of Oman"
- tooltip "Deepvale"
- tooltip "Grayseas"
- tooltip "Strait of the Leviathan"
- tooltip "Sea of Moonshae"
- tooltip "Deepglen Stream"
- tooltip "Prince's Sound"
- tooltip "Pythan Trench"
- tooltip "Trackless Strait"
- text: Map_Navigation Sword Coast Map
- button "Navigate & Pan"
- button "Set Wilderness Target"
- textbox "Search Map..."
- img
- button "Locate Party":
  - img
- button "Zoom In":
  - img
- button "Zoom Out":
  - img
- button "Lock Pan"
- text: Position_Verified • Land Region • Zoom 3 Unknown Region Passive_Surveillance_Active
- button "Clear System Logs":
  - img
- text: System_Idle // No active notifications
- complementary
- img "Platinum"
- text: "0"
- img "Gold"
- text: "10"
- img "Electrum"
- text: "0"
- img "Silver"
- text: "0"
- img "Copper"
- text: "0 Active Character: shazam Load: 0.2 / 270 lbs"
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
  22 |   await expect(zoomOutButton).toBeVisible();
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
> 39 |   await expect(firstPath).toBeVisible();
     |                           ^ Error: expect(locator).toBeVisible() failed
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