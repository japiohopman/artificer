import { test, expect } from '@playwright/test';

test('verify tactical hud and grid refactor', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for title screen
  await page.waitForSelector('text=CONTINUE ADVENTURE');
  
  // Click continue to go to HUD
  await page.click('text=CONTINUE ADVENTURE');
  
  // Wait for HUD to load
  await page.waitForSelector('.world-panel', { timeout: 30000 });
  
  // Take screenshot of world map with new HUD
  await page.screenshot({ path: 'docs/screenshots/game_hud.png' });
  
  // Switch to tactical grid
  await page.keyboard.press('KeyG');
  
  // Wait for combat grid canvas
  await page.waitForSelector('canvas', { timeout: 10000 });
  
  // Take screenshot of tactical grid
  await page.screenshot({ path: 'docs/screenshots/tactical_view.png' });
  
  console.log('Verification screenshots saved to docs/screenshots/');
});
