import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Helper to register local Playwright route mocking for GitHub directory listing API requests and save commits
async function setupApiRouteMocks(page: any) {
    // Intercept server file commit calls to prevent mutating character_save slot fixtures during test runs
    await page.route('**/api/commit', async (route: any) => {
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, local: true, github: false })
        });
    });

    await page.route('**/api/fetch?url=*', async (route: any) => {
        const urlParam = route.request().url().split('url=')[1];
        const decodedUrl = decodeURIComponent(urlParam || '');

        // Mock GitHub contents API calls using local directory listings
        if (decodedUrl.includes('/contents/public/assets/atlas/species/json/14')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/species/json/14');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/species/json/14/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/species/json/24')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/species/json/24');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/species/json/24/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/alignments/json')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/alignments/json');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/alignments/json/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/backgrounds/json/14')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/backgrounds/json/14');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/backgrounds/json/14/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/backgrounds/json/24')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/backgrounds/json/24');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/backgrounds/json/24/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/class/json/14')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/class/json/14');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/class/json/14/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }
        if (decodedUrl.includes('/contents/public/assets/atlas/class/json/24')) {
            const dirPath = path.resolve(process.cwd(), 'public/assets/atlas/class/json/24');
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).map(f => ({ name: f, path: `public/assets/atlas/class/json/24/${f}` }));
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(files) });
        }

        // Continue unhandled routes normally
        return route.continue();
    });
}

test.describe('Guided Character Creator E2E Stability & Multi-Ruleset Flows', () => {
    test.setTimeout(60000);

    test('2014 Guided Character Creator Flow completes through review and final persistence', async ({ page }) => {
        await setupApiRouteMocks(page);
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
        console.log('1. Verifying Welcome Step & Ruleset Context (2014)...');
        await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
        await expect(page.locator('button:has-text("D&D 5e (2014)")')).toBeVisible();
        await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();

        // Explicitly select 2014 ruleset
        await page.click('button:has-text("D&D 5e (2014)")');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 2. Save Slot Step
        console.log('2. Verifying Save Slot Step...');
        await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();
        await page.click('button:has-text("Slot_01")');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 3. Identity Step (Manifested Polarity)
        console.log('3. Verifying Identity Step...');
        await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();
        await page.click('text=Male');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 4. Species Step
        console.log('4. Verifying Species Step (2014)...');
        await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Human' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Human' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Examine Records: Human')).toBeVisible();

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 5. Class Step
        console.log('5. Verifying Class Step (2014)...');
        await expect(page.locator('text=Choose Class')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Fighter' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Fighter' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Examine Records: Fighter')).toBeVisible();

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 6. Background Step (Origins)
        console.log('6. Verifying Background Step (2014)...');
        await expect(page.locator('text=Character Origins')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Acolyte' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Acolyte' }).click();
        await page.waitForTimeout(500);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 7. Alignment Step
        console.log('7. Verifying Alignment Step...');
        await expect(page.locator('button', { hasText: 'Lawful Good' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Lawful Good' }).click();
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

        // 10. Equipment Step (Fighter is non-spellcaster -> Spells step skipped)
        console.log('10. Verifying Equipment Step...');
        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 11. Appearance Step
        console.log('11. Verifying Appearance Step...');
        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 12. Describe Your Character Step (Backstory)
        console.log('12. Verifying Backstory Step & Moniker...');
        await expect(page.locator('text=Soul Moniker (Character Name)')).toBeVisible();
        await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Arthur 2014');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 13. Review Step (Final Manifest)
        console.log('13. Verifying Review Step (Final Manifest 2014)...');
        await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Arthur 2014' }).first()).toBeVisible();
        await expect(page.getByText('Level 0 fighter')).toBeVisible();
        await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5e (2014)');

        await page.screenshot({ path: 'verification/character_creator_guided_review.png' });

        // 14. Final Persistence / Manifestation Step
        console.log('14. Committing character manifestation via #finish-creation-btn...');
        await page.click('#finish-creation-btn');
        await page.waitForTimeout(1000);

        // Verify character creator closed and character persisted in store
        await page.waitForFunction(() => {
            const charStore = (window as any).useCharacterStore?.getState();
            const uiStore = (window as any).useUIStore?.getState();
            return uiStore?.isCharacterCreatorOpen === false &&
                   charStore?.characters?.length > 0 &&
                   charStore?.characters[0]?.name === 'Arthur 2014' &&
                   charStore?.characters[0]?.ruleset === '2014' &&
                   charStore?.characters[0]?.saveVersion === 2;
        });

        console.log('✓ 2014 guided character creator flow and final persistence verified!');
    });

    test('2024 Guided Character Creator Flow completes through review and final persistence', async ({ page }) => {
        await setupApiRouteMocks(page);
        await page.goto('http://localhost:3000');

        console.log('Waiting for React stores...');
        await page.waitForFunction(() => (window as any).useGameStore !== undefined && (window as any).useUIStore !== undefined);

        console.log('Opening Character Creator for 2024 flow...');
        await page.evaluate(() => {
          if ((window as any).useGameStore) {
            (window as any).useGameStore.setState({ isGameStarted: true });
          }
          if ((window as any).useUIStore) {
            (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
          }
        });

        await page.waitForTimeout(1000);

        // 1. Welcome Step & Ruleset Selection (2024)
        console.log('1. Verifying Welcome Step & Ruleset Context (2024)...');
        await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
        await page.click('button:has-text("D&D 5.5e (2024)")');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 2. Save Slot Step
        console.log('2. Verifying Save Slot Step...');
        await page.click('button:has-text("Slot_02")');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 3. Identity Step
        console.log('3. Verifying Identity Step...');
        await page.click('text=Female');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 4. Species Step (2024 Goliath)
        console.log('4. Verifying Species Step (2024 Goliath)...');
        await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Goliath' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Goliath' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Examine Records: Goliath')).toBeVisible();

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 5. Class Step (2024 Paladin)
        console.log('5. Verifying Class Step (2024 Paladin)...');
        await expect(page.locator('text=Choose Class')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Paladin' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Paladin' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Examine Records: Paladin')).toBeVisible();

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 6. Background Step (2024 Soldier)
        console.log('6. Verifying Background Step (2024 Origin Background)...');
        await expect(page.locator('text=Character Origins')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Soldier' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Soldier' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Examine Records: Soldier')).toBeVisible();

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 7. Alignment Step
        console.log('7. Verifying Alignment Step...');
        await expect(page.locator('button', { hasText: 'Lawful Good' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Lawful Good' }).click();
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

        // 10. Arcana / Spells Step (Paladin is a spellcaster)
        console.log('10. Verifying Spells / Arcana Step (Paladin)...');
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

        // 13. Describe Your Character Step
        console.log('13. Verifying Backstory Step & Moniker...');
        await expect(page.locator('text=Soul Moniker (Character Name)')).toBeVisible();
        await page.fill('input[placeholder="Enter Character Name or Moniker..."]', 'Valeria 2024');
        await page.waitForTimeout(300);

        await page.click('#next-stage-btn');
        await page.waitForTimeout(500);

        // 14. Review Step (Final Manifest 2024)
        console.log('14. Verifying Review Step (Final Manifest 2024)...');
        await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Valeria 2024' }).first()).toBeVisible();
        await expect(page.getByText('Level 0 paladin')).toBeVisible();
        await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5.5e (2024)');

        await page.screenshot({ path: 'verification/character_creator_2024_review.png' });

        // 15. Final Persistence / Manifestation Step
        console.log('15. Committing character manifestation via #finish-creation-btn...');
        await page.click('#finish-creation-btn');
        await page.waitForTimeout(1000);

        // Verify character creator closed and character persisted in store
        await page.waitForFunction(() => {
            const charStore = (window as any).useCharacterStore?.getState();
            const uiStore = (window as any).useUIStore?.getState();
            return uiStore?.isCharacterCreatorOpen === false &&
                   charStore?.characters?.length > 0 &&
                   charStore?.characters[0]?.name === 'Valeria 2024' &&
                   charStore?.characters[0]?.ruleset === '2024' &&
                   charStore?.characters[0]?.saveVersion === 2;
        });

        console.log('✓ 2024 guided character creator flow and final persistence verified!');
    });

    test('Switching rulesets clears stale rules-sensitive selections and equipment', async ({ page }) => {
        await setupApiRouteMocks(page);
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

        // 1. Select 2014 ruleset initially
        await page.click('button:has-text("D&D 5e (2014)")');
        await page.waitForTimeout(300);
        await page.click('#next-stage-btn'); // Go to Slot step
        await page.waitForTimeout(300);
        await page.click('button:has-text("Slot_01")');
        await page.click('#next-stage-btn'); // Go to Identity step
        await page.click('text=Male');
        await page.click('#next-stage-btn'); // Go to Species step

        // Select 2014 species (Human)
        await expect(page.locator('button', { hasText: 'Human' })).toBeVisible({ timeout: 10000 });
        await page.locator('button', { hasText: 'Human' }).click();
        await page.waitForTimeout(300);

        // Go back to Welcome step using sidebar
        const welcomeSidebarBtn = page.locator('#creator-sidebar button[title="Welcome"]');
        await welcomeSidebarBtn.click();
        await page.waitForTimeout(500);

        // Switch to 2024 ruleset
        console.log('Switching ruleset to D&D 5.5e (2024)...');
        await page.click('button:has-text("D&D 5.5e (2024)")');
        await page.waitForTimeout(500);

        // Navigate forward to Species step (Welcome -> Slot -> Identity -> Species)
        await page.click('#next-stage-btn'); // Welcome -> Slot
        await page.waitForTimeout(300);
        await page.click('#next-stage-btn'); // Slot -> Identity
        await page.waitForTimeout(300);
        await page.click('#next-stage-btn'); // Identity -> Species
        await page.waitForTimeout(500);

        // Verify species step now shows 2024 top-level species (Goliath) and previous selection (Human) is cleared
        await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Goliath' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Examine Records: Human')).not.toBeVisible();

        console.log('✓ Ruleset switch state reset verified successfully!');
    });
});
