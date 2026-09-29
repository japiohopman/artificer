import { test, expect } from '@playwright/test';

test('verify complete guided character creator flow for 2014 ruleset', async ({ page }) => {
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

    // Select 2014 ruleset framework
    await page.click('button:has-text("D&D 5e (2014)")');
    await page.waitForTimeout(300);

    // Click Continue to go to Save Slot step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step
    console.log('2. Verifying Save Slot Step...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Select Slot 1
    console.log('Selecting Slot 1...');
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Continue to Identity step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step (Manifested Polarity)
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    // Select Male
    await page.click('span:has-text("Male")');
    await page.waitForTimeout(300);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step
    console.log('4. Verifying Species Step & 3:2 Aspect Ratio Cards...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    await expect(page.locator('button:has-text("Human")')).toBeVisible();

    // Select Human
    await page.click('button:has-text("Human")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: human')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step
    console.log('5. Verifying Class Step & 2:3 Aspect Ratio Cards...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    await expect(page.locator('button:has-text("Fighter")')).toBeVisible();

    // Select Fighter
    await page.click('button:has-text("Fighter")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: fighter')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (Origins)
    console.log('6. Verifying Background Step & 1:1 Aspect Ratio Cards...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    await expect(page.locator('button:has-text("Acolyte")')).toBeVisible();

    // Select Acolyte
    await page.click('button:has-text("Acolyte")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: acolyte')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    await expect(page.locator('button:has-text("Lawful Good")')).toBeVisible();

    // Select Lawful Good
    await page.click('button:has-text("Lawful Good")');
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
    console.log('✓ Playwright guided 2014 character creator flow test complete!');
});

test('verify complete guided character creator flow for 2024 ruleset', async ({ page }) => {
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
    console.log('1. Verifying Welcome Step & 2024 Ruleset Context...');
    await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

    // Select 2024 ruleset framework
    await page.click('button:has-text("D&D 5.5e (2024)")');
    await page.waitForTimeout(300);

    // Click Continue to go to Save Slot step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step
    console.log('2. Verifying Save Slot Step...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Select Slot 1
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Continue to Identity step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    // Select Female
    await page.click('span:has-text("Female")');
    await page.waitForTimeout(300);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step (2024)
    console.log('4. Verifying 2024 Species Step...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    await expect(page.locator('button:has-text("Goliath")')).toBeVisible();

    // Select Goliath
    await page.click('button:has-text("Goliath")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: goliath')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step (2024)
    console.log('5. Verifying 2024 Class Step...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    await expect(page.locator('button:has-text("Paladin")')).toBeVisible();

    // Select Paladin
    await page.click('button:has-text("Paladin")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: paladin')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (2024 Origins)
    console.log('6. Verifying 2024 Background Step...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    await expect(page.locator('button:has-text("Soldier")')).toBeVisible();

    // Select Soldier
    await page.click('button:has-text("Soldier")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: soldier')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    await expect(page.locator('button:has-text("Neutral Good")')).toBeVisible();

    // Select Neutral Good
    await page.click('button:has-text("Neutral Good")');
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

    // 10. Arcana / Spells Step (Paladin spellcaster)
    console.log('10. Verifying Spells Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 11. Equipment Step
    console.log('11. Verifying Equipment Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 12. Appearance Step
    console.log('12. Verifying Appearance Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 13. Backstory Step
    console.log('13. Verifying Backstory Step...');
    await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Freya');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 14. Review Step (Final Manifest)
    console.log('14. Verifying Review Step (Final Manifest)...');
    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
    await expect(page.getByText('Freya').first()).toBeVisible();
    await expect(page.getByText('Level 0 paladin')).toBeVisible();
    await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5.5e (2024)');

    // Save screenshot
    await page.screenshot({ path: 'verification/character_creator_2024_review.png' });
    console.log('✓ Playwright guided 2024 character creator flow test complete!');
});
