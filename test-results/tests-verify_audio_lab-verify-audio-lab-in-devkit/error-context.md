# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify_audio_lab.spec.ts >> verify audio lab in devkit
- Location: tests/verify_audio_lab.spec.ts:3:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('text=THE GENESIS RITUAL') to be visible
    6 × waiting for" http://localhost:3000/" navigation to finish...
      - navigated to "http://localhost:3000/"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e8]:
    - generic [ref=e9]:
      - img [ref=e12]
      - heading "Dungeons Dragons" [level=1] [ref=e15]:
        - generic [ref=e16]: Dungeons
        - img [ref=e17]
        - generic [ref=e19]: Dragons
      - paragraph [ref=e20]: The Arcane Forge & Database
    - generic [ref=e21]:
      - generic [ref=e22]:
        - heading "New Game" [level=2] [ref=e23]
        - button "New Game" [ref=e24]:
          - generic [ref=e26]:
            - img [ref=e27]
            - generic [ref=e29]: New Game
        - paragraph [ref=e30]: "\"Create a fresh identity in the codex. Existing manifest in chosen slot will be purged.\""
      - generic [ref=e31]:
        - heading "Continue Adventure" [level=2] [ref=e32]
        - generic [ref=e33]:
          - button "Slot 01 Empty Slot" [disabled] [ref=e34]:
            - generic [ref=e36]:
              - generic [ref=e38]: Slot 01
              - heading "Empty Slot" [level=3] [ref=e39]
          - button "Slot 02 Empty Slot" [disabled] [ref=e40]:
            - generic [ref=e42]:
              - generic [ref=e44]: Slot 02
              - heading "Empty Slot" [level=3] [ref=e45]
          - button "Slot 03 Empty Slot" [disabled] [ref=e46]:
            - generic [ref=e48]:
              - generic [ref=e50]: Slot 03
              - heading "Empty Slot" [level=3] [ref=e51]
        - button "Continue Adventure" [disabled] [ref=e52]:
          - generic [ref=e53]:
            - img [ref=e54]
            - generic [ref=e56]: Continue Adventure
    - generic [ref=e57]: Version 3.0.0 // Prime Protocol
  - generic [ref=e58]:
    - img "Loading Art" [ref=e60]
    - generic [ref=e62]:
      - img [ref=e66]
      - generic [ref=e68]:
        - generic [ref=e71]: Chronicles of Artificer
        - heading "Decrypting Save Data..." [level=2] [ref=e73]
        - paragraph [ref=e74]: The threads of fate are weaving together...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify audio lab in devkit', async ({ page }) => {
  4  |     test.setTimeout(120000);
  5  |
  6  |     await page.goto('http://localhost:3000');
  7  |
  8  |     console.log('Waiting for loading to finish...');
  9  |     await page.waitForSelector('text=DECRYPTING SAVE DATA...', { state: 'detached', timeout: 60000 });
  10 |
  11 |     console.log('Waiting for NEW GAME button...');
  12 |     const newGameBtn = page.getByRole('button', { name: 'New Game' });
  13 |     await newGameBtn.waitFor({ state: 'visible', timeout: 30000 });
  14 |
  15 |     console.log('Clicking NEW GAME...');
  16 |     await newGameBtn.click();
  17 |
  18 |     console.log('Waiting for THE GENESIS RITUAL...');
> 19 |     await page.waitForSelector('text=THE GENESIS RITUAL', { timeout: 30000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
  20 |
  21 |     console.log('Pressing Shift+D...');
  22 |     await page.focus('body');
  23 |     await page.keyboard.down('Shift');
  24 |     await page.keyboard.press('KeyD');
  25 |     await page.keyboard.up('Shift');
  26 |
  27 |     console.log('Waiting for DevKit (ARCANE_OS)...');
  28 |     await page.waitForSelector('text=ARCANE_OS', { timeout: 30000 });
  29 |
  30 |     console.log('Clicking AUDIO LAB tab...');
  31 |     await page.click('text=AUDIO LAB');
  32 |
  33 |     console.log('Verifying Audio Laboratory...');
  34 |     await page.waitForSelector('text=Audio Laboratory', { timeout: 10000 });
  35 |
  36 |     await expect(page.locator('text=explosion_large.wav')).toBeVisible();
  37 |     await expect(page.locator('text=thunder.wav')).toBeVisible();
  38 |
  39 |     await page.screenshot({ path: 'verification/audio_lab_explorer.png' });
  40 |
  41 |     console.log('Verifying REQUESTER tab...');
  42 |     await page.click('text=REQUESTER');
  43 |     await page.waitForSelector('text=Signal Sunny', { timeout: 10000 });
  44 |     await page.screenshot({ path: 'verification/audio_lab_requester.png' });
  45 | });
  46 |
```