import { test, expect } from '@playwright/test';

test('character architecture single source of truth verification', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000');

  console.log('Waiting for stores on window...');
  await page.waitForFunction(() => (window as any).useCharacterStore !== undefined);

  // 1. Save Slot Integrity Verification
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

  // 2. DOM Rendering Verification for Hero Preview
  console.log('Verifying DOM rendering of CharacterStats on TitleScreen preview...');
  await page.locator('.aspect-\\[9\\/16\\]').first().click();
  await expect(page.locator('text=VITALS & COMBAT READINESS')).toBeVisible();

  console.log('✓ All Character Architecture E2E assertions passed!');
});
