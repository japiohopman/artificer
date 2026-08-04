import { test, expect } from '@playwright/test';

test('verify system settings and authenticators', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000');

    console.log('Waiting for React and store initialization...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

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

    // Switch to Tab 3: Philips Hue
    console.log('Clicking Philips Hue tab...');
    await page.click('button:has-text("Philips Hue")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/settings_hue.png' });
    console.log('Tab 3: Philips Hue screenshot saved.');

    // Switch to Tab 4: General & Models
    console.log('Clicking General & Models tab...');
    await page.click('button:has-text("General & Models")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/settings_general.png' });
    console.log('Tab 4: General & Models screenshot saved.');
});
