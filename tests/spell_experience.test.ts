import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSpellVisualIdentity, getSpellSpriteCellForVisual, getSpellSpriteSheetDefinition } from '../src/lib/spellVisuals';
import { fetchSpellData, fetchSpellList, fetchRecruitNPCData } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { getCharacterActions } from '../src/lib/tokenActionHud';

describe('Spell Experience End-to-End & Integration Regression Tests', () => {

  beforeEach(() => {
    useGameStore.getState().setRuleset('2014');
  });

  describe('Character Creator & Level-1 Spell Visual Pipeline', () => {
    it('1. Level-1 known spells resolve to READY sprite-sheet manifest entries when mapped', () => {
      const level1Spells = [
        'magic_missile',
        'burning_hands',
        'cure_wounds',
        'shield',
        'guiding_bolt',
        'witch_bolt'
      ];

      level1Spells.forEach(spellId => {
        const visualId = resolveSpellVisualIdentity(spellId, '2014');
        const mapping = getSpellSpriteCellForVisual(visualId);
        expect(mapping, `Mapping for ${spellId} must exist`).toBeDefined();
        expect(mapping?.status, `Status for ${spellId} must be READY`).toBe('READY');
        expect(mapping?.sheetId, `Sheet ID for ${spellId} must be defined`).toBeDefined();

        if (mapping?.sheetId) {
          const sheet = getSpellSpriteSheetDefinition(mapping.sheetId);
          expect(sheet, `Sheet definition for ${mapping.sheetId} must exist`).toBeDefined();
        }
      });
    });

    it('2. magic_missile resolves strictly to spell_level1_sheet_01', () => {
      const visualId = resolveSpellVisualIdentity('magic_missile');
      expect(visualId).toBe('spell.magic_missile');

      const mapping = getSpellSpriteCellForVisual(visualId);
      expect(mapping).toBeDefined();
      expect(mapping?.status).toBe('READY');
      expect(mapping?.sheetId).toBe('spell_level1_sheet_01');
      expect(mapping?.row).toBe(0);
      expect(mapping?.col).toBe(0);

      const sheet = getSpellSpriteSheetDefinition('spell_level1_sheet_01');
      expect(sheet).toBeDefined();
      expect(sheet?.path).toBe('/assets/atlas/spell/sprites/spell_level1_sheet_01.webp');
    });
  });

  describe('Ruleset Resolution Isolation (2014 vs 2024)', () => {
    it('3. 2024 spell resolves strictly from 2024 dataset (/24/)', async () => {
      const spell24 = await fetchSpellData('cure_wounds', '2024');
      expect(spell24).not.toBeNull();
      expect(spell24.rulesetContext).toBe('2024');
      expect(spell24.heal_at_slot_level['1']).toBe('2d8 + MOD');
    });

    it('4. 2014 spell resolves strictly from 2014 dataset (/14/)', async () => {
      const spell14 = await fetchSpellData('cure_wounds', '2014');
      expect(spell14).not.toBeNull();
      expect(spell14.rulesetContext).toBe('2014');
      expect(spell14.heal_at_slot_level['1']).toBe('1d8 + MOD');
    });
  });

  describe('Combat Tester & Test NPC Integration', () => {
    it('5. Combat tester can load recruit test NPC with preserved spellcasting data', async () => {
      const wizardZanna = await fetchRecruitNPCData('4Jsv5vYaJ1atUEDV');
      expect(wizardZanna).not.toBeNull();
      expect(wizardZanna.name).toContain('Zanna');
      expect(wizardZanna.class).toBe('Wizard');
      expect(Array.isArray(wizardZanna.knownSpells)).toBe(true);
      expect(wizardZanna.knownSpells.length).toBeGreaterThan(0);
      expect(wizardZanna.spellSlots).toBeDefined();
      expect(wizardZanna.spellSlots['1']).toBeDefined();
    });

    it('6. Combat tester exposes and casts a spell using domain combat logic', async () => {
      const wizardZanna = await fetchRecruitNPCData('4Jsv5vYaJ1atUEDV');
      expect(wizardZanna).not.toBeNull();

      // Get available actions for Zanna via domain tokenActionHud logic
      const actions = getCharacterActions(wizardZanna);
      const spellActions = actions.filter(a => a.category === 'Spells');

      expect(spellActions.length).toBeGreaterThan(0);

      const magicMissileAction = spellActions.find(a => a.name.toLowerCase().includes('magic missile') || a.id.includes('magic_missile'));
      expect(magicMissileAction).toBeDefined();
      expect(magicMissileAction?.category).toBe('Spells');
      expect(magicMissileAction?.data).toBeDefined();

      // Set up monster target on grid
      useGameStore.setState(state => ({
        combatState: {
          ...state.combatState,
          monsters: [
            {
              id: 'test-goblin-1',
              name: 'Goblin Scout',
              hp: 20,
              maxHp: 20,
              x: 5,
              y: 5,
              armor_class: 10,
              stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
              type: 'Goblin'
            }
          ]
        }
      }));

      const target = useGameStore.getState().combatState.monsters[0];

      // Invoke the real canonical domain combat action resolution method
      await useGameStore.getState().resolveCombatAction(
        { name: wizardZanna.name, id: wizardZanna.id },
        target,
        {
          ...magicMissileAction!,
          attack_bonus: 5,
          damage: [{ damage_dice: '3d4+3', damage_type: { name: 'force' } }]
        }
      );

      const logs = useGameStore.getState().logs;
      const logTexts = logs.map((l: any) => typeof l === 'string' ? l : l.message || l.text || '');
      expect(logTexts.some(t => t.includes('Zanna') && t.includes('Goblin Scout'))).toBe(true);
    });
  });
});
