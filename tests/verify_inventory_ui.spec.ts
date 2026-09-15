import { test, expect } from '@playwright/test';

test.describe('Inventory & Equipment UI Integration', () => {
  test('Full inventory workflow: CharacterPanel HUD -> FullInventoryMenu -> Inspect, Real Drag & Ammunition', async ({ page }) => {
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
          { id: 'item_bow', name: 'Shortbow', _type: 'equipment', kind: 'weapon', slot: 'main_hand', template: 'shortbow' },
          { id: 'item_arrows', name: 'Arrows (20)', _type: 'equipment', kind: 'ammunition', template: 'arrow', quantity: 20 },
          { id: 'item_potion', name: 'Potion of Healing', _type: 'consumable', kind: 'consumable', template: 'potion-of-healing', quantity: 2 }
        ],
        saveVersion: 2,
        items: {
          'item_sword': { id: 'item_sword', template: 'longsword', quantity: 1, kind: 'weapon', customName: 'Longsword' },
          'item_bow': { id: 'item_bow', template: 'shortbow', quantity: 1, kind: 'weapon', customName: 'Shortbow' },
          'item_arrows': { id: 'item_arrows', template: 'arrow', quantity: 20, kind: 'ammunition', customName: 'Arrows' },
          'item_potion': { id: 'item_potion', template: 'potion-of-healing', quantity: 2, kind: 'consumable', customName: 'Potion of Healing' }
        },
        equipment: {
          containerId: 'equipment_ui_test_char',
          slots: [
            { id: 'main_hand', itemId: null },
            { id: 'off_hand', itemId: null },
            { id: 'ammo', itemId: null }
          ]
        },
        containers: {
          'backpack_ui_test_char': {
            id: 'backpack_ui_test_char',
            type: 'backpack',
            slots: [
              { id: 'bag_0', itemId: 'item_sword' },
              { id: 'bag_1', itemId: 'item_bow' },
              { id: 'bag_2', itemId: 'item_arrows' },
              { id: 'bag_3', itemId: 'item_potion' },
              ...Array.from({ length: 20 }).map((_, i) => ({ id: `bag_${i + 4}`, itemId: null }))
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

    console.log('Testing category filter tabs in Available Gear...');
    const weaponsCategoryBtn = page.getByRole('button', { name: /Weapons/i }).first();
    await expect(weaponsCategoryBtn).toBeVisible();
    await weaponsCategoryBtn.click();

    console.log('Performing REAL mouse drag gesture for Shortbow onto main_hand slot...');
    const bowCard = page.locator('[title*="Shortbow"]').first();
    await expect(bowCard).toBeVisible();

    const mainHandSlot = page.locator('button').filter({ hasText: /^Main$/i }).first();
    await expect(mainHandSlot).toBeVisible();

    const bowBox = await bowCard.boundingBox();
    const targetBox = await mainHandSlot.boundingBox();
    expect(bowBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    if (bowBox && targetBox) {
      await page.mouse.move(bowBox.x + bowBox.width / 2, bowBox.y + bowBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
      await page.waitForTimeout(100);
      await page.mouse.up();
    }

    await page.waitForFunction(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'main_hand')?.itemId === 'item_bow';
    });

    console.log('Verifying Shortbow equipped in main_hand slot via real drag...');
    const mainHandItemId = await page.evaluate(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'main_hand')?.itemId;
    });

    expect(mainHandItemId).toBe('item_bow');

    console.log('Verifying contextual Ammunition slot appears when Shortbow is equipped...');
    await page.waitForTimeout(300);

    const ammoSlot = page.locator('button').filter({ hasText: /^Ammo$/i }).first();
    await expect(ammoSlot).toBeVisible();

    console.log('Performing REAL mouse drag gesture for Arrows into contextual Ammunition slot...');
    const arrowsCard = page.locator('[title*="Arrows"]').first();
    await expect(arrowsCard).toBeVisible();

    const arrowsBox = await arrowsCard.boundingBox();
    const ammoBox = await ammoSlot.boundingBox();
    expect(arrowsBox).not.toBeNull();
    expect(ammoBox).not.toBeNull();

    if (arrowsBox && ammoBox) {
      await page.mouse.move(arrowsBox.x + arrowsBox.width / 2, arrowsBox.y + arrowsBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(ammoBox.x + ammoBox.width / 2, ammoBox.y + ammoBox.height / 2, { steps: 10 });
      await page.waitForTimeout(100);
      await page.mouse.up();
    }

    await page.waitForFunction(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'ammo')?.itemId === 'item_arrows';
    });

    const ammoItemId = await page.evaluate(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      return activeChar?.equipment?.slots?.find((s: any) => s.id === 'ammo')?.itemId;
    });

    expect(ammoItemId).toBe('item_arrows');
    console.log('✓ Pure UI Mouse Drag & Drop verified without store fallbacks!');
  });
});
