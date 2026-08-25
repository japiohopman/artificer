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

    console.log('Verifying CharacterPanel HUD is visible...');
    await expect(page.getByRole('heading', { name: 'Valerius the Bold' })).toBeVisible();

    console.log('Clicking Full Inventory entry point button...');
    const fullInvBtn = page.getByRole('button', { name: /Full Inventory/i });
    await expect(fullInvBtn).toBeVisible();
    await fullInvBtn.click();

    console.log('Verifying FullInventoryMenu modal opens...');
    await expect(page.getByText('Grand Party Manifest')).toBeVisible();
    await expect(page.getByText('Unified Inventory Management System')).toBeVisible();

    console.log('Inspecting item in Vault Backpack...');
    const itemGridCard = page.locator('div[title*="Longsword"]').first();
    await expect(itemGridCard).toBeVisible();
    await itemGridCard.click();

    console.log('Verifying Item Inspection panel updates...');
    await expect(page.getByText('Inspecting Item')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Longsword' })).toBeVisible();

    console.log('Equipping item via Inspection panel...');
    const equipBtn = page.getByRole('button', { name: /Equip Item/i });
    await expect(equipBtn).toBeVisible();
    await equipBtn.click();

    console.log('Verifying item equipped in canonical store state...');
    const mainHandItemId = await page.evaluate(() => {
      const charStore = (window as any).useCharacterStore.getState();
      const activeChar = charStore.characters.find((c: any) => c.id === 'ui_test_char');
      if (activeChar?.equipment?.slots) {
        return activeChar.equipment.slots.find((s: any) => s.id === 'main_hand')?.itemId;
      }
      return activeChar?.inventory?.['main_hand']?.id || activeChar?.inventory?.['main-hand']?.id;
    });

    expect(mainHandItemId).toBe('item_sword');

    console.log('Testing category filter tabs in Vault Backpack...');
    const potionsCategoryBtn = page.getByRole('button', { name: /Potions/i }).first();
    await expect(potionsCategoryBtn).toBeVisible();
    await potionsCategoryBtn.click();

    console.log('Verifying 9:16 item card geometry (max 5 columns)...');
    const firstCard = page.locator('div[title*="Potion of Healing"]').first();
    await expect(firstCard).toBeVisible();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const ratio = box.width / box.height;
      expect(ratio).toBeGreaterThan(0.4);
      expect(ratio).toBeLessThan(0.8);
    }

    console.log('Verifying party storage panel is accessible...');
    const partyStorageHeader = page.getByText('Party Storage');
    await expect(partyStorageHeader).toBeVisible();

    console.log('Performing browser drag-and-drop gesture from Vault Backpack to Party Storage...');
    const sourceElement = page.locator('div[title*="Potion of Healing"]').first();
    const targetElement = page.locator('div:has-text("SHARED PARTY ARMORY")').first();

    await sourceElement.scrollIntoViewIfNeeded();
    await targetElement.scrollIntoViewIfNeeded();

    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (sourceBox && targetBox) {
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await page.mouse.down();
      // Move past PointerSensor activation distance threshold (5px)
      await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 15, sourceBox.y + sourceBox.height / 2 + 15, { steps: 5 });
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
      await page.mouse.up();
    }

    await page.waitForTimeout(500);

    console.log('Verifying item transfer updated canonical party state...');
    const partyItems = await page.evaluate(() => {
      const invStore = (window as any).useInventoryStore.getState();
      return invStore.partyInventory;
    });

    expect(partyItems.length).toBeGreaterThan(0);
    console.log('✓ Browser drag & drop interaction verified!');
  });
});
