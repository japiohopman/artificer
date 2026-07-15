import { test, expect } from '@playwright/test';

test('verify hud currency and weight footer with character', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for React / stores to be available on window
  await page.waitForFunction(() => (window as any).useGameStore !== undefined);
  
  // 1. Force start game first so that the engine's initial loads run
  await page.evaluate(() => {
    const uiStore = (window as any).useUIStore;
    if (uiStore) {
      uiStore.setState({
        isWorldPanelOpen: true,
        isCharacterPanelOpen: true
      });
    }

    const gameStore = (window as any).useGameStore;
    if (gameStore) {
      gameStore.setState({
        isGameStarted: true
      });
    }
  });

  // 2. Wait for decrypting/loading to disappear
  await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 30000 });
  await page.waitForSelector('text=Decrypting Save Data...', { state: 'detached', timeout: 30000 });

  // 3. Inject our mock character now that the initial load is complete
  await page.evaluate(() => {
    const mockChar = {
      id: 'test-hero',
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
      appearance: { hairColor: 'Silver', hairStyle: 'Long', bodyType: 'Athletic', eyeColor: 'Green', skinColor: 'Fair', height: '6\'0"', weight: '165 lbs' },
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

    const charStore = (window as any).useCharacterStore;
    if (charStore) {
      charStore.setState({
        characters: [mockChar],
        activeCharacterId: 'test-hero'
      });
    }
  });
  
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
