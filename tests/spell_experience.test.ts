import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSpellVisualIdentity, getSpellSpriteCellForVisual, getSpellSpriteSheetDefinition } from '../src/lib/spellVisuals';
import { fetchSpellData, fetchSpellList, fetchRecruitNPCData } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { getCharacterActions } from '../src/lib/tokenActionHud';
import { createSpellCombatAction, resolveSpellAction } from '../src/domain/spells/spellResolver';

describe('Spell Experience End-to-End & Integration Regression Tests', () => {

  beforeEach(() => {
    useGameStore.getState().setRuleset('2014');
    useGameStore.setState({
      logs: [],
      combatState: {
        playerPos: { x: 2, y: 2 },
        monsters: [],
        initiativeOrder: [],
        activeTurnIndex: 0,
        grid: [],
        victoryXp: 500,
        activeConditions: {},
        combatMapBackground: 'fay_forest.png',
        activeAttack: null
      }
    });
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

  describe('Canonical Spell Action Resolution & Combat Engine Boundary', () => {
    it('5. Canonical spell JSON converts to structured CombatSpellAction without synthetic fields', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      expect(cureWoundsData).not.toBeNull();

      const spellAction = createSpellCombatAction(cureWoundsData);
      expect(spellAction.id).toBe('cure_wounds');
      expect(spellAction.category).toBe('Spells');
      expect(spellAction.actionType).toBe('actions');
      expect(spellAction.data.level).toBe(1);
      expect(spellAction.data.heal_at_slot_level).toBeDefined();
    });

    it('6. Supported spell executes through shared spellResolver using canonical spell mechanics', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      const spellAction = createSpellCombatAction(cureWoundsData);

      const actor = { name: 'Hero Cleric', id: 'hero-1', stats: { int: 10, wis: 16, cha: 10 } };
      const target = { name: 'Wounded Ally', id: 'ally-1', hp: 5, maxHp: 20 };

      // Set up monster target in game store
      useGameStore.setState(state => ({
        combatState: {
          ...state.combatState,
          monsters: [
            {
              id: 'ally-1',
              name: 'Wounded Ally',
              hp: 5,
              maxHp: 20,
              x: 2,
              y: 2,
              awareness: 'idle',
              viewDirection: 0,
              perception: 10,
              speed: 6,
              type: 'human'
            }
          ]
        }
      }));

      const result = await resolveSpellAction(actor, target, spellAction, 1);
      expect(result.success).toBe(true);
      expect(result.hpChanged).toBeGreaterThan(0);

      const updatedMonster = useGameStore.getState().combatState.monsters.find(m => m.id === 'ally-1');
      expect(updatedMonster?.hp).toBeGreaterThan(5);
    });

    it('7. Spell slot resource consumption occurs exactly once through useCharacterStore', () => {
      const charStore = useCharacterStore.getState();

      const testChar = {
        id: 'wizard-test-1',
        name: 'Test Wizard',
        class: 'Wizard',
        race: 'Human',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Neutral',
        background: 'Sage',
        stats: { str: 10, dex: 14, con: 12, int: 16, wis: 10, cha: 10 },
        proficiencies: [],
        traits: [],
        features: [],
        flaws: [],
        ideals: [],
        bonds: [],
        backstory: '',
        languages: [],
        appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
        inventory: {},
        backpack: [],
        knownSpells: [{ index: 'magic_missile', name: 'Magic Missile', level: 1 }],
        preparedSpells: ['magic_missile'],
        spellSlots: { '1': { current: 2, max: 2 } },
        choices: {},
        hp: 10,
        maxHp: 10,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
      };

      charStore.setCharacters([testChar]);
      charStore.setActiveCharacter('wizard-test-1');

      const initialSlot = useCharacterStore.getState().characters.find(c => c.id === 'wizard-test-1')?.spellSlots['1'].current;
      expect(initialSlot).toBe(2);

      const castResult = useCharacterStore.getState().castSpell('magic_missile', 1);
      expect(castResult).toBe(true);

      const afterSlot = useCharacterStore.getState().characters.find(c => c.id === 'wizard-test-1')?.spellSlots['1'].current;
      expect(afterSlot).toBe(1);
    });
  });

  describe('Combat Tester & Test Recruit NPC Integration', () => {
    it('8. Combat tester can load recruit test NPC with preserved spellcasting data', async () => {
      const wizardZanna = await fetchRecruitNPCData('4Jsv5vYaJ1atUEDV');
      expect(wizardZanna).not.toBeNull();
      expect(wizardZanna.name).toContain('Zanna');
      expect(wizardZanna.class).toBe('Wizard');
      expect(Array.isArray(wizardZanna.knownSpells)).toBe(true);
      expect(wizardZanna.knownSpells.length).toBeGreaterThan(0);
      expect(wizardZanna.spellSlots).toBeDefined();
      expect(wizardZanna.spellSlots['1']).toBeDefined();

      // Verify spell state survives conversion into combat monster actor model
      useGameStore.getState().addMonsterToCombat({
        ...wizardZanna,
        isAlly: true
      });

      const monsterActor = useGameStore.getState().combatState.monsters.find(m => m.name.includes('Zanna'));
      expect(monsterActor).toBeDefined();
      expect(monsterActor?.knownSpells).toBeDefined();
      expect(monsterActor?.knownSpells?.length).toBeGreaterThan(0);
      expect(monsterActor?.spellSlots).toBeDefined();
    });

    it('9. Combat tester executes a spell action using the shared resolveCombatAction route', async () => {
      const wizardZanna = await fetchRecruitNPCData('4Jsv5vYaJ1atUEDV');
      expect(wizardZanna).not.toBeNull();

      const actions = getCharacterActions(wizardZanna);
      const spellActions = actions.filter(a => a.category === 'Spells');
      expect(spellActions.length).toBeGreaterThan(0);

      const spellAction = spellActions.find(a => a.name.toLowerCase().includes('magic missile') || a.id.includes('magic_missile')) || spellActions[0];
      expect(spellAction).toBeDefined();

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
              awareness: 'idle',
              viewDirection: 0,
              perception: 10,
              speed: 6,
              type: 'goblin'
            }
          ]
        }
      }));

      const target = useGameStore.getState().combatState.monsters[0];

      // Route through useGameStore.resolveCombatAction (which delegates to resolveSpellAction for Spells)
      await useGameStore.getState().resolveCombatAction(
        { name: wizardZanna.name, id: wizardZanna.id },
        target,
        spellAction
      );

      const logs = useGameStore.getState().logs;
      const logTexts = logs.map((l: any) => l.message || '');
      expect(logTexts.some(t => t.includes('Zanna') || t.includes('Magic Missile') || t.includes('Goblin Scout'))).toBe(true);

      const updatedTarget = useGameStore.getState().combatState.monsters.find(m => m.id === 'test-goblin-1');
      expect(updatedTarget?.hp).toBeLessThan(20);
    });
  });
});
