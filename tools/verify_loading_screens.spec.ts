import { test, expect } from '@playwright/test';

test('verify loading screen on title screen and transition', async ({ page }) => {
  // 1. Initial Load (Save Decryption)
  await page.goto('http://localhost:3000');

  // The loading screen should be visible initially
  const loadingScreen = page.locator('h2:has-text("Decrypting Save Data...")');
  await expect(loadingScreen).toBeVisible();

  // Wait for it to disappear
  await expect(loadingScreen).not.toBeVisible({ timeout: 10000 });

  // 2. Click "New Game" to trigger transition loading
  const newGameButton = page.locator('button:has-text("New Game")');
  await newGameButton.click();

  // Transition loading screen should appear
  const transitionLoading = page.locator('h2:has-text("Entering Realm...")');
  await expect(transitionLoading).toBeVisible();

  // Take a screenshot of the transition screen
  await page.screenshot({ path: 'docs/screenshots/loading_transition.png' });

  // Wait for HUD to mount and loading to dismiss (HUD has 1s delay)
  await expect(transitionLoading).not.toBeVisible({ timeout: 10000 });

  // Verify HUD is visible (e.g., Nav component)
  await expect(page.locator('nav')).toBeVisible();
});
