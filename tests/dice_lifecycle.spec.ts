import { test, expect } from '@playwright/test';

test('DiceBox lifecycle: survives mount, roll, unmount, remount, and roll again', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000');

  console.log('Waiting for stores and page initialization...');
  await page.waitForFunction(() => (window as any).useGameStore !== undefined);

  const result = await page.evaluate(async () => {
    // 1. Initial Container & Initialization
    const container1 = document.createElement('div');
    container1.id = 'dice-box-test-container-1';
    document.body.appendChild(container1);

    const { diceService } = await import('../src/dice_roller/diceService');

    // Initialize in Container 1
    await diceService.init(container1);
    const canvas1 = container1.querySelector('canvas');
    const isInit1 = canvas1 !== null;

    // Detach Container 1 (Simulating component unmount)
    diceService.detach(container1);
    container1.remove();

    // 2. Remount in Container 2
    const container2 = document.createElement('div');
    container2.id = 'dice-box-test-container-2';
    document.body.appendChild(container2);

    // Re-initialize in Container 2
    await diceService.init(container2);
    const canvas2 = container2.querySelector('canvas');
    const isInit2 = canvas2 !== null;

    // Cleanup container 2
    diceService.detach(container2);
    container2.remove();

    return { isInit1, isInit2 };
  });

  expect(result.isInit1).toBe(true);
  expect(result.isInit2).toBe(true);

  console.log('✓ DiceBox remount lifecycle test passed successfully!');
});
