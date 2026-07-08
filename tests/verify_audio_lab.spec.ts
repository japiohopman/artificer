import { test, expect } from '@playwright/test';

test('verify audio lab in devkit', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for title screen
  await page.waitForSelector('text=NEW GAME', { timeout: 15000 });
  await page.click('text=NEW GAME');
  
  // Wait for HUD/Genesis Ritual to appear
  await page.waitForSelector('text=THE GENESIS RITUAL', { timeout: 15000 });
  
  // Open DevKit using Shift+D
  await page.keyboard.press('Shift+D');
  
  // Check if DevKit is open
  await page.waitForSelector('text=DEV KIT', { timeout: 5000 });
  await page.screenshot({ path: 'verification/devkit_open_raw.png' });

  // Click on AUDIO_LAB tab
  // Based on my previous write to DevKit.tsx:
  // { id: 'AUDIO_LAB', label: 'AUDIO LAB', icon: 'volume-high' },
  await page.click('button:has-text("AUDIO LAB")');
  
  // Wait for Audio Laboratory content
  await page.waitForSelector('text=Audio Laboratory', { timeout: 5000 });
  await page.waitForSelector('text=Sound Explorer', { timeout: 5000 });
  await page.waitForSelector('text=Audio Requester', { timeout: 5000 });

  // Select a sound from the manifest
  await page.selectOption('select', 'fireball');
  
  // Verify lighting info is shown
  await page.waitForSelector('text=Lighting Effect:', { timeout: 2000 });
  await page.waitForSelector('text=fire_pulse', { timeout: 2000 });

  await page.screenshot({ path: 'verification/audio_lab_active.png', fullPage: true });
  
  console.log('Audio Laboratory verified successfully');
});
