import { test, expect } from '@playwright/test';

test('verify complete guided character creator flow, validation overlay, and review state', async ({ page }) => {
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

    // 1. Welcome Step & Ruleset Selection
    console.log('1. Verifying Welcome Step & Ruleset Context...');
    await expect(page.locator('text=Choose Campaign Ruleset')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5e (2014)")')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

    // Click Continue to go to Save Slot step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step & Validation Overlay Test
    console.log('2. Verifying Save Slot & Validation Overlay...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Try to continue without selecting a save slot -> trigger validation overlay
    console.log('Testing Validation Overlay trigger on incomplete step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // Expect Validation Overlay modal to pop up
    await expect(page.locator('text=Complete Your Character')).toBeVisible();
    await expect(page.locator('text=No save slot selected')).toBeVisible();

    // Dismiss validation overlay
    await page.click('button:has-text("Dismiss")');
    await page.waitForTimeout(300);

    // Select Slot 1
    console.log('Selecting Slot 1...');
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Continue to Identity step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step
    console.log('4. Verifying Species Step & 3:2 Aspect Ratio Cards...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    const humanBtn = page.locator('button').filter({ hasText: /human/i }).first();
    await expect(humanBtn).toBeVisible();

    // Select Human
    await humanBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records:')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step
    console.log('5. Verifying Class Step & 2:3 Aspect Ratio Cards...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    const fighterBtn = page.locator('button').filter({ hasText: /fighter/i }).first();
    await expect(fighterBtn).toBeVisible();

    // Select Fighter
    await fighterBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records:')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (Origins)
    console.log('6. Verifying Background Step & 1:1 Aspect Ratio Cards...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    const acolytestBtn = page.locator('button').filter({ hasText: /acolyte/i }).first();
    await expect(acolytestBtn).toBeVisible();

    // Select Acolyte
    await acolytestBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: Acolyte')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    const lawfulGoodBtn = page.locator('button').filter({ hasText: /lawful good/i }).first();
    await expect(lawfulGoodBtn).toBeVisible();

    // Select Lawful Good
    await lawfulGoodBtn.click();
    await page.waitForTimeout(500);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 8. Attributes Step
    console.log('8. Verifying Attributes Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 9. Choices Step
    console.log('9. Verifying Choices Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 10. Equipment Step
    console.log('10. Verifying Equipment Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 11. Appearance Step
    console.log('11. Verifying Appearance Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 12. Describe Your Character Step
    console.log('12. Verifying Backstory Step...');
    await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Arthur');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 13. Review Step (Final Manifest)
    console.log('13. Verifying Review Step (Final Manifest)...');
    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
    await expect(page.getByText('Arthur').first()).toBeVisible();
    await expect(page.getByText('Level 0 fighter')).toBeVisible();
    await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5e (2014)');

    // Save screenshot
    await page.screenshot({ path: 'verification/character_creator_guided_review.png' });
    console.log('✓ Playwright guided character creator flow test complete!');
});
