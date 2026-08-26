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

    it('distinguishes silk rope from hempen rope as separate canonical identities while allowing fallbacks', () => {
      const hempenRopeVisual = resolveVisualIdentity('hempen_rope_50_ft');
      const silkRopeVisual = resolveVisualIdentity('silk_rope_50_ft');

      expect(hempenRopeVisual).toBe('equipment.hempen_rope_50_ft');
      expect(silkRopeVisual).toBe('equipment.silk_rope_50_ft');
      expect(hempenRopeVisual).not.toBe(silkRopeVisual);

      const silkMapping = getSpriteCellForVisual(silkRopeVisual);
      expect(silkMapping).toBeDefined();
      expect(silkMapping?.fallbackVisualId).toBe('equipment.hempen_rope_50_ft');
    });

    it('normalizes template aliases and hyphen/underscore variations cleanly', () => {
      expect(resolveVisualIdentity('crossbow_light')).toBe('equipment.light_crossbow');
      expect(resolveVisualIdentity('light-crossbow')).toBe('equipment.light_crossbow');
      expect(resolveVisualIdentity('hempen-rope-50-ft')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('rope-hempen-50-feet')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('rope')).toBe('equipment.hempen_rope_50_ft');
      expect(resolveVisualIdentity('rope_silk_50_feet')).toBe('equipment.silk_rope_50_ft');
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

  describe('Sprite Manifest & Grid Bounds Integrity', () => {
    it('ensures every READY manifest entry references a valid sprite sheet definition', () => {
      const mappings = getAllManifestMappings().filter(m => m.status === 'READY');
      expect(mappings.length).toBeGreaterThan(0);

      mappings.forEach(mapping => {
        expect(mapping.sheetId).toBeDefined();
        if (mapping.sheetId) {
          const sheet = getSpriteSheetDefinition(mapping.sheetId);
          expect(sheet, `Sheet ${mapping.sheetId} referenced by ${mapping.visualId} must exist`).toBeDefined();
          expect(sheet?.path).toMatch(/^\/assets\/atlas\/equipment\/sprites\/[a-z0-9_]+\.webp$/);
        }
      });
    });

    it('validates cell coordinates for READY items are strictly within the actual declared sheet grid bounds', () => {
      const mappings = getAllManifestMappings().filter(m => m.status === 'READY');

      mappings.forEach(mapping => {
        expect(mapping.sheetId).toBeDefined();
        if (mapping.sheetId) {
          const sheet = getSpriteSheetDefinition(mapping.sheetId);
          expect(sheet).toBeDefined();

          if (sheet) {
            expect(mapping.row, `Row for ${mapping.visualId} must be defined`).toBeDefined();
            expect(mapping.col, `Col for ${mapping.visualId} must be defined`).toBeDefined();

            if (mapping.row !== undefined && mapping.col !== undefined) {
              expect(mapping.row, `Row for ${mapping.visualId} must be >= 0`).toBeGreaterThanOrEqual(0);
              expect(mapping.col, `Col for ${mapping.visualId} must be >= 0`).toBeGreaterThanOrEqual(0);

              expect(
                mapping.row,
                `Row ${mapping.row} for ${mapping.visualId} must be < sheet rows (${sheet.grid.rows}) on ${sheet.id}`
              ).toBeLessThan(sheet.grid.rows);

              expect(
                mapping.col,
                `Col ${mapping.col} for ${mapping.visualId} must be < sheet cols (${sheet.grid.cols}) on ${sheet.id}`
              ).toBeLessThan(sheet.grid.cols);
            }
          }
        }
      });
    });

    it('enforces logical grid is strictly 4 columns by 4 rows across all declared sheets', () => {
      const sheets = Object.values(SPRITE_SHEETS);
      sheets.forEach(sheet => {
        expect(sheet.grid.rows, `Sheet ${sheet.id} must have 4 rows`).toBe(4);
        expect(sheet.grid.cols, `Sheet ${sheet.id} must have 4 columns`).toBe(4);
      });
    });

    it('fails bounds validation when a coordinate exceeds sheet grid dimensions', () => {
      const mockSheet = { id: 'test_sheet', grid: { rows: 4, cols: 4 } };
      const validCell = { row: 3, col: 3 };
      const invalidRowCell = { row: 4, col: 0 };
      const invalidColCell = { row: 0, col: 4 };

      const checkValid = (cell: { row: number; col: number }) =>
        cell.row >= 0 && cell.col >= 0 && cell.row < mockSheet.grid.rows && cell.col < mockSheet.grid.cols;

      expect(checkValid(validCell)).toBe(true);
      expect(checkValid(invalidRowCell)).toBe(false);
      expect(checkValid(invalidColCell)).toBe(false);
    });

    it('ensures all READY renderable cells are unique and no two READY items share the same cell', () => {
      const mappings = getAllManifestMappings().filter(m => m.status === 'READY');
      const occupiedCells = new Set<string>();

      mappings.forEach(mapping => {
        const key = `${mapping.sheetId}:${mapping.row}:${mapping.col}`;
        expect(occupiedCells.has(key), `Duplicate cell assignment detected at ${key} for ${mapping.visualId}`).toBe(false);
        occupiedCells.add(key);
      });
    });
  });

  describe('PLANNED vs READY Semantics', () => {
    it('verifies PLANNED items without a sprite asset have no renderable cell assigned', () => {
      const arrowMapping = getSpriteCellForVisual('equipment.arrow');
      expect(arrowMapping).toBeDefined();
      expect(arrowMapping?.status).toBe('PLANNED');
      expect(arrowMapping?.sheetId).toBeUndefined();
      expect(arrowMapping?.row).toBeUndefined();
      expect(arrowMapping?.col).toBeUndefined();

      const ballBearingsMapping = getSpriteCellForVisual('equipment.ball_bearings');
      expect(ballBearingsMapping).toBeDefined();
      expect(ballBearingsMapping?.status).toBe('PLANNED');
      expect(ballBearingsMapping?.row).toBeUndefined();
      expect(ballBearingsMapping?.col).toBeUndefined();
    });

    it('verifies PLANNED items do not accidentally claim occupied READY cells', () => {
      const readyMappings = getAllManifestMappings().filter(m => m.status === 'READY');
      const readyCells = new Set(readyMappings.map(m => `${m.sheetId}:${m.row}:${m.col}`));

      const plannedMappings = getAllManifestMappings().filter(m => m.status === 'PLANNED');
      plannedMappings.forEach(planned => {
        if (planned.sheetId && planned.row !== undefined && planned.col !== undefined) {
          const key = `${planned.sheetId}:${planned.row}:${planned.col}`;
          expect(readyCells.has(key), `PLANNED item ${planned.visualId} must not occupy READY cell ${key}`).toBe(false);
        }
      });
    });

    it('verifies PLANNED items with explicit fallbackVisualId resolve through fallback mapping', () => {
      const silkRopeMapping = getSpriteCellForVisual('equipment.silk_rope_50_ft');
      expect(silkRopeMapping).toBeDefined();
      expect(silkRopeMapping?.status).toBe('PLANNED');
      expect(silkRopeMapping?.fallbackVisualId).toBe('equipment.hempen_rope_50_ft');

      const fallbackTargetMapping = getSpriteCellForVisual(silkRopeMapping!.fallbackVisualId!);
      expect(fallbackTargetMapping).toBeDefined();
      expect(fallbackTargetMapping?.status).toBe('READY');
      expect(fallbackTargetMapping?.sheetId).toBe('starter_adventuring_01');
      expect(fallbackTargetMapping?.row).toBe(2);
      expect(fallbackTargetMapping?.col).toBe(2);
    });

    it('verifies READY items resolve directly to their authoritative renderable cell', () => {
      const longswordMapping = getSpriteCellForVisual('equipment.longsword');
      expect(longswordMapping).toBeDefined();
      expect(longswordMapping?.status).toBe('READY');
      expect(longswordMapping?.sheetId).toBe('starter_weapons_01');
      expect(longswordMapping?.row).toBe(2);
      expect(longswordMapping?.col).toBe(2);
    });
  });

  describe('Renderer & Graceful Fallback Handling', () => {
    it('handles missing or unknown visual identities gracefully without crashing', () => {
      const unknownVisual = resolveVisualIdentity('non_existent_item_999');
      expect(unknownVisual).toBe('equipment.non_existent_item_999');

      const cell = getSpriteCellForVisual(unknownVisual);
      expect(cell).toBeUndefined();
    });

    it('handles missing manifest entries gracefully when looking up unmapped items', () => {
      const cell = getSpriteCellForVisual('equipment.unmapped_custom_item');
      expect(cell).toBeUndefined();
    });
  });

  describe('Architecture Protection', () => {
    it('prevents legacy equipmentSpriteMap.ts from being re-introduced into production', () => {
      const legacyMapPath = path.join(process.cwd(), 'src/components/character/equipment/equipmentSpriteMap.ts');
      expect(fs.existsSync(legacyMapPath), 'equipmentSpriteMap.ts must not exist in production codebase').toBe(false);
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
