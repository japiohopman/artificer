import { test, expect } from '@playwright/test';

test('verify regional overlay on world map', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("NEW GAME")');
  await page.waitForSelector('.leaflet-container', { state: 'visible' });

  const firstPath = page.locator('path.pointer-events-auto').first();

  // Take screenshot before click
  await page.screenshot({ path: '/home/jules/verification/map_before_click.png' });

  // Dispatch click
  await firstPath.dispatchEvent('click');

  await page.waitForTimeout(2000);

  const zoomValue = await page.locator('.text-dragon-red.text-lg').textContent();
  console.log(`Zoom value after click: ${zoomValue}`);

  // If zoom level > 1 (starting zoom usually), then click worked
  expect(Number(zoomValue)).toBeGreaterThan(1);

  await page.screenshot({ path: '/home/jules/verification/world_map_region_click.png' });
});
