import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('DevKit Modular Shell & Extracted Boundaries', () => {
  it('verifies DevKit.tsx orchestration shell file exists and is modularized', () => {
    const devkitPath = path.resolve(process.cwd(), 'src/components/devkit/DevKit.tsx');
    assert.strictEqual(fs.existsSync(devkitPath), true);

    const content = fs.readFileSync(devkitPath, 'utf8');
    assert.strictEqual(content.includes('import { EntityWorkbench } from \'./generators/EntityWorkbench\';'), true);
    assert.strictEqual(content.includes('import { HabitatGenerator } from \'./generators/HabitatGenerator\';'), true);
    assert.strictEqual(content.includes('import { HueStudio } from \'./hardware/HueStudio\';'), true);
    assert.strictEqual(content.includes('<EntityWorkbench'), true);
    assert.strictEqual(content.includes('<HabitatGenerator'), true);
    assert.strictEqual(content.includes('<HueStudio />'), true);

    // Check line count reduction (original was ~2554 lines)
    const lineCount = content.split('\n').length;
    assert.strictEqual(lineCount < 400, true, `Expected line count < 400, got ${lineCount}`);
  });

  it('verifies EntityWorkbench generator module exists', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/devkit/generators/EntityWorkbench.tsx');
    assert.strictEqual(fs.existsSync(filePath), true);

    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content.includes('export const EntityWorkbench'), true);
    assert.strictEqual(content.includes('EnemyImageGenerator'), true);
    assert.strictEqual(content.includes('EquipmentImageGenerator'), true);
    assert.strictEqual(content.includes('MaterialImageGenerator'), true);
  });

  it('verifies HabitatGenerator module exists', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/devkit/generators/HabitatGenerator.tsx');
    assert.strictEqual(fs.existsSync(filePath), true);

    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content.includes('export const HabitatGenerator'), true);
    assert.strictEqual(content.includes('BACKGROUND_CONFIGS'), true);
    assert.strictEqual(content.includes('generateBackgroundImage'), true);
  });

  it('verifies HueStudio hardware module exists', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/devkit/hardware/HueStudio.tsx');
    assert.strictEqual(fs.existsSync(filePath), true);

    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content.includes('export const HueStudio'), true);
    assert.strictEqual(content.includes('useHueStore'), true);
    assert.strictEqual(content.includes('LampCard'), true);
    assert.strictEqual(content.includes('LampControls'), true);
  });
});
