import { test, expect } from '@playwright/test';

test('verify audio lab in devkit', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('http://localhost:3000');
    
    console.log('Waiting for loading to finish...');
    await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 60000 });
    
    console.log('Waiting for NEW GAME button...');
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    await newGameBtn.waitFor({ state: 'visible', timeout: 30000 });
    
    console.log('Clicking NEW GAME...');
    await newGameBtn.click();
    
    console.log('Waiting for THE GENESIS RITUAL...');
    await page.waitForSelector('text=THE GENESIS RITUAL', { timeout: 30000 });

    console.log('Pressing Alt+D...');
    await page.focus('body');
    await page.keyboard.down('Alt');
    await page.keyboard.press('KeyD');
    await page.keyboard.up('Alt');
    
    console.log('Waiting for DevKit (ARCANE_OS)...');
    await page.waitForSelector('text=ARCANE_OS', { timeout: 30000 });

    console.log('Clicking AUDIO LAB tab...');
    await page.click('text=AUDIO LAB');
    
    console.log('Verifying Audio Laboratory...');
    await page.waitForSelector('text=Audio Laboratory', { timeout: 10000 });
    
    await expect(page.locator('text=explosion_large.wav')).toBeVisible();
    await expect(page.locator('text=thunder.wav')).toBeVisible();
    
    await page.screenshot({ path: 'verification/audio_lab_explorer.png' });
    
    console.log('Verifying REQUESTER tab...');
    await page.click('text=REQUESTER');
    await page.waitForSelector('text=Signal Sunny', { timeout: 10000 });
    await page.screenshot({ path: 'verification/audio_lab_requester.png' });
});
