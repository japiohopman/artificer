import { test, expect } from '@playwright/test';

test('verify combat grid and action panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000');

  // Wait for TitleScreen to be visible
  await page.waitForSelector('h1:has-text("Dungeons")');

  // Bypass TitleScreen using store if possible, or click "New Game"
  // Let's use evaluate to force state if available
  await page.evaluate(() => {
    const uiStore = (window as any).useUIStore.getState();
    const gameStore = (window as any).useGameStore.getState();
    
    gameStore.setIsGameStarted(true);
    uiStore.setGameMode('combat');
    gameStore.startCombat();
  });

  // Wait for HUD/CombatGrid to render
  await page.waitForSelector('canvas', { timeout: 10000 });

  // Take screenshot of the combat grid
  await page.screenshot({ path: 'docs/screenshots/combat_hud_canvas_grid.png' });

  // Verify "Toggle Grid" button exists
  const toggleBtn = page.locator('button[title="Toggle Grid"]');
  await expect(toggleBtn).toBeVisible();

  // Try to click it
  await toggleBtn.click({ force: true }); 

  // Verify ActionPanel is visible (it should be in combat mode anyway)
  await page.waitForSelector('text=Attack', { timeout: 5000 });
  
  // Capture a zoomed in version of the action panel
  await page.screenshot({ 
    path: 'docs/screenshots/action_panel_zoom.png',
    clip: { x: 300, y: 100, width: 680, height: 500 } // Center area
  });

  console.log('Screenshots captured successfully');
});
