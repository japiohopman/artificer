import { test, expect } from '@playwright/test';

test('verify hud currency and weight footer with character', async ({ page }) => {
  const mockChar = {
    id: 'slot1',
    name: 'Adran the Bold',
    class: 'Fighter',
    race: 'Elf',
    level: 3,
    xp: 900,
    alignment: 'Neutral Good',
    background: 'Soldier',
    stats: { str: 10, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    proficiencies: [],
    traits: [],
    features: [],
    flaws: [],
    ideals: [],
    bonds: [],
    backstory: 'A veteran of many battles.',
    languages: ['Common', 'Elvish'],
    appearance: { hairColor: 'Silver', hairStyle: 'Long', bodyType: 'Athletic', eyeColor: 'Green', skinColor: 'Fair', height: "6'0\"", weight: '165 lbs' },
    inventory: {
      'sword': { name: 'Longsword', weight: 3, quantity: 1 },
      'shield': { name: 'Shield', weight: 6, quantity: 1 }
    },
    backpack: [
      { name: 'Rations', weight: 2, quantity: 5 }
    ],
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {},
    choices: {},
    hp: 28,
    maxHp: 28,
    money: { cp: 12, sp: 8, ep: 0, gp: 150, pp: 3 }
  };

  // Route interception to return empty github contents
  await page.route('**/api/fetch?url=*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Intercept local fallback requests for slot1.json
  await page.route('**/data/character_save/json/slot1.json*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockChar)
    });
  });

  await page.route('**/data/slot1.json*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockChar)
    });
  });

  await page.goto('http://localhost:3000');
  
  // Wait for React / stores to be available on window
  await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useCharacterStore !== undefined);

  // Force start game now that mock character is the active state
  await page.evaluate(() => {
    const gameStore = (window as any).useGameStore;
    if (gameStore) {
      gameStore.getState().setIsGameStarted(true);
    }
    const charStore = (window as any).useCharacterStore;
    if (charStore) {
      charStore.getState().setActiveCharacter('slot1');
    }
  });

  // Wait for the game panel / HUD to be fully loaded and visible
  await page.waitForSelector('.world-panel', { timeout: 30000 });
  
  // Wait for the HUDFooter to render with Active Character text
  const footerText = page.locator('text=Active Character: Adran the Bold');
  await expect(footerText).toBeVisible({ timeout: 15000 });

  // Assert presence of currency elements (GP, PP, CP, SP) using specific titles
  const gpText = page.locator('div[title="Gold: 150"] span');
  await expect(gpText).toBeVisible();
  
  const ppText = page.locator('div[title="Platinum: 3"] span');
  await expect(ppText).toBeVisible();

  // Assert presence of weight loading information
  const loadInfo = page.locator('text=Load:');
  await expect(loadInfo).toBeVisible();
  
  const weightText = page.locator('text=22.5 / 150 lbs');
  await expect(weightText).toBeVisible();

  // Take a high-quality verification screenshot
  await page.screenshot({ path: 'docs/screenshots/verify_footer_complete.png' });
  console.log('Successfully verified HUDFooter with simulated active character.');
});
