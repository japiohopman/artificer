import { test, expect } from '@playwright/test';

test('verify character creator tactical token selector and preview', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000');

    console.log('Waiting for loading to finish...');
    await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 30000 });

    console.log('Waiting for NEW GAME button...');
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    await newGameBtn.waitFor({ state: 'visible', timeout: 30000 });

    console.log('Force opening Character Creator on Appearance step...');
    await page.evaluate(() => {
      (window as any).__PLAYWRIGHT_TEST_STEP__ = 'appearance';
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(2000);

    await page.waitForTimeout(1000);

    console.log('Taking screenshot of initial Appearance step...');
    await page.screenshot({ path: 'verification/character_creation_token_initial.png' });

    // Let's click on a specific token, e.g. Ranger Bow or Bard Lute
    console.log('Selecting Ranger Bow token...');
    const tokenButton = page.locator('button[title="Ranger (Bow)"]');
    await tokenButton.click();

    await page.waitForTimeout(1000);

    console.log('Taking final screenshot...');
    await page.screenshot({ path: 'verification/character_creation_token.png' });
    console.log('Successfully completed verification test!');
});
