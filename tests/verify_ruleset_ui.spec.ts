import { test, expect } from '@playwright/test';

test('verify ruleset selection in character creator welcome step', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    console.log('Waiting for React stores...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    console.log('Opening Character Creator...');
    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(1000);

    console.log('Verifying Welcome Step and Ruleset Selection UI...');
    await page.waitForSelector('text=Select Ruleset Framework', { timeout: 15000 });

    const selectorHeader = page.locator('text=Select Ruleset Framework');
    await expect(selectorHeader).toBeVisible();

    const ruleset2014Btn = page.locator('button:has-text("D&D 5e (2014)")');
    const ruleset2024Btn = page.locator('button:has-text("D&D 5.5e (2024)")');

    await expect(ruleset2014Btn).toBeVisible();
    await expect(ruleset2024Btn).toBeVisible();

    // Click 2024 Ruleset
    await ruleset2024Btn.click();
    await page.waitForTimeout(500);

    // Save screenshot
    await page.screenshot({ path: 'verification/ruleset_selection_2024.png' });
    console.log('Saved screenshot verification/ruleset_selection_2024.png');
});
