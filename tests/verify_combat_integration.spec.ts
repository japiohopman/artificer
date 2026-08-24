import { test, expect } from '@playwright/test';

test.describe('Combat Integration v1 — Playwright Verification', () => {
  test('loads canonical battle map in CombatTester and verifies CombatGrid population', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/');

    // Wait for the window store objects or app root to load
    await page.waitForFunction(() => !!(window as any).useGameStore && !!(window as any).useUIStore);

    // Ensure game is started and DevKit is open
    await page.evaluate(() => {
      (window as any).useGameStore.setState({ isGameStarted: true });
      const uiStore = (window as any).useUIStore.getState();
      uiStore.setIsDevKitOpen(true);
    });

    // Click on 'TESTERS' tab in DevKit header
    const testersTab = page.locator('button').filter({ hasText: 'TESTERS' });
    await expect(testersTab).toBeVisible({ timeout: 10000 });
    await testersTab.click();

    // Click on 'Tactical Combat' sub-tab
    const combatSubTab = page.locator('button').filter({ hasText: 'Tactical Combat' });
    await expect(combatSubTab).toBeVisible({ timeout: 5000 });
    await combatSubTab.click();

    // Select canonical integration test map in the Custom Map dropdown
    const mapSelect = page.locator('select').filter({ hasText: '-- Select Map --' });
    await expect(mapSelect).toBeVisible({ timeout: 10000 });

    // Wait for option CANONICAL INTEGRATION MAP to be attached to DOM
    const targetOption = mapSelect.locator('option').filter({ hasText: /CANONICAL INTEGRATION MAP/i });
    await expect(targetOption).toBeAttached({ timeout: 15000 });

    const optionValue = await targetOption.getAttribute('value');
    await mapSelect.selectOption({ value: optionValue || 'canonical_integration_map' });

    // Wait for the game store combatState grid to update
    await page.waitForFunction(() => (window as any).useGameStore.getState().combatState.grid.length === 10, { timeout: 5000 });

    // Verify game store state was populated with canonical map data
    const combatState = await page.evaluate(() => (window as any).useGameStore.getState().combatState);
    expect(combatState.grid.length).toBe(10);
    expect(combatState.grid[0].length).toBe(12);
    expect(combatState.monsters.some((m: any) => m.name === 'Goblin Scout')).toBe(true);
    expect(combatState.playerPos).toEqual({ x: 2, y: 2 });
    expect(combatState.walls.length).toBe(2);

    // Take screenshot for verification
    await page.screenshot({ path: 'public/assets/screenshots/verify_combat_integration.png' });
  });
});
