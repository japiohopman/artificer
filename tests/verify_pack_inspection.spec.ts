import { test, expect } from '@playwright/test';

test('verify interactive equipment pack inspection focus view', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000');

    console.log('Waiting for React and store initialization...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    console.log('Opening FocusView with a Burglar\'s Pack...');
    await page.evaluate(() => {
      const mockPack = {
        index: "burglars_pack",
        name: "burglar's pack",
        desc: ["This burglar's pack contains all the gear a quiet rogue needs to perform their work."],
        kind: "container",
        cost: { quantity: 16, unit: "gp" },
        weight: 5,
        imageUrl: "/assets/atlas/equipment/images/_container.webp"
      };
      (window as any).useGameStore.setState({ isGameStarted: true });
      (window as any).useUIStore.setState({ focusedItem: mockPack });
    });

    console.log('Verifying Pack Manifest elements...');
    // Wait for PackInspector to render
    await page.waitForSelector('text=Container Manifest', { timeout: 15000 });

    // Assert main elements are visible (using .first() or precise selectors to avoid strict mode violations)
    await expect(page.locator('h2:has-text("burglar\'s pack")').first()).toBeVisible();
    await expect(page.locator('text=Total Cost').first()).toBeVisible();
    await expect(page.locator('text=Pack Weight').first()).toBeVisible();
    await expect(page.locator('text=Total Cargo').first()).toBeVisible();

    // Give some time for sub-items to load asynchronously
    await page.waitForTimeout(3000);

    // Verify sub-items loaded (for example, candle, ball bearings, etc.)
    await expect(page.locator('text=Contents (14 items)').first()).toBeVisible();

    // Click on an item to inspect (e.g. first item slot button)
    console.log('Clicking on a sub-item to inspect details...');
    const firstItem = page.locator('button.aspect-\\[9\\/16\\]').first();
    await firstItem.click();

    // Verify detail panel updates to showing details for the sub-item
    await page.waitForTimeout(1000);

    // Take screenshot of the interactive FocusView
    await page.screenshot({ path: 'verification/pack_inspection.png' });
    console.log('Screenshot saved to verification/pack_inspection.png');
});
