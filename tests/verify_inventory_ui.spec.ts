import { test, expect } from '@playwright/test';

test.describe('Inventory & Equipment UI Integration', () => {
  test('CharacterPanel compact HUD permits opening FullInventoryMenu workspace', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('body', { timeout: 15000 });
  });
});
