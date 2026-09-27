import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Shared Atlas Sheet System Architecture (#311)', () => {
  const atlasSheetFramePath = path.join(__dirname, '../src/components/atlas/sheet/AtlasSheetFrame.tsx');
  const spellSheetPath = path.join(__dirname, '../src/components/atlas/SpellSheet.tsx');
  const equipmentCardPath = path.join(__dirname, '../src/components/atlas/EquipmentCard.tsx');
  const materialCardPath = path.join(__dirname, '../src/components/atlas/MaterialCard.tsx');
  const monsterCardPath = path.join(__dirname, '../src/components/atlas/MonsterCard.tsx');
  const godCardPath = path.join(__dirname, '../src/components/atlas/GodCard.tsx');

  test('verifies AtlasSheetFrame primitives exist and export expected components', () => {
    assert.equal(fs.existsSync(atlasSheetFramePath), true);
    const source = fs.readFileSync(atlasSheetFramePath, 'utf8');

    expectSourceToContain(source, 'export const AtlasSheetFrame');
    expectSourceToContain(source, 'export const AtlasSheetHeader');
    expectSourceToContain(source, 'export const AtlasSheetMedia');
    expectSourceToContain(source, 'export const AtlasSheetInfoGrid');
    expectSourceToContain(source, 'export const AtlasSheetInfoBlock');
    expectSourceToContain(source, 'export const AtlasSheetBody');
    expectSourceToContain(source, 'export const AtlasSheetFooter');
  });

  test('verifies SpellSheet consumes AtlasSheetFrame primitives', () => {
    assert.equal(fs.existsSync(spellSheetPath), true);
    const source = fs.readFileSync(spellSheetPath, 'utf8');

    expectSourceToContain(source, "from './sheet/AtlasSheetFrame'");
    expectSourceToContain(source, '<AtlasSheetFrame');
    expectSourceToContain(source, '<AtlasSheetHeader');
    expectSourceToContain(source, '<AtlasSheetInfoGrid');
    expectSourceToContain(source, '<AtlasSheetMedia');
    expectSourceToContain(source, '<AtlasSheetBody');
    expectSourceToContain(source, '<AtlasSheetFooter');
  });

  test('verifies EquipmentCard consumes AtlasSheetFrame primitives for card presentation', () => {
    assert.equal(fs.existsSync(equipmentCardPath), true);
    const source = fs.readFileSync(equipmentCardPath, 'utf8');

    expectSourceToContain(source, "from './sheet/AtlasSheetFrame'");
    expectSourceToContain(source, '<AtlasSheetFrame');
    expectSourceToContain(source, '<AtlasSheetHeader');
    expectSourceToContain(source, '<AtlasSheetMedia');
    expectSourceToContain(source, '<AtlasSheetBody');
    expectSourceToContain(source, '<AtlasSheetFooter');
    // Ensure compact inspector and tile variants remain intact
    expectSourceToContain(source, "variant === 'inspector'");
    expectSourceToContain(source, "variant === 'tile'");
  });

  test('verifies MaterialCard consumes AtlasSheetFrame primitives', () => {
    assert.equal(fs.existsSync(materialCardPath), true);
    const source = fs.readFileSync(materialCardPath, 'utf8');

    expectSourceToContain(source, "from './sheet/AtlasSheetFrame'");
    expectSourceToContain(source, '<AtlasSheetFrame');
    expectSourceToContain(source, '<AtlasSheetHeader');
    expectSourceToContain(source, '<AtlasSheetMedia');
    expectSourceToContain(source, '<AtlasSheetBody');
    expectSourceToContain(source, '<AtlasSheetFooter');
  });

  test('verifies MonsterCard consumes AtlasSheetFrame primitives', () => {
    assert.equal(fs.existsSync(monsterCardPath), true);
    const source = fs.readFileSync(monsterCardPath, 'utf8');

    expectSourceToContain(source, "from './sheet/AtlasSheetFrame'");
    expectSourceToContain(source, '<AtlasSheetFrame');
    expectSourceToContain(source, '<AtlasSheetHeader');
    expectSourceToContain(source, '<AtlasSheetMedia');
    expectSourceToContain(source, '<AtlasSheetBody');
    expectSourceToContain(source, '<AtlasSheetFooter');
  });

  test('verifies GodCard consumes AtlasSheetFrame primitives', () => {
    assert.equal(fs.existsSync(godCardPath), true);
    const source = fs.readFileSync(godCardPath, 'utf8');

    expectSourceToContain(source, "from './sheet/AtlasSheetFrame'");
    expectSourceToContain(source, '<AtlasSheetFrame');
    expectSourceToContain(source, '<AtlasSheetHeader');
    expectSourceToContain(source, '<AtlasSheetMedia');
    expectSourceToContain(source, '<AtlasSheetBody');
    expectSourceToContain(source, '<AtlasSheetFooter');
  });
});

function expectSourceToContain(source: string, substring: string) {
  assert.equal(
    source.includes(substring),
    true,
    `Expected source to contain "${substring}"`
  );
}
