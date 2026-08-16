import { test, expect } from '@playwright/test';

test('verify ruleset selection flow and state toggling in character creator', async ({ page }) => {
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

    const ruleset2014Btn = page.locator('button:has-text("D&D 5e (2014)")');
    const ruleset2024Btn = page.locator('button:has-text("D&D 5.5e (2024)")');

    await expect(ruleset2014Btn).toBeVisible();
    await expect(ruleset2024Btn).toBeVisible();

    // Verify initial active state (2014 active)
    await expect(page.locator('text=✓ Active Ruleset Context')).toBeVisible();
    await expect(ruleset2014Btn).toContainText('Active Ruleset Context');

    // Toggle 2014 -> 2024
    console.log('Selecting 2024 ruleset...');
    await ruleset2024Btn.click();
    await page.waitForTimeout(300);
    await expect(ruleset2024Btn).toContainText('Active Ruleset Context');

    // Toggle 2024 -> 2014
    console.log('Selecting 2014 ruleset...');
    await ruleset2014Btn.click();
    await page.waitForTimeout(300);
    await expect(ruleset2014Btn).toContainText('Active Ruleset Context');

    // Toggle 2014 -> 2024 -> 2014 -> 2024
    console.log('Testing rapid multi-toggle flow (2014 -> 2024 -> 2014 -> 2024)...');
    await ruleset2024Btn.click();
    await page.waitForTimeout(200);
    await ruleset2014Btn.click();
    await page.waitForTimeout(200);
    await ruleset2024Btn.click();
    await page.waitForTimeout(300);
    await expect(ruleset2024Btn).toContainText('Active Ruleset Context');

    console.log('✓ Playwright ruleset selection test complete!');
});
