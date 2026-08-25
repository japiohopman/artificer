import { describe, it, expect } from 'vitest';
import {
  resolveVisualIdentity,
  resolveVisualIdentityDetails,
  normalizeCanonicalId
} from '../src/lib/inventoryVisuals/visualIdentity';
import {
  SPRITE_SHEETS,
  SPRITE_MANIFEST,
  getSpriteSheetDefinition,
  getSpriteCellForVisual,
  getAllManifestMappings
} from '../src/lib/inventoryVisuals/spriteManifest';
import { EQUIPMENT_PACKS, getPackContents } from '../src/lib/itemPacks';
import fs from 'fs';
import path from 'path';

describe('Inventory Visual Asset Contract Unit Tests', () => {

  describe('Visual Identity Resolution', () => {
    it('resolves identical canonical items from different sources to the exact same visual ID', () => {
      const fighterLongsword = resolveVisualIdentity('longsword');
      const soldierLongsword = resolveVisualIdentity('longsword');
      const npcLongsword = resolveVisualIdentity('14/weapon/longsword');

      expect(fighterLongsword).toBe('equipment.longsword');
      expect(soldierLongsword).toBe('equipment.longsword');
      expect(npcLongsword).toBe('equipment.longsword');
    });

    it('resolves different items to distinct visual IDs', () => {
      const longsword = resolveVisualIdentity('longsword');
      const dagger = resolveVisualIdentity('dagger');
      const rapier = resolveVisualIdentity('rapier');

      expect(longsword).toBe('equipment.longsword');
      expect(dagger).toBe('equipment.dagger');
      expect(rapier).toBe('equipment.rapier');

      expect(longsword).not.toBe(dagger);
      expect(dagger).not.toBe(rapier);
    });

    it('normalizes template aliases and hyphen/underscore variations cleanly', () => {
      expect(resolveVisualIdentity('crossbow_light')).toBe('equipment.light_crossbow');
      expect(resolveVisualIdentity('light-crossbow')).toBe('equipment.light_crossbow');
      expect(resolveVisualIdentity('hempen-rope-50-ft')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('rope-hempen-50-feet')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('rope')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('padded-armor')).toBe('equipment.padded_armor');
      expect(resolveVisualIdentity('padded')).toBe('equipment.padded_armor');
    });

    it('prevents source-specific duplicate visual ID naming', () => {
      const id = resolveVisualIdentity('longsword');
      expect(id).not.toContain('fighter');
      expect(id).not.toContain('soldier');
      expect(id).not.toContain('npc');
    });
  });

  describe('Ruleset Handling', () => {
    it('uses one visual ID when 2014 and 2024 items are visually equivalent', () => {
      const v14 = resolveVisualIdentity('longsword', '2014');
      const v24 = resolveVisualIdentity('longsword', '2024');

      expect(v14).toBe('equipment.longsword');
      expect(v24).toBe('equipment.longsword');
      expect(v14).toBe(v24);
    });

    it('reports isCustomRulesetVisual correctly when default visual applies', () => {
      const details14 = resolveVisualIdentityDetails('dagger', '2014');
      const details24 = resolveVisualIdentityDetails('dagger', '2024');

      expect(details14.visualId).toBe('equipment.dagger');
      expect(details24.visualId).toBe('equipment.dagger');
      expect(details14.isCustomRulesetVisual).toBe(false);
      expect(details24.isCustomRulesetVisual).toBe(false);
    });
  });

  describe('Sprite Manifest Integrity', () => {
    it('ensures every manifest entry references a valid sprite sheet definition', () => {
      const mappings = getAllManifestMappings();
      expect(mappings.length).toBeGreaterThan(0);

      mappings.forEach(mapping => {
        const sheet = getSpriteSheetDefinition(mapping.sheetId);
        expect(sheet).toBeDefined();
        expect(sheet?.path).toMatch(/^\/assets\/atlas\/equipment\/sprites\/[a-z0-9_]+\.webp$/);
      });
    });

    it('validates cell coordinates are non-negative integers', () => {
      const mappings = getAllManifestMappings();

      mappings.forEach(mapping => {
        expect(mapping.row).toBeGreaterThanOrEqual(0);
        expect(mapping.col).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(mapping.row)).toBe(true);
        expect(Number.isInteger(mapping.col)).toBe(true);
      });
    });

    it('ensures no duplicate cell coordinate assignments exist within the same sprite sheet', () => {
      const mappings = getAllManifestMappings();
      const occupiedCells = new Set<string>();

      mappings.forEach(mapping => {
        const key = `${mapping.sheetId}:${mapping.row}:${mapping.col}`;
        expect(occupiedCells.has(key)).toBe(false);
        occupiedCells.add(key);
      });
    });
  });

  describe('Starter Equipment & Pack Coverage Audit', () => {
    it('resolves every equipment pack choice to a dedicated pack visual ID', () => {
      const packKeys = Object.keys(EQUIPMENT_PACKS);
      expect(packKeys.length).toBeGreaterThan(0);

      packKeys.forEach(packKey => {
        const packVisual = resolveVisualIdentity(packKey);
        expect(packVisual).toMatch(/^equipment\.[a-z0-9_]+_pack$/);

        const mapping = getSpriteCellForVisual(packVisual);
        expect(mapping).toBeDefined();
        expect(mapping?.sheetId).toBe('starter_adventuring_01');
      });
    });

    it('resolves nested pack content items separately into individual inventory visual IDs', () => {
      const explorersContents = getPackContents('explorers-pack');
      expect(explorersContents).toBeDefined();
      expect(explorersContents?.length).toBeGreaterThan(0);

      explorersContents?.forEach(item => {
        const itemVisual = resolveVisualIdentity(item.template);
        expect(itemVisual).toMatch(/^equipment\.[a-z0-9_]+$/);

        const mapping = getSpriteCellForVisual(itemVisual);
        expect(mapping).toBeDefined();
      });
    });

    it('ensures all starter items referenced in real class JSON files resolve to manifest visual entries', () => {
      const classDir = path.join(process.cwd(), 'public/assets/atlas/class/json');
      const files = fs.readdirSync(classDir).filter(f => f.endsWith('.json'));

      files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(classDir, file), 'utf8'));

        const checkItemRefs = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.index && typeof obj.index === 'string' && obj.url && obj.url.includes('/equipment/')) {
            const visualId = resolveVisualIdentity(obj.index);
            const mapping = getSpriteCellForVisual(visualId);
            expect(mapping).toBeDefined();
          }
          for (const key of Object.keys(obj)) {
            checkItemRefs(obj[key]);
          }
        };

        checkItemRefs(content);
      });
    });

    it('ensures all starter items referenced in real background JSON files resolve to manifest visual entries', () => {
      const bgDir = path.join(process.cwd(), 'public/assets/atlas/backgrounds/json');
      const files = fs.readdirSync(bgDir).filter(f => f.endsWith('.json'));

      files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(bgDir, file), 'utf8'));

        const checkItemRefs = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.index && typeof obj.index === 'string' && obj.url && obj.url.includes('/equipment/')) {
            const visualId = resolveVisualIdentity(obj.index);
            const mapping = getSpriteCellForVisual(visualId);
            expect(mapping).toBeDefined();
          }
          for (const key of Object.keys(obj)) {
            checkItemRefs(obj[key]);
          }
        };

        checkItemRefs(content);
      });
    });
  });

});
