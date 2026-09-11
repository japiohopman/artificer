import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSpellVisualIdentity, getSpellSpriteCellForVisual, getSpellSpriteSheetDefinition } from '../src/lib/spellVisuals';
import { fetchSpellData, fetchSpellList, fetchRecruitNPCData } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { getCharacterActions } from '../src/lib/tokenActionHud';
import { createSpellCombatAction, resolveSpellAction, getActorSpellcastingStats } from '../src/domain/spells/spellResolver';

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

  describe('Character Creator & Sprite Sheet Manifest Mapping', () => {
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

    it('3. Canonical spell JSON converts to CombatSpellAction and TokenActionHUD uses the same representation', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      expect(cureWoundsData).not.toBeNull();

      const spellAction = createSpellCombatAction(cureWoundsData);
      expect(spellAction.id).toBe('cure_wounds');
      expect(spellAction.category).toBe('Spells');
      expect(spellAction.actionType).toBe('actions');
      expect(spellAction.data.level).toBe(1);

      const testChar = {
        id: 'test-cleric',
        name: 'Cleric Test',
        class: 'Cleric',
        race: 'Human',
        gender: 'Female' as const,
        level: 1,
        xp: 0,
        alignment: 'Lawful Good',
        background: 'Acolyte',
        stats: { str: 10, dex: 10, con: 12, int: 10, wis: 16, cha: 10 },
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
        knownSpells: [cureWoundsData],
        preparedSpells: ['cure_wounds'],
        spellSlots: { '1': { current: 2, max: 2 } },
        choices: {},
        hp: 10,
        maxHp: 10,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
      };

      const actions = getCharacterActions(testChar);
      const spellHudAction = actions.find(a => a.category === 'Spells' && a.data?.index === 'cure_wounds');
      expect(spellHudAction).toBeDefined();
      expect(spellHudAction?.actionType).toBe(spellAction.actionType);
      expect(spellHudAction?.name).toBe(spellAction.name);
    });
  });

  describe('G: Ruleset Resolution Isolation (2014 vs 2024)', () => {
    it('4. 2024 spell resolves strictly from 2024 dataset (/24/)', async () => {
      const spell24 = await fetchSpellData('cure_wounds', '2024');
      expect(spell24).not.toBeNull();
      expect(spell24.rulesetContext).toBe('2024');
      expect(spell24.heal_at_slot_level['1']).toBe('2d8 + MOD');
    });

    it('5. 2014 spell resolves strictly from 2014 dataset (/14/)', async () => {
      const spell14 = await fetchSpellData('cure_wounds', '2014');
      expect(spell14).not.toBeNull();
      expect(spell14.rulesetContext).toBe('2014');
      expect(spell14.heal_at_slot_level['1']).toBe('1d8 + MOD');
    });
  });

  describe('A, B, C, D & E: End-to-End Spell Execution, Healing, Rejection & Single Resource Consumption', () => {
    it('6. A: Offensive spell (Magic Missile) resolves through shared resolveCombatAction and changes target HP', async () => {
      const mmData = await fetchSpellData('magic_missile', '2014');
      const spellAction = createSpellCombatAction(mmData);

      const testChar = {
        id: 'hero-wizard-1',
        name: 'Hero Wizard',
        class: 'Wizard',
        race: 'Human',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Good',
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
        knownSpells: [mmData],
        preparedSpells: ['magic_missile'],
        spellSlots: { '1': { current: 2, max: 2 } },
        choices: {},
        hp: 10,
        maxHp: 10,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      };

      useCharacterStore.getState().setCharacters([testChar]);
      useCharacterStore.getState().setActiveCharacter('hero-wizard-1');

      useGameStore.setState(state => ({
        activeCharacterId: 'hero-wizard-1',
        combatState: {
          ...state.combatState,
          monsters: [
            {
              id: 'goblin-1',
              name: 'Goblin',
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

      // Execute via useGameStore.resolveCombatAction -> resolveSpellAction
      await useGameStore.getState().resolveCombatAction(
        { name: 'Hero Wizard', id: 'hero-wizard-1' },
        target,
        spellAction
      );

      const updatedGoblin = useGameStore.getState().combatState.monsters.find(m => m.id === 'goblin-1');
      expect(updatedGoblin?.hp).toBeLessThan(20);
    });

    it('7. B, D & E: Healing spell (Cure Wounds) applies real effect and deducts exactly ONE action and ONE spell slot', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      const spellAction = createSpellCombatAction(cureWoundsData);

      const testChar = {
        id: 'hero-cleric-1',
        name: 'Hero Cleric',
        class: 'Cleric',
        race: 'Human',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Good',
        background: 'Acolyte',
        stats: { str: 10, dex: 10, con: 12, int: 10, wis: 16, cha: 10 },
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
        knownSpells: [cureWoundsData],
        preparedSpells: ['cure_wounds'],
        spellSlots: { '1': { current: 2, max: 2 } },
        choices: {},
        hp: 5,
        maxHp: 20,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      };

      const charStore = useCharacterStore.getState();
      charStore.setCharacters([testChar]);
      charStore.setActiveCharacter('hero-cleric-1');

      useGameStore.setState({ activeCharacterId: 'hero-cleric-1' });

      // Execute via useGameStore.resolveCombatAction
      await useGameStore.getState().resolveCombatAction(
        { name: 'Hero Cleric', id: 'hero-cleric-1' },
        { name: 'Hero Cleric', id: 'hero-cleric-1' },
        spellAction
      );

      const updatedChar = useCharacterStore.getState().characters.find(c => c.id === 'hero-cleric-1');
      expect(updatedChar?.hp).toBeGreaterThan(5);
      expect(updatedChar?.spellSlots['1'].current).toBe(1); // Deducted exactly 1 slot
      expect(updatedChar?.actionEconomy?.actions.current).toBe(0); // Deducted exactly 1 action
    });

    it('8. C: Failure case (Insufficient spell slot) → NO slot consumed and NO HP change', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      const spellAction = createSpellCombatAction(cureWoundsData);

      const testChar = {
        id: 'cleric-no-slots',
        name: 'Cleric No Slots',
        class: 'Cleric',
        race: 'Human',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Good',
        background: 'Acolyte',
        stats: { str: 10, dex: 10, con: 12, int: 10, wis: 16, cha: 10 },
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
        knownSpells: [cureWoundsData],
        preparedSpells: ['cure_wounds'],
        spellSlots: { '1': { current: 0, max: 2 } }, // ZERO SLOTS LEFT
        choices: {},
        hp: 5,
        maxHp: 20,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      };

      const charStore = useCharacterStore.getState();
      charStore.setCharacters([testChar]);
      charStore.setActiveCharacter('cleric-no-slots');

      useGameStore.setState({ activeCharacterId: 'cleric-no-slots' });

      const result = await resolveSpellAction(
        { name: 'Cleric No Slots', id: 'cleric-no-slots' },
        { name: 'Cleric No Slots', id: 'cleric-no-slots' },
        spellAction,
        1
      );

      expect(result.success).toBe(false);
      expect(result.logMessage).toContain('no Level 1 spell slots remaining');
      const updatedChar = useCharacterStore.getState().characters.find(c => c.id === 'cleric-no-slots');
      expect(updatedChar?.hp).toBe(5); // HP untouched
      expect(updatedChar?.spellSlots['1'].current).toBe(0); // Slot untouched
      expect(updatedChar?.actionEconomy?.actions.current).toBe(1); // Action untouched
    });

    it('9. C & D: Failure case (Unprepared / Unknown spell) → NO slot consumed and NO HP change', async () => {
      const cureWoundsData = await fetchSpellData('cure_wounds', '2014');
      const spellAction = createSpellCombatAction(cureWoundsData);

      const testChar = {
        id: 'cleric-unprepared',
        name: 'Cleric Unprepared',
        class: 'Cleric',
        race: 'Human',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Good',
        background: 'Acolyte',
        stats: { str: 10, dex: 10, con: 12, int: 10, wis: 16, cha: 10 },
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
        knownSpells: [cureWoundsData],
        preparedSpells: ['bless'], // CURE WOUNDS IS NOT PREPARED
        spellSlots: { '1': { current: 2, max: 2 } },
        choices: {},
        hp: 5,
        maxHp: 20,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      };

      const charStore = useCharacterStore.getState();
      charStore.setCharacters([testChar]);
      charStore.setActiveCharacter('cleric-unprepared');

      useGameStore.setState({ activeCharacterId: 'cleric-unprepared' });

      const result = await resolveSpellAction(
        { name: 'Cleric Unprepared', id: 'cleric-unprepared' },
        { name: 'Cleric Unprepared', id: 'cleric-unprepared' },
        spellAction,
        1
      );

      expect(result.success).toBe(false);
      expect(result.logMessage).toContain('does not have the spell Cure Wounds prepared');
      const updatedChar = useCharacterStore.getState().characters.find(c => c.id === 'cleric-unprepared');
      expect(updatedChar?.hp).toBe(5);
      expect(updatedChar?.spellSlots['1'].current).toBe(2); // Slot untouched
    });
  });

  describe('F & H: Recruit NPC State Retention & Shared resolveCombatAction Route', () => {
    it('10. F & H: Recruit test NPC spellcasting state survives conversion into combat actor model and executes via shared resolveCombatAction', async () => {
      const wizardZanna = await fetchRecruitNPCData('4Jsv5vYaJ1atUEDV');
      expect(wizardZanna).not.toBeNull();
      expect(wizardZanna.name).toContain('Zanna');
      expect(wizardZanna.class).toBe('Wizard');
      expect(Array.isArray(wizardZanna.knownSpells)).toBe(true);

      useGameStore.getState().addMonsterToCombat({
        ...wizardZanna,
        isAlly: true
      });

      const monsterActor = useGameStore.getState().combatState.monsters.find(m => m.name.includes('Zanna'));
      expect(monsterActor).toBeDefined();
      expect(monsterActor?.knownSpells).toBeDefined();
      expect(monsterActor?.knownSpells?.length).toBeGreaterThan(0);

      const spellAction = createSpellCombatAction(monsterActor?.knownSpells[0]);

      // Execute through the shared resolveCombatAction entry point!
      await useGameStore.getState().resolveCombatAction(
        monsterActor,
        { name: 'Target Dummy', id: 'dummy-1', hp: 20, maxHp: 20, armor_class: 10 },
        spellAction
      );

      const logs = useGameStore.getState().logs;
      const logTexts = logs.map((l: any) => l.message || '');
      expect(logTexts.some(t => t.includes('Zanna'))).toBe(true);
    });

    it('11. Derive actor spellcasting stats uses real character class and stats, failing when unresolvable', () => {
      const clericStats = getActorSpellcastingStats({ class: 'Cleric', stats: { wis: 16 } });
      expect(clericStats).not.toBeNull();
      expect(clericStats?.ability).toBe('wis');
      expect(clericStats?.modifier).toBe(3);
      expect(clericStats?.saveDC).toBe(13);

      const wizardStats = getActorSpellcastingStats({ class: 'Wizard', stats: { int: 18 }, level: 5 });
      expect(wizardStats).not.toBeNull();
      expect(wizardStats?.ability).toBe('int');
      expect(wizardStats?.modifier).toBe(4);
      expect(wizardStats?.profBonus).toBe(3);
      expect(wizardStats?.attackBonus).toBe(7);
      expect(wizardStats?.saveDC).toBe(15);

      const unresolvableStats = getActorSpellcastingStats({ class: 'UnknownClass', stats: { int: 18, wis: 10 } });
      expect(unresolvableStats).toBeNull(); // No highest-stat fallback!
    });
  });
});
