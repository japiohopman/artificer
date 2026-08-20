import { test, expect } from '@playwright/test';

test('character architecture single source of truth verification', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000');

  console.log('Waiting for stores on window...');
  await page.waitForFunction(() => (window as any).useCharacterStore !== undefined);

  // 1. Character Weight Calculations (V1, V2, Currency, Quantity, Empty)
  console.log('Verifying character weight calculation across inventory models...');
  const weightResults = await page.evaluate(async () => {
    const { calculateCharacterWeight } = await import('./src/lib/inventoryUtils');

    // Test A: Empty inventory
    const emptyChar: any = {
      id: 'empty_char',
      name: 'Empty Hero',
      inventory: {},
      backpack: [],
      money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };
    const emptyWeight = calculateCharacterWeight(emptyChar);

    // Test B: V1 Legacy inventory + backpack + money
    const v1Char: any = {
      id: 'v1_char',
      name: 'V1 Hero',
      saveVersion: 1,
      inventory: {
        chest: { name: 'Chain Mail', weight: 55, quantity: 1 },
        main_hand: { name: 'Longsword', weight: 3, quantity: 1 }
      },
      backpack: [
        { name: 'Rations', weight: '2 lbs', quantity: 5 }, // 10 lbs
        { name: 'Torch', weight: 1, quantity: 2 } // 2 lbs
      ],
      money: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 } // 50 coins = 1 lb (50 coins per lb rule)
    };
    const v1Weight = calculateCharacterWeight(v1Char); // 55 + 3 + 10 + 2 + 1 = 71 lbs

    // Test C: V2 Registry-based items
    const v2Char: any = {
      id: 'v2_char',
      name: 'V2 Hero',
      saveVersion: 2,
      items: {
        inst_1: { id: 'inst_1', template: 'plate_armor', weight: 65, quantity: 1 },
        inst_2: { id: 'inst_2', template: 'shield', weight_lbs: 6, quantity: 1 },
        inst_3: { id: 'inst_3', template: 'potion', metadata: { weight: 0.5 }, quantity: 4 } // 2 lbs
      },
      money: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 } // 100 coins = 2 lbs
    };
    const v2Weight = calculateCharacterWeight(v2Char); // 65 + 6 + 2 + 2 = 75 lbs

    return { emptyWeight, v1Weight, v2Weight };
  });

  console.log('Weight results:', weightResults);
  expect(weightResults.emptyWeight).toBe(0);
  expect(weightResults.v1Weight).toBe(71);
  expect(weightResults.v2Weight).toBe(75);

  // 2. Character A/B Switching Verification
  console.log('Verifying A/B Character Switching isolation and state persistence...');
  const switchResults = await page.evaluate(async () => {
    const store = (window as any).useCharacterStore.getState();

    const charA: any = {
      id: 'char_a',
      name: 'Thorin',
      class: 'Fighter',
      level: 5,
      hp: 45,
      maxHp: 45,
      stats: { str: 18, dex: 12, con: 16, int: 10, wis: 10, cha: 8 },
      inventory: { main_hand: { name: 'Greatsword', weight: 6 } }
    };

    const charB: any = {
      id: 'char_b',
      name: 'Elrond',
      class: 'Wizard',
      level: 5,
      hp: 28,
      maxHp: 28,
      stats: { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 12 },
      inventory: { main_hand: { name: 'Staff', weight: 4 } }
    };

    // Load both characters into active party session
    store.setCharacters([charA, charB]);

    // Activate A
    await store.setActiveCharacter('char_a');
    const active1 = (window as any).useCharacterStore.getState().characters.find((c: any) => c.id === (window as any).useCharacterStore.getState().activeCharacterId);

    // Activate B
    await store.setActiveCharacter('char_b');
    const active2 = (window as any).useCharacterStore.getState().characters.find((c: any) => c.id === (window as any).useCharacterStore.getState().activeCharacterId);

    // Modify B's HP
    store.updateCharacter('char_b', { hp: 20 });
    const bUpdated = (window as any).useCharacterStore.getState().characters.find((c: any) => c.id === 'char_b');

    // Switch back to A
    await store.setActiveCharacter('char_a');
    const active3 = (window as any).useCharacterStore.getState().characters.find((c: any) => c.id === (window as any).useCharacterStore.getState().activeCharacterId);

    return {
      active1Name: active1?.name,
      active1Str: active1?.stats?.str,
      active2Name: active2?.name,
      active2Int: active2?.stats?.int,
      bHp: bUpdated?.hp,
      active3Name: active3?.name,
      aHp: active3?.hp
    };
  });

  expect(switchResults.active1Name).toBe('Thorin');
  expect(switchResults.active1Str).toBe(18);
  expect(switchResults.active2Name).toBe('Elrond');
  expect(switchResults.active2Int).toBe(18);
  expect(switchResults.bHp).toBe(20);
  expect(switchResults.active3Name).toBe('Thorin');
  expect(switchResults.aHp).toBe(45); // Thorin's HP was unaffected by B's mutation

  // 3. Save Slot Integrity Verification
  console.log('Verifying save slot integrity in mainCharacterSlots...');
  const slotResults = await page.evaluate(async () => {
    const charStore = (window as any).useCharacterStore;

    const slot1Char: any = { id: 'slot1', name: 'Slot 1 Hero', level: 1 };
    const slot2Char: any = { id: 'slot2', name: 'Slot 2 Hero', level: 2 };

    charStore.getState().setMainCharacterSlots([slot1Char, slot2Char, null]);
    const slots = charStore.getState().mainCharacterSlots;

    // Call setMainCharacter on slot1 (emulating Continue)
    await charStore.getState().setMainCharacter(slot1Char);
    const slotsAfterContinue = charStore.getState().mainCharacterSlots;
    const activeSessionChar = charStore.getState().characters[0]?.name;

    return {
      slot1Name: slots[0]?.name,
      slot2Name: slots[1]?.name,
      slot3IsNull: slots[2] === null,
      slotsPreserved: slotsAfterContinue[0]?.id === 'slot1' && slotsAfterContinue[1]?.id === 'slot2',
      activeSessionChar
    };
  });

  expect(slotResults.slot1Name).toBe('Slot 1 Hero');
  expect(slotResults.slot2Name).toBe('Slot 2 Hero');
  expect(slotResults.slot3IsNull).toBe(true);
  expect(slotResults.slotsPreserved).toBe(true);
  expect(slotResults.activeSessionChar).toBe('Slot 1 Hero');

  console.log('✓ All Character Architecture verification assertions passed!');
});
