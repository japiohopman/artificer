import { test, expect } from '@playwright/test';

test('verify system settings and authenticators', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000');

    console.log('Waiting for loading to finish...');
    await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 30000 });

    console.log('Waiting for NEW GAME button...');
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    await newGameBtn.waitFor({ state: 'visible', timeout: 30000 });

    await page.screenshot({ path: 'verification/debug_title_screen.png' });
    console.log('Saved debug_title_screen.png');

    console.log('Checking global window state...');
    const storeExists = await page.evaluate(() => {
      return {
        hasGameStore: typeof (window as any).useGameStore !== 'undefined',
        hasUIStore: typeof (window as any).useUIStore !== 'undefined',
      };
    });
    console.log('Store exists:', storeExists);

    console.log('Force Starting Game & Triggering Settings Modal State...');
    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: false, isSettingsOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/debug_after_state.png' });
    console.log('Saved debug_after_state.png');

    console.log('Verifying Settings Modal...');
    await page.waitForSelector('text=System Settings & Calibration', { timeout: 15000 });

    // Take screenshot of Tab 1: Audio
    await page.screenshot({ path: 'verification/settings_audio.png' });
    console.log('Tab 1: Audio screenshot saved.');

    // Switch to Tab 2: Authenticator
    console.log('Clicking Authenticator tab...');
    await page.click('button:has-text("Authenticator")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/settings_auth.png' });
    console.log('Tab 2: Authenticator screenshot saved.');

    // Switch to Tab 3: General & Models
    console.log('Clicking General & Models tab...');
    await page.click('button:has-text("General & Models")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/settings_general.png' });
    console.log('Tab 3: General & Models screenshot saved.');
});
