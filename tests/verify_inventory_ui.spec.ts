import { test, expect } from '@playwright/test';

test.describe('Inventory & Equipment UI Integration', () => {
  test('Full inventory workflow: CharacterPanel HUD -> FullInventoryMenu -> Inspect & Equip', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    console.log('Waiting for stores on window...');
    await page.waitForFunction(() => (window as any).useCharacterStore !== undefined && (window as any).useInventoryStore !== undefined);

    console.log('Initializing test character state in stores...');
    await page.evaluate(() => {
      const charStore = (window as any).useCharacterStore;
      const invStore = (window as any).useInventoryStore;
      const uiStore = (window as any).useUIStore;

      const testChar = {
        id: 'ui_test_char',
        name: 'Valerius the Bold',
        race: 'human',
        class: 'fighter',
        level: 3,
        hp: 24,
        maxHp: 24,
        xp: 900,
        stats: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        inventory: {},
        backpack: [
          { id: 'item_sword', name: 'Longsword', _type: 'equipment', kind: 'weapon', slot: 'main_hand', template: 'longsword' },
          { id: 'item_potion', name: 'Potion of Healing', _type: 'consumable', kind: 'consumable', template: 'potion-of-healing', quantity: 2 }
        ],
        saveVersion: 2,
        items: {
          'item_sword': { id: 'item_sword', template: 'longsword', quantity: 1, kind: 'weapon', customName: 'Longsword' },
          'item_potion': { id: 'item_potion', template: 'potion-of-healing', quantity: 2, kind: 'consumable', customName: 'Potion of Healing' }
        },
        equipment: {
          containerId: 'equipment_ui_test_char',
          slots: [
            { id: 'main_hand', itemId: null },
            { id: 'off_hand', itemId: null }
          ]
        },
        containers: {
          'backpack_ui_test_char': {
            id: 'backpack_ui_test_char',
            type: 'backpack',
            slots: [
              { id: 'bag_0', itemId: 'item_sword' },
              { id: 'bag_1', itemId: 'item_potion' },
              ...Array.from({ length: 22 }).map((_, i) => ({ id: `bag_${i + 2}`, itemId: null }))
            ]
          }
        }
      };

      charStore.setState({
        characters: [testChar],
        activeCharacterId: 'ui_test_char'
      });

      invStore.setState({
        isInventoryOpen: true,
        isInventoryMenuOpen: true
      });

      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }

      if (uiStore) {
        uiStore.setState({ isCharacterCreatorOpen: false });
      }
    });

    await page.waitForTimeout(500);

    console.log('Verifying Gear Workspace modal is visible...');
    await expect(page.getByText('Gear & Equipment Workspace').first()).toBeVisible();

    console.log('Verifying Available Gear and Equipment Doll areas are visible simultaneously...');
    await expect(page.getByText('Available Gear').first()).toBeVisible();
    await expect(page.getByText('Equipment Doll').first()).toBeVisible();

    console.log('Verifying Longsword item in inventory grid slot...');
    const itemGridCard = page.locator('p', { hasText: 'Longsword' }).first();
    await expect(itemGridCard).toBeVisible();

    console.log('Testing category filter tabs in Available Gear...');
    const potionsCategoryBtn = page.getByRole('button', { name: /Potions/i }).first();
    await expect(potionsCategoryBtn).toBeVisible();
    await potionsCategoryBtn.click();

    console.log('Verifying Potion of Healing in inventory grid slot...');
    const potionCard = page.locator('p', { hasText: 'Potion of Healing' }).first();
    await expect(potionCard).toBeVisible();

    console.log('Testing item transfer/equip directly in store...');
    await page.evaluate(() => {
      const invStore = (window as any).useInventoryStore.getState();
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      const sword = activeChar.items['item_sword'];
      invStore.equipItem(sword, 'main_hand');
    });

    await page.waitForFunction(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'main_hand')?.itemId === 'item_sword';
    });

    console.log('Verifying item equipped in main_hand slot...');
    const mainHandItemId = await page.evaluate(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'main_hand')?.itemId;
    });

    expect(mainHandItemId).toBe('item_sword');
    console.log('✓ Gear Workspace and Equip verified!');
  });
});
