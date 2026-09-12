import { describe, it, expect } from 'vitest';
import {
  resolveSpellVisualIdentity,
  resolveSpellVisualIdentityDetails,
  normalizeCanonicalSpellId
} from '../src/lib/spellVisuals/visualIdentity';
import {
  SPELL_SPRITE_SHEETS,
  SPELL_SPRITE_MANIFEST,
  getSpellSpriteSheetDefinition,
  getSpellSpriteCellForVisual,
  getAllSpellManifestMappings
} from '../src/lib/spellVisuals/spriteManifest';
import fs from 'fs';
import path from 'path';

describe('Spell Visual Asset Architecture & Contract Unit Tests', () => {

  describe('Canonical Identity Resolution', () => {
    it('resolves identical spell references from different sources to the exact same visual ID', () => {
      const spellA = resolveSpellVisualIdentity('magic_missile');
      const spellB = resolveSpellVisualIdentity('magic-missile');
      const spellC = resolveSpellVisualIdentity('1st-level/magic_missile.json');

      expect(spellA).toBe('spell.magic_missile');
      expect(spellB).toBe('spell.magic_missile');
      expect(spellC).toBe('spell.magic_missile');
    });

    it('resolves distinct spells to distinct visual IDs', () => {
      const fireball = resolveSpellVisualIdentity('fireball');
      const shield = resolveSpellVisualIdentity('shield');

      expect(fireball).toBe('spell.fireball');
      expect(shield).toBe('spell.shield');
      expect(fireball).not.toBe(shield);
    });

    it('normalizes common spell alias variations correctly', () => {
      expect(resolveSpellVisualIdentity('acid-arrow')).toBe('spell.acid_arrow');
      expect(resolveSpellVisualIdentity('melfs-acid-arrow')).toBe('spell.acid_arrow');
      expect(resolveSpellVisualIdentity('bigbys-hand')).toBe('spell.arcane_hand');
      expect(resolveSpellVisualIdentity('tashas-hideous-laughter')).toBe('spell.hideous_laughter');
    });
  });

  describe('Manifest & Grid Bounds Integrity', () => {
    it('ensures every READY standalone image path actually exists on disk', () => {
      const mappings = getAllSpellManifestMappings().filter(m => m.status === 'READY' && m.standalonePath);
      expect(mappings.length).toBeGreaterThan(0);

      mappings.forEach(mapping => {
        expect(mapping.standalonePath).toBeDefined();
        if (mapping.standalonePath) {
          const absolutePath = path.join(process.cwd(), 'public', mapping.standalonePath);
          expect(fs.existsSync(absolutePath), `File at ${mapping.standalonePath} for ${mapping.visualId} must exist`).toBe(true);
        }
      });
    });

    it('ensures all declared sprite sheet references are valid and coordinates are within bounds', () => {
      const mappings = getAllSpellManifestMappings().filter(m => m.status === 'READY' && m.sheetId);

      mappings.forEach(mapping => {
        if (mapping.sheetId) {
          const sheet = getSpellSpriteSheetDefinition(mapping.sheetId);
          expect(sheet, `Sheet ${mapping.sheetId} referenced by ${mapping.visualId} must exist`).toBeDefined();
          if (sheet) {
            expect(mapping.row).toBeDefined();
            expect(mapping.col).toBeDefined();
            if (mapping.row !== undefined && mapping.col !== undefined) {
              expect(mapping.row).toBeGreaterThanOrEqual(0);
              expect(mapping.col).toBeGreaterThanOrEqual(0);
              expect(mapping.row).toBeLessThan(sheet.grid.rows);
              expect(mapping.col).toBeLessThan(sheet.grid.cols);
            }
          }
        }
      });
    });
  });

  describe('PLANNED vs READY Semantics', () => {
    it('verifies PLANNED spells have no renderable cell or fake coordinates', () => {
      const plannedSpell = getSpellSpriteCellForVisual('spell.arms_of_hadar');
      expect(plannedSpell).toBeDefined();
      expect(plannedSpell?.status).toBe('PLANNED');
      expect(plannedSpell?.row).toBeUndefined();
      expect(plannedSpell?.col).toBeUndefined();
      expect(plannedSpell?.sheetId).toBeUndefined();
    });

    it('verifies PLANNED spells with explicit fallbackVisualId resolve to a valid READY fallback mapping', () => {
      const plannedSpell = getSpellSpriteCellForVisual('spell.arms_of_hadar');
      expect(plannedSpell?.fallbackVisualId).toBe('spell.inflict_wounds');

      const fallbackMapping = getSpellSpriteCellForVisual(plannedSpell!.fallbackVisualId!);
      expect(fallbackMapping).toBeDefined();
      expect(fallbackMapping?.status).toBe('READY');
    });
  });

  describe('Graceful Fallback Handling', () => {
    it('handles unknown or unmapped spell references gracefully', () => {
      const unknownVisual = resolveSpellVisualIdentity('non_existent_spell_999');
      expect(unknownVisual).toBe('spell.non_existent_spell_999');

      const mapping = getSpellSpriteCellForVisual(unknownVisual);
      expect(mapping).toBeUndefined();
    });
  });

  describe('Regression: Zero Legacy wiki_image or Legacy Sprite Fields in Spell Assets', () => {
    it('ensures no spell JSON file contains wiki_image, wiki_image/wiki_image, sprite_index, or sprite_sheet', () => {
      const spellDir = path.join(process.cwd(), 'public/assets/atlas/spell/json');
      function scanDir(dir: string) {
        for (const file of fs.readdirSync(dir)) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
          } else if (file.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            expect(content.includes('wiki_image'), `File ${file} should not contain wiki_image`).toBe(false);
            expect(content.includes('sprite_index'), `File ${file} should not contain sprite_index`).toBe(false);
            expect(content.includes('sprite_sheet'), `File ${file} should not contain sprite_sheet`).toBe(false);

            const data = JSON.parse(content);
            expect(data.sprite, `File ${file} must have canonical sprite object`).toBeDefined();
            expect(data.sprite.atlas).toBe('spell');
            expect(data.sprite.sheet).toBeDefined();
            expect(data.sprite.sheet.includes('/')).toBe(false);
          }
        }
      }
      scanDir(spellDir);
    });

    it('ensures index_14.json and index_24.json do not contain wiki_image or legacy sprite fields', () => {
      const index14Path = path.join(process.cwd(), 'public/assets/atlas/spell/index_14.json');
      const index24Path = path.join(process.cwd(), 'public/assets/atlas/spell/index_24.json');

      const content14 = fs.readFileSync(index14Path, 'utf8');
      const content24 = fs.readFileSync(index24Path, 'utf8');

      expect(content14.includes('wiki_image')).toBe(false);
      expect(content14.includes('sprite_index')).toBe(false);
      expect(content14.includes('sprite_sheet')).toBe(false);

      expect(content24.includes('wiki_image')).toBe(false);
      expect(content24.includes('sprite_index')).toBe(false);
      expect(content24.includes('sprite_sheet')).toBe(false);
    });

    it('verifies canonical sprite metadata sheet resolves to an existing asset under public/assets/atlas/spell/sprites/ or images/', () => {
      const spellDir = path.join(process.cwd(), 'public/assets/atlas/spell/json');
      function verifyResolution(dir: string) {
        for (const file of fs.readdirSync(dir)) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            verifyResolution(fullPath);
          } else if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            const sheetName = data.sprite?.sheet;
            expect(sheetName).toBeDefined();

            const spritePath = path.join(process.cwd(), 'public/assets/atlas/spell/sprites', sheetName);
            const imagePath = path.join(process.cwd(), 'public/assets/atlas/spell/images', sheetName);
            const exists = fs.existsSync(spritePath) || fs.existsSync(imagePath);

            expect(exists, `Sheet ${sheetName} for spell ${file} must exist under public/assets/atlas/spell/sprites/ or images/`).toBe(true);
          }
        }
      }
      verifyResolution(spellDir);
    });
  });
});
