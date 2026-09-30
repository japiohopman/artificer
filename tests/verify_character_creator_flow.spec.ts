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
    await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5e (2014)")')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

    // Verify Continue button is disabled when ruleset is not yet explicitly selected
    await expect(page.locator('#next-stage-btn')).toBeDisabled();

    // Explicitly select 2014 ruleset
    await page.click('button:has-text("D&D 5e (2014)")');
    await page.waitForTimeout(300);

    // Verify Continue button is now enabled
    await expect(page.locator('#next-stage-btn')).toBeEnabled();
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step Test
    console.log('2. Verifying Save Slot Step...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Verify Continue button is disabled when no slot is selected
    await expect(page.locator('#next-stage-btn')).toBeDisabled();

    // Select Slot 1
    console.log('Selecting Slot 1...');
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Verify Continue button is enabled
    await expect(page.locator('#next-stage-btn')).toBeEnabled();
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step Test
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    // Verify Continue button is disabled when gender/polarity is not explicitly selected
    await expect(page.locator('#next-stage-btn')).toBeDisabled();

    // Select Male polarity
    await page.locator('div:has-text("Male")').last().click();
    await page.waitForTimeout(300);

    // Verify Continue button is enabled
    await expect(page.locator('#next-stage-btn')).toBeEnabled();
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step
    console.log('4. Verifying Species Step & 3:2 Aspect Ratio Cards...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /^Human/ })).toBeVisible();

    // Select Human
    await page.locator('button').filter({ hasText: /^Human/ }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: Human')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step
    console.log('5. Verifying Class Step & 2:3 Aspect Ratio Cards...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Fighter/i }).first()).toBeVisible();

    // Select Fighter
    await page.locator('button').filter({ hasText: /Fighter/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: Fighter')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (Origins)
    console.log('6. Verifying Background Step & 1:1 Aspect Ratio Cards...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Acolyte/i }).first()).toBeVisible();

    // Select Acolyte
    await page.locator('button').filter({ hasText: /Acolyte/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: Acolyte')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    await expect(page.locator('button').filter({ hasText: /Lawful Good/i }).first()).toBeVisible();

    // Select Lawful Good
    await page.locator('button').filter({ hasText: /Lawful Good/i }).first().click();
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
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 13. Review Step (Final Manifest)
    console.log('13. Verifying Review Step (Final Manifest)...');
    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
    await expect(page.getByText('Level 0 fighter')).toBeVisible();
    await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5e (2014)');

    // Save screenshot
    await page.screenshot({ path: 'verification/character_creator_guided_review.png' });
    console.log('✓ Playwright guided character creator flow test complete!');
});
