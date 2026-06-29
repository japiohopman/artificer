import { test, expect } from '@playwright/test';

test('verify moonshae isles and water click does not crash', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Open DevKit
  await page.keyboard.press('Shift+D');

  // Click World tab
  await page.click('button:has-text("WORLD")');

  // Wait for SVG
  await page.waitForSelector('svg');

  // Find Moonshae Isles path - it's the last one in REGION_PATH_REGISTRY or we can find by index
  // Registry order: west, northwest, northeast, north, sea, southeast, east, southwest, interior, south, moonshae, water
  const paths = await page.locator('path');

  // Click Moonshae Isles (index 10)
  await paths.nth(10).click();

  // Check if name is displayed
  await expect(page.locator('h3:has-text("Moonshae Isles")')).toBeVisible();

  // Click Exterior Waters (index 11)
  await paths.nth(11).click();

  // Check if name is displayed
  await expect(page.locator('h3:has-text("Exterior Waters")')).toBeVisible();
});
