import { test, expect } from '@playwright/test';

test('verify audio lab in devkit', async ({ page }) => {
    test.setTimeout(120000);

    page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
    page.on('pageerror', err => console.error('[BROWSER EXCEPTION]', err));

    await page.goto('http://localhost:3000');
    
    console.log('Waiting for React and store initialization...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    console.log('Force Starting Game & Opening DevKit...');
    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: false, isDevKitOpen: true, isLoading: false });
      }
    });

    console.log('Waiting for DevKit (ARCANE_OS)...');
    await page.waitForSelector('text=ARCANE_OS', { timeout: 30000 });

    console.log('Clicking AUDIO LAB tab...');
    await page.click('text=AUDIO LAB');
    
    console.log('Verifying Audio Laboratory...');
    await page.waitForSelector('text=Audio Laboratory', { timeout: 10000 });
    
    await expect(page.locator('text=explosion_large.wav')).toBeVisible();
    await expect(page.locator('text=thunder.wav')).toBeVisible();
    
    await page.screenshot({ path: 'verification/audio_lab_explorer.png' });
});
