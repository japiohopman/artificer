import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SLOT1_PATH = path.resolve(process.cwd(), 'public/data/character_save/json/slot1.json');
let initialSlot1Content: string | null = null;

test.beforeAll(() => {
  if (fs.existsSync(SLOT1_PATH)) {
    initialSlot1Content = fs.readFileSync(SLOT1_PATH, 'utf8');
  }
});

test.afterAll(() => {
  if (initialSlot1Content !== null && fs.existsSync(SLOT1_PATH)) {
    fs.writeFileSync(SLOT1_PATH, initialSlot1Content, 'utf8');
  }
});

test('verify complete guided character creator flow for 2014 ruleset', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    console.log('Waiting for React stores...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    console.log('Opening Character Creator...');
    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(1000);

    // 1. Welcome Step & Ruleset Selection
    console.log('1. Verifying Welcome Step & Ruleset Context...');
    await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5e (2014)")')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

    // Select 2014 ruleset framework
    await page.click('button:has-text("D&D 5e (2014)")');
    await page.waitForTimeout(300);

    // Click Continue to go to Save Slot step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step
    console.log('2. Verifying Save Slot Step...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Select Slot 1
    console.log('Selecting Slot 1...');
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Continue to Identity step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step (Manifested Polarity)
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    // Select Male
    await page.click('span:has-text("Male")');
    await page.waitForTimeout(300);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step
    console.log('4. Verifying Species Step & 3:2 Aspect Ratio Cards...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    await expect(page.locator('button:has-text("Human")')).toBeVisible();

    // Select Human
    await page.click('button:has-text("Human")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: human')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step
    console.log('5. Verifying Class Step & 2:3 Aspect Ratio Cards...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    await expect(page.locator('button:has-text("Fighter")')).toBeVisible();

    // Select Fighter
    await page.click('button:has-text("Fighter")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: fighter')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (Origins)
    console.log('6. Verifying Background Step & 1:1 Aspect Ratio Cards...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    await expect(page.locator('button:has-text("Acolyte")')).toBeVisible();

    // Select Acolyte
    await page.click('button:has-text("Acolyte")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: acolyte')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    await expect(page.locator('button:has-text("Lawful Good")')).toBeVisible();

    // Select Lawful Good
    await page.click('button:has-text("Lawful Good")');
    await page.waitForTimeout(500);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 8. Attributes Step
    console.log('8. Verifying Attributes Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 9. Choices Step
    console.log('9. Verifying Choices Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 10. Equipment Step
    console.log('10. Verifying Equipment Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 11. Appearance Step
    console.log('11. Verifying Appearance Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 12. Describe Your Character Step
    console.log('12. Verifying Backstory Step (Deterministic Name & Backstory Auto-Population without LLM)...');
    // Verify name field is populated automatically or editable
    const nameVal = await page.inputValue('input[placeholder="Enter Character Name or Moniker..."]');
    if (!nameVal || !nameVal.trim()) {
      await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Arthur');
    }
    // Verify auto-populated backstory prose in textarea
    const backstoryVal = await page.inputValue('textarea[placeholder="Type your own backstory here..."]');
    expect(backstoryVal).toBeTruthy();
    expect(backstoryVal.length).toBeGreaterThan(50);

    await page.waitForTimeout(300);
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 13. Review Step (Final Manifest)
    console.log('13. Verifying Review Step (Final Manifest)...');
    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
    await expect(page.getByText('Arthur').first()).toBeVisible();
    await expect(page.getByText('Level 0 fighter')).toBeVisible();
    await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5e (2014)');

    console.log('✓ Playwright guided 2014 character creator flow test complete!');
});

test('verify complete guided character creator flow for 2024 ruleset', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    console.log('Waiting for React stores...');
    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    console.log('Opening Character Creator...');
    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(1000);

    // 1. Welcome Step & Ruleset Selection
    console.log('1. Verifying Welcome Step & 2024 Ruleset Context...');
    await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
    await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

    // Select 2024 ruleset framework
    await page.click('button:has-text("D&D 5.5e (2024)")');
    await page.waitForTimeout(300);

    // Click Continue to go to Save Slot step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 2. Save Slot Step
    console.log('2. Verifying Save Slot Step...');
    await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();

    // Select Slot 1
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);

    // Continue to Identity step
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 3. Identity Step
    console.log('3. Verifying Identity Step...');
    await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();

    // Select Female
    await page.click('span:has-text("Female")');
    await page.waitForTimeout(300);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 4. Species Step (2024)
    console.log('4. Verifying 2024 Species Step...');
    await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
    await expect(page.locator('button:has-text("Goliath")')).toBeVisible();

    // Select Goliath
    await page.click('button:has-text("Goliath")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: goliath')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 5. Class Step (2024)
    console.log('5. Verifying 2024 Class Step...');
    await expect(page.locator('text=Choose Class')).toBeVisible();
    await expect(page.locator('button:has-text("Paladin")')).toBeVisible();

    // Select Paladin
    await page.click('button:has-text("Paladin")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: paladin')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 6. Background Step (2024 Origins)
    console.log('6. Verifying 2024 Background Step...');
    await expect(page.locator('text=Character Origins')).toBeVisible();
    await expect(page.locator('button:has-text("Soldier")')).toBeVisible();

    // Select Soldier
    await page.click('button:has-text("Soldier")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: soldier')).toBeVisible();

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 7. Alignment Step
    console.log('7. Verifying Alignment Step...');
    await expect(page.locator('button:has-text("Neutral Good")')).toBeVisible();

    // Select Neutral Good
    await page.click('button:has-text("Neutral Good")');
    await page.waitForTimeout(500);

    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 8. Attributes Step
    console.log('8. Verifying Attributes Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 9. Choices Step
    console.log('9. Verifying Choices Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 10. Arcana / Spells Step (Paladin spellcaster)
    console.log('10. Verifying Spells Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 11. Equipment Step
    console.log('11. Verifying Equipment Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 12. Appearance Step
    console.log('12. Verifying Appearance Step...');
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 13. Backstory Step
    console.log('13. Verifying Backstory Step...');
    await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Freya');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn');
    await page.waitForTimeout(500);

    // 14. Review Step (Final Manifest)
    console.log('14. Verifying Review Step (Final Manifest)...');
    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
    await expect(page.getByText('Freya').first()).toBeVisible();
    await expect(page.getByText('Level 0 paladin')).toBeVisible();
    await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5.5e (2024)');

    // 15. Commit Final Manifest
    console.log('15. Clicking Manifest (#finish-creation-btn) and verifying canonical persistence...');
    await page.click('#finish-creation-btn');
    await page.waitForTimeout(1000);

    // Verify creator portal closes and character is persisted in useCharacterStore
    await expect(page.locator('#character-creator-portal')).not.toBeVisible();

    const activeCharName = await page.evaluate(() => {
      const store = (window as any).useCharacterStore?.getState();
      const activeChar = store?.characters?.find((c: any) => c.id === store?.activeCharacterId);
      return activeChar?.name;
    });

    expect(activeCharName).toBe('Freya');

    console.log('✓ Playwright guided 2024 character creator flow test complete with canonical store persistence!');
});

test('verify ruleset switch purges stale selections end-to-end', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(1000);

    // Start with 2014 ruleset
    await page.click('button:has-text("D&D 5e (2014)")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to slot
    await page.waitForTimeout(300);

    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to identity
    await page.waitForTimeout(300);

    await page.click('span:has-text("Male")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to species
    await page.waitForTimeout(300);

    // Select 2014 Species: Elf
    await page.click('button:has-text("Elf")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Examine Records: elf')).toBeVisible();

    // Now navigate back to Welcome step and switch to 2024 ruleset
    await page.locator('#creator-sidebar button').first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
    await page.click('button:has-text("D&D 5.5e (2024)")');
    await page.waitForTimeout(300);

    // Navigate back to Species step
    await page.click('#next-stage-btn'); // slot
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // identity
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // species
    await page.waitForTimeout(500);

    // Verify species selection was reset (no active "Examine Records: elf") and 2024 species (e.g. Goliath) are present
    await expect(page.locator('text=Examine Records: elf')).not.toBeVisible();
    await expect(page.locator('button:has-text("Goliath")')).toBeVisible();

    console.log('✓ End-to-end ruleset switch reset test complete!');
});

test('verify validation overlay trigger and navigation for incomplete character choices', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');

    await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

    await page.evaluate(() => {
      if ((window as any).useGameStore) {
        (window as any).useGameStore.setState({ isGameStarted: true });
      }
      if ((window as any).useUIStore) {
        (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
      }
    });

    await page.waitForTimeout(1000);

    console.log('Testing Validation Overlay trigger on incomplete character manifest...');
    await page.click('button:has-text("D&D 5e (2014)")');
    await page.waitForTimeout(300);

    // Set step to review via page window property if defined or navigate to review
    await page.evaluate(() => {
      // Set test step on window or trigger validation
      const creatorStage = document.querySelector('#creator-stage');
      if (creatorStage) {
        // Trigger finish directly or navigate step
      }
    });

    // Walk through steps to review without making required selections
    await page.click('#next-stage-btn'); // to slot
    await page.waitForTimeout(300);

    // Select Slot 1
    await page.click('button:has-text("Slot_01")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to identity
    await page.waitForTimeout(300);

    // Select Gender
    await page.click('span:has-text("Male")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to species
    await page.waitForTimeout(300);

    // Do NOT select species, select Class directly or jump to review step
    // In CharacterCreator, sidebar button for a step is enabled once activeIdx reaches that step.
    // So select Species: Human, Class: Fighter, Background: Acolyte, Alignment: Lawful Good to advance, but omit Moniker (Name).
    await page.click('button:has-text("Human")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to class
    await page.waitForTimeout(300);

    await page.click('button:has-text("Fighter")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to background
    await page.waitForTimeout(300);

    await page.click('button:has-text("Acolyte")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to alignment
    await page.waitForTimeout(300);

    await page.click('button:has-text("Lawful Good")');
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to stats
    await page.waitForTimeout(300);

    await page.click('#next-stage-btn'); // to choices
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to equipment
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to appearance
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to backstory (without entering name)
    await page.waitForTimeout(300);
    await page.click('#next-stage-btn'); // to review
    await page.waitForTimeout(500);

    await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();

    // Click Manifest button (#finish-creation-btn)
    await page.click('#finish-creation-btn');
    await page.waitForTimeout(500);

    // Expect Validation Overlay modal to pop up for missing character name!
    await expect(page.locator('text=Complete Your Character')).toBeVisible();
    await expect(page.locator('text=Character name is missing')).toBeVisible();

    // Click Jump button on missing item to jump directly to backstory step
    await page.locator('div').filter({ hasText: /^Soul Moniker/ }).getByRole('button', { name: 'Jump' }).click();
    await page.waitForTimeout(500);

    // Verify we jumped back to backstory step with name input
    await expect(page.locator('input[placeholder="Enter Character Name or Moniker..."]')).toBeVisible();
    console.log('✓ Validation Overlay trigger and jump navigation test complete!');
});
