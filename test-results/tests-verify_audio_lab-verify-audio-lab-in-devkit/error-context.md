# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify_audio_lab.spec.ts >> verify audio lab in devkit
- Location: tests/verify_audio_lab.spec.ts:3:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('text=THE GENESIS RITUAL') to be visible

```

# Page snapshot

```yaml
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
        - button "Slot 01 Lvl 0 koop" [ref=e34]:
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]: Slot 01
              - generic [ref=e39]: Lvl 0
            - heading "koop" [level=3] [ref=e40]
        - button "Slot 02 Lvl 0 han" [ref=e41]:
          - generic [ref=e43]:
            - generic [ref=e44]:
              - generic [ref=e45]: Slot 02
              - generic [ref=e46]: Lvl 0
            - heading "han" [level=3] [ref=e47]
        - button "Slot 03 Lvl 0 samuel" [ref=e48]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: Slot 03
              - generic [ref=e53]: Lvl 0
            - heading "samuel" [level=3] [ref=e54]
      - button "Continue Adventure" [disabled] [ref=e55]:
        - generic [ref=e56]:
          - img [ref=e57]
          - generic [ref=e59]: Continue Adventure
  - generic [ref=e60]: Version 3.0.0 // Prime Protocol
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('verify audio lab in devkit', async ({ page }) => {
  4  |   await page.goto('http://localhost:3000');
  5  |   
  6  |   // Wait for title screen
  7  |   await page.waitForSelector('text=NEW GAME', { timeout: 15000 });
  8  |   await page.click('text=NEW GAME');
  9  |   
  10 |   // Wait for HUD/Genesis Ritual to appear
> 11 |   await page.waitForSelector('text=THE GENESIS RITUAL', { timeout: 15000 });
     |              ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  12 |   
  13 |   // Open DevKit using Shift+D
  14 |   await page.keyboard.press('Shift+D');
  15 |   
  16 |   // Check if DevKit is open
  17 |   await page.waitForSelector('text=DEV KIT', { timeout: 5000 });
  18 |   await page.screenshot({ path: 'verification/devkit_open_raw.png' });
  19 | 
  20 |   // Click on AUDIO_LAB tab
  21 |   // Based on my previous write to DevKit.tsx:
  22 |   // { id: 'AUDIO_LAB', label: 'AUDIO LAB', icon: 'volume-high' },
  23 |   await page.click('button:has-text("AUDIO LAB")');
  24 |   
  25 |   // Wait for Audio Laboratory content
  26 |   await page.waitForSelector('text=Audio Laboratory', { timeout: 5000 });
  27 |   await page.waitForSelector('text=Sound Explorer', { timeout: 5000 });
  28 |   await page.waitForSelector('text=Audio Requester', { timeout: 5000 });
  29 | 
  30 |   // Select a sound from the manifest
  31 |   await page.selectOption('select', 'fireball');
  32 |   
  33 |   // Verify lighting info is shown
  34 |   await page.waitForSelector('text=Lighting Effect:', { timeout: 2000 });
  35 |   await page.waitForSelector('text=fire_pulse', { timeout: 2000 });
  36 | 
  37 |   await page.screenshot({ path: 'verification/audio_lab_active.png', fullPage: true });
  38 |   
  39 |   console.log('Audio Laboratory verified successfully');
  40 | });
  41 | 
```