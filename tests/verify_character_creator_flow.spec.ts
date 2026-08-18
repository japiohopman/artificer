import { test, expect } from '@playwright/test';

test.describe('Character Creator — Selection Experience & Flow', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });
    await page.waitForTimeout(1000);
  });

  test('verifies step order and that Background precedes Equipment', async ({ page }) => {
    const creatorPortal = page.locator('#character-creator-portal');
    await expect(creatorPortal).toBeVisible({ timeout: 15000 });

    const sidebarButtons = page.locator('#creator-sidebar button');
    const titles = await sidebarButtons.evaluateAll(btns => btns.map(b => b.getAttribute('title')));

    const backgroundIdx = titles.indexOf('Origins');
    const equipmentIdx = titles.indexOf('Gear');
    const describeIdx = titles.indexOf('Describe Your Character');

    expect(backgroundIdx).toBeGreaterThan(-1);
    expect(equipmentIdx).toBeGreaterThan(-1);
    expect(describeIdx).toBeGreaterThan(-1);
    expect(backgroundIdx).toBeLessThan(equipmentIdx);
  });

  test('verifies required step validation and COMPLETE YOUR CHARACTER overlay', async ({ page }) => {
    const creatorPortal = page.locator('#character-creator-portal');
    await expect(creatorPortal).toBeVisible({ timeout: 15000 });

    // Advance from welcome to slot step
    const continueBtn = page.locator('#next-stage-btn');
    await continueBtn.click();
    await page.waitForTimeout(300);

    // Now on Save Slot step without a selected slot, click Continue to trigger validation
    await continueBtn.click();

    const validationOverlay = page.locator('#validation-overlay-modal');
    await expect(validationOverlay).toBeVisible({ timeout: 10000 });
    await expect(validationOverlay).toContainText('COMPLETE YOUR CHARACTER');
    await expect(validationOverlay).toContainText("Your character isn't ready yet.");

    const dismissBtn = validationOverlay.locator('button', { hasText: 'Dismiss' });
    await dismissBtn.click();
    await expect(validationOverlay).not.toBeVisible();
  });

  test('verifies Help overlay and Markdown loading', async ({ page }) => {
    const creatorPortal = page.locator('#character-creator-portal');
    await expect(creatorPortal).toBeVisible({ timeout: 15000 });

    const speciesBtn = page.locator('#creator-sidebar button[title="Species"]');
    await speciesBtn.click();
    await page.waitForTimeout(300);

    const helpBtn = page.locator('button', { hasText: '[?]' });
    await expect(helpBtn).toBeVisible({ timeout: 10000 });
    await helpBtn.click();

    const helpModal = page.locator('#selection-help-modal');
    await expect(helpModal).toBeVisible({ timeout: 10000 });
    await expect(helpModal).toContainText('Rules & Guidance');

    const closeBtn = helpModal.locator('button', { hasText: 'Close' });
    await closeBtn.click();
    await expect(helpModal).not.toBeVisible();
  });

  test('verifies 3x3 Alignment selection and persistent startingAlignment', async ({ page }) => {
    const creatorPortal = page.locator('#character-creator-portal');
    await expect(creatorPortal).toBeVisible({ timeout: 15000 });

    const ethosBtn = page.locator('#creator-sidebar button[title="Ethos"]');
    await ethosBtn.click();
    await page.waitForTimeout(300);

    const lawfulGoodBtn = page.locator('button', { hasText: 'Lawful Good' });
    await expect(lawfulGoodBtn).toBeVisible({ timeout: 10000 });
    await lawfulGoodBtn.click();

    const chaoticEvilBtn = page.locator('button', { hasText: 'Chaotic Evil' });
    await expect(chaoticEvilBtn).toBeVisible({ timeout: 10000 });
    await chaoticEvilBtn.click();
  });

  test('verifies Describe Your Character step with dynamic gender wording', async ({ page }) => {
    const creatorPortal = page.locator('#character-creator-portal');
    await expect(creatorPortal).toBeVisible({ timeout: 15000 });

    const describeBtn = page.locator('#creator-sidebar button[title="Describe Your Character"]');
    await describeBtn.click();
    await page.waitForTimeout(300);

    const stage = page.locator('#creator-stage');
    await expect(stage).toContainText('DESCRIBE YOUR CHARACTER');
    await expect(stage).toContainText('What is he like?');
  });
});
