import { test, expect } from '@playwright/test';

test('verify complete battle map editor workflow and custom operations', async ({ page }) => {
  test.setTimeout(60000);

  // 1. Bypass character screens and load store instances
  await page.goto('http://localhost:3000/');
  await page.waitForFunction(() => (window as any).useGameStore && (window as any).useUIStore);

  // 2. Programmatically transition straight into the DevKit generators tab
  await page.evaluate(() => {
    if ((window as any).useGameStore) {
      (window as any).useGameStore.setState({ isGameStarted: true });
    }
    if ((window as any).useUIStore) {
      (window as any).useUIStore.setState({ isCharacterCreatorOpen: false, isDevKitOpen: true, isLoading: false });
    }
  });

  // Verify DevKit is visible
  await page.waitForSelector('text=ARCANE_OS // DM_TOOLKIT', { timeout: 15000 });

  // Click on GENERATORS tab and open Battle Map editor option
  await page.click('button:has-text("GENERATORS")');
  await page.click('button:has-text("BATTLE MAP")');

  // Verify Editor layout elements
  await page.waitForSelector('text=BATTLE_MAP_EDITOR', { timeout: 10000 });
  await expect(page.locator('text=Operational Layers')).toBeVisible();

  // Draw/Place elements
  // The tool button has lowercase name as text inside the button
  await page.click('button:has-text("wall")');
  await page.click('canvas'); // Paint a wall segment

  await page.click('button:has-text("object")');
  await page.waitForSelector('button:has-text("barrel")');
  await page.click('button:has-text("barrel")');
  await page.click('canvas'); // Place barrel

  // Select item
  await page.click('button:has-text("select")');
  await page.click('canvas'); // Select stamp

  // Test undo and redo flow
  await page.click('button:has-text("Undo")');
  await page.click('button:has-text("Redo")');

  // Verify Exporting JSON
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Export JSON")')
  ]);
  expect(download.suggestedFilename()).toContain('battlemap');
});
