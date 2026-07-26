import { test, expect } from '@playwright/test';

test('verify game over screen overlay', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000');

    console.log('Waiting for loading to finish...');
    await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 30000 });

    console.log('Waiting for NEW GAME button...');
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    await newGameBtn.waitFor({ state: 'visible', timeout: 30000 });

    console.log('Force Starting Game & Triggering Game Over State...');
    await page.evaluate(() => {
      (window as any).useGameStore.setState({ isGameStarted: true });
      (window as any).useUIStore.setState({ isCharacterCreatorOpen: false, isGameOver: true });
    });

    console.log('Verifying Game Over Screen...');
    await page.waitForSelector('text=UW GEZELSCHAP IS GESNEUVELD', { timeout: 15000 });

    // Assert elements are visible
    await expect(page.locator('text=Laad Laatste Save')).toBeVisible();
    await expect(page.locator('text=Terug naar Hoofdmenu')).toBeVisible();

    // Take screenshots for verification
    await page.screenshot({ path: 'verification/game_over_screen.png' });
    console.log('Screenshot saved to verification/game_over_screen.png');
});
