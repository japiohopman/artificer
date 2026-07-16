import { test, expect } from '@playwright/test';

test('verify combat grid and action panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000');

  // Wait for TitleScreen
  await page.waitForSelector('h1:has-text("Dungeons")');

  // Force Start
  await page.evaluate(() => {
    const uiStore = (window as any).useUIStore.getState();
    const gameStore = (window as any).useGameStore.getState();
    
    gameStore.setIsGameStarted(true);
    uiStore.setGameMode('combat');
    gameStore.startCombat();
  });

  // Wait for loading screen to disappear
  await page.waitForSelector('text=Decrypting Save Data', { state: 'detached', timeout: 30000 });

  // Wait for Canvas
  await page.waitForSelector('canvas:not(.dice-box-canvas)', { timeout: 15000 });
  await page.screenshot({ path: 'docs/screenshots/combat_hud_canvas_grid.png' });

  // Check for End Turn button in ActionPanel
  await page.waitForSelector('text=End Turn', { timeout: 10000 });
  
  await page.screenshot({ 
    path: 'docs/screenshots/action_panel_zoom.png',
    clip: { x: 300, y: 500, width: 680, height: 220 } 
  });

  console.log('Screenshots captured successfully');
});
