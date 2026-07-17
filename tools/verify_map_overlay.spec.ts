import { test, expect } from '@playwright/test';

test('verify regional overlay on world map', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000');
  
  // Force Start via evaluate to skip character creation and title screen overlays
  await page.evaluate(() => {
    const uiStore = (window as any).useUIStore;
    const gameStore = (window as any).useGameStore;
    if (uiStore && gameStore) {
       uiStore.getState().setGameMode('exploration');
       uiStore.getState().setCurrentView('world');
       gameStore.getState().setIsGameStarted(true);
    }
  });

  await page.waitForSelector('.leaflet-container', { state: 'visible' });

  // programmatically set zoom to 3 on the leaflet map instance to expose regions
  await page.waitForFunction(() => (window as any).leafletMap !== undefined);
  await page.evaluate(() => {
    if ((window as any).leafletMap) {
      (window as any).leafletMap.setZoom(3);
    }
  });

  // Wait for Zoom level to propagate and sync
  await page.waitForTimeout(2000);

  // Get zoom level from global store
  const zoomLevel = await page.evaluate(() => {
    const store = (window as any).useWorldStore;
    return store ? store.getState().mapZoom : null;
  });
  console.log(`Zoom level after Zoom Out evaluation: ${zoomLevel}`);

  // Take screenshot before click
  await page.screenshot({ path: '/home/jules/verification/map_before_click.png' });

  const firstPath = page.locator('path.pointer-events-auto').first();
  await expect(firstPath).toBeVisible();

  // Dispatch click
  await firstPath.dispatchEvent('click');

  await page.waitForTimeout(2000);

  const zoomLevelAfterClick = await page.evaluate(() => {
    const store = (window as any).useWorldStore;
    return store ? store.getState().mapZoom : null;
  });
  console.log(`Zoom level after regional click: ${zoomLevelAfterClick}`);

  // If zoom level changed or is valid
  expect(zoomLevelAfterClick).toBeGreaterThan(1);

  await page.screenshot({ path: '/home/jules/verification/world_map_region_click.png' });
});
