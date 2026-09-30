import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore, Character } from '../src/store/useCharacterStore';
import { getXPForLevel } from '../src/lib/characterUtils';
import { evaluateNextLevelStep } from '../src/lib/progressionUtils';

describe('Player-Controlled Level-Up Progression Lifecycle (Issue #381)', () => {
  const testCharacter: Character = {
    id: 'test-fighter-1',
    ruleset: '2014',
    name: 'Valeros',
    class: 'Fighter',
    race: 'Human',
    gender: 'Male',
    level: 1,
    xp: 0,
    alignment: 'Lawful Good',
    background: 'Soldier',
    stats: {
      str: 16,
      dex: 14,
      con: 14,
      int: 10,
      wis: 12,
      cha: 8,
    },
    proficiencies: ['Athletics', 'Intimidation'],
    traits: [],
    features: [
      { name: 'Second Wind', index: 'second_wind', desc: 'Regain HP', source: 'Class' }
    ],
    flaws: [],
    ideals: [],
    bonds: [],
    backstory: 'A brave warrior.',
    languages: ['Common'],
    appearance: {
      hairColor: 'Brown',
      hairStyle: 'Short',
      bodyType: 'Athletic',
      eyeColor: 'Blue',
      skinColor: 'Fair',
      height: '6ft',
      weight: '180lbs'
    },
    inventory: {},
    backpack: [],
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {},
    choices: {},
    hp: 12,
    maxHp: 12,
    money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
  };

  const secondaryCharacter: Character = {
    ...testCharacter,
    id: 'test-wizard-2',
    name: 'Ezren',
    class: 'Wizard'
  };

  beforeEach(() => {
    useCharacterStore.setState({
      characters: [
        JSON.parse(JSON.stringify(testCharacter)),
        JSON.parse(JSON.stringify(secondaryCharacter))
      ],
      activeCharacterId: 'test-fighter-1',
      activeLevelUpSession: null,
      levelUpQueue: []
    });
  });

  it('1. Gaining XP creates level-up eligibility WITHOUT auto-creating an active session or mutating character level/HP', async () => {
    const store = useCharacterStore.getState();
    const targetXp = getXPForLevel(2); // 300 XP for Level 2

    await store.addXp('test-fighter-1', targetXp);

    const updatedChar = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;

    // XP must be updated
    expect(updatedChar.xp).toBe(targetXp);

    // Level, HP, MaxHP MUST NOT be mutated silently
    expect(updatedChar.level).toBe(1);
    expect(updatedChar.hp).toBe(12);
    expect(updatedChar.maxHp).toBe(12);

    // Active session must remain null until explicitly started by player
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
  });

  it('2. Explicit player start creates a progression session targeting currentLevel + 1', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);

    const session = await store.startLevelUpSession('test-fighter-1');

    expect(session).not.toBeNull();
    expect(session?.characterId).toBe('test-fighter-1');
    expect(session?.currentLevel).toBe(1);
    expect(session?.targetLevel).toBe(2);
    expect(session?.classHitDie).toBe(10);
  });

  it('3. Cancelling a level-up clears active session, but character remains eligible to start again', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.startLevelUpSession('test-fighter-1');

    expect(useCharacterStore.getState().activeLevelUpSession).not.toBeNull();

    // Player cancels level up session
    store.cancelLevelUpSession();

    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();

    // Canonical character state remains unchanged
    const charAfterCancel = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(charAfterCancel.level).toBe(1);
    expect(charAfterCancel.hp).toBe(12);

    // Player can start level-up session again!
    const reloadedSession = await store.startLevelUpSession('test-fighter-1');
    expect(reloadedSession).not.toBeNull();
    expect(reloadedSession?.targetLevel).toBe(2);
  });

  it('4. Guard prevents overwriting an existing active session for another character or same character', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.addXp('test-wizard-2', 300);

    // Active session started for fighter
    const originalSession = await store.startLevelUpSession('test-fighter-1');
    expect(originalSession).not.toBeNull();
    expect(useCharacterStore.getState().activeLevelUpSession?.characterId).toBe('test-fighter-1');

    // Attempting to start session again for the SAME character returns null without replacing active session
    const repeatSameCharacterSession = await store.startLevelUpSession('test-fighter-1');
    expect(repeatSameCharacterSession).toBeNull();
    expect(useCharacterStore.getState().activeLevelUpSession).toBe(originalSession);

    // Attempting to start session for wizard while fighter session is active also returns null
    const secondSession = await store.startLevelUpSession('test-wizard-2');
    expect(secondSession).toBeNull();
    expect(useCharacterStore.getState().activeLevelUpSession).toBe(originalSession);
  });

  it('5. Ruleset fail-closed boundary rejects progression when ruleset class data is missing', async () => {
    const invalidRulesetChar = {
      ...testCharacter,
      id: 'test-custom-1',
      class: 'NonExistentClass',
      ruleset: '2024' as const,
      xp: 500
    };

    const session = await evaluateNextLevelStep(invalidRulesetChar);
    expect(session).toBeNull(); // Fails closed without falling back to legacy CLASS_DATA
  });

  it('6. Commit rejects invalid targetLevel, malformed payloads, non-ASI stat mutations, ungranted features, arbitrary choices, or ungranted subclasses with zero canonical mutation', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.startLevelUpSession('test-fighter-1'); // Active session for targetLevel 2 (Fighter Lvl 2 has no ASI / no subclass grant)

    const charBeforeRejections = JSON.parse(JSON.stringify(useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')));

    // Mismatched targetLevel
    const wrongTargetCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 5,
      finalHpGain: 8
    });
    expect(wrongTargetCommit).toBe(false);

    // Invalid HP gain (0 or negative)
    const invalidHpCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 0
    });
    expect(invalidHpCommit).toBe(false);

    // Stat mutation on non-ASI level (Lvl 2)
    const invalidStatCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      stats: { str: 18 } // Fighter Lvl 2 has no ASI
    });
    expect(invalidStatCommit).toBe(false);

    // Ungranted feature payload
    const invalidFeatureCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      features: [{ name: 'Fake Feature', index: 'fake_ungranted_feature', desc: 'Invalid' }]
    });
    expect(invalidFeatureCommit).toBe(false);

    // Arbitrary choice key payload
    const invalidChoiceKeyCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      choices: { 'illegal_choice_key': ['unauthorized_selection'] }
    });
    expect(invalidChoiceKeyCommit).toBe(false);

    // Known choice key paired with unauthorized/invalid option value
    const invalidChoiceValueCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      choices: { 'fighting-style': ['unauthorized_fake_fighting_style'] }
    });
    expect(invalidChoiceValueCommit).toBe(false);

    // Globally valid choice value submitted at a level where choice is NOT granted (Fighter Lvl 2 does not grant Fighting Style)
    const ungrantedChoiceCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      choices: { 'fighting-style': ['archery'] }
    });
    expect(ungrantedChoiceCommit).toBe(false);

    // Subclass payload for wrong class or level that does not grant a subclass
    const invalidSubclassCommit = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      subclass: 'evocation' // Wizard subclass attempted on Fighter
    });
    expect(invalidSubclassCommit).toBe(false);

    // Character state remains untouched after all rejected commits
    const char = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(char.level).toBe(1);
    expect(char.hp).toBe(12);
    expect(char.stats).toEqual(charBeforeRejections.stats);
    expect(char.features).toEqual(charBeforeRejections.features);
    expect(char.subclass).toBeUndefined();
  });

  it('7. Completing level-up commits new level, HP, features, and choices atomically', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.startLevelUpSession('test-fighter-1'); // Fighter Lvl 2 grants action_surge_1_use

    const commitSuccess = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      features: [
        { name: 'Action Surge', index: 'action_surge_1_use', desc: 'Gain an extra action', source: 'Class' }
      ]
    });

    expect(commitSuccess).toBe(true);

    const charAfterCommit = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(charAfterCommit.level).toBe(2);
    expect(charAfterCommit.maxHp).toBe(20); // 12 + 8
    expect(charAfterCommit.hp).toBe(20);
    expect(charAfterCommit.features.some(f => f.index === 'action_surge_1_use')).toBe(true);
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
  });

  it('8. Multi-level eligibility leaves the next level pending rather than automatically starting it', async () => {
    const store = useCharacterStore.getState();
    // Give enough XP for Level 3 immediately (900 XP)
    await store.addXp('test-fighter-1', 900);

    let char = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(char.level).toBe(1);
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull(); // Pending, not auto-started

    // Explicitly start level 2
    await store.startLevelUpSession('test-fighter-1');
    expect(useCharacterStore.getState().activeLevelUpSession?.targetLevel).toBe(2);

    // Commit Level 2
    await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
    });

    char = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(char.level).toBe(2);

    // After commit, Level 3 remains pending (activeLevelUpSession is null until explicit start)
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();

    // Player explicitly starts Level 3
    const level3Session = await store.startLevelUpSession('test-fighter-1');
    expect(level3Session).not.toBeNull();
    expect(level3Session?.currentLevel).toBe(2);
    expect(level3Session?.targetLevel).toBe(3);

    // Commit Level 3
    await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 3,
      finalHpGain: 7,
      subclass: 'champion'
    });

    char = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(char.level).toBe(3);
    expect(char.subclass).toBe('champion');
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
  });

  it('9. Stale active session cannot commit if live character level or XP eligibility changes, with 0 canonical mutation', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300); // 300 XP = eligible for level 2
    await store.startLevelUpSession('test-fighter-1'); // Active session created for Lvl 1 -> 2

    const charBeforeStale = JSON.parse(JSON.stringify(useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')));

    // Invalidation Case A: Live character level changes manually
    store.updateCharacter('test-fighter-1', { level: 2 });

    const commitResultA = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8
    });

    expect(commitResultA).toBe(false);

    // Invalidation Case B: XP drops below target threshold
    store.updateCharacter('test-fighter-1', { level: 1, xp: 100 }); // Drops below 300

    const commitResultB = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8
    });

    expect(commitResultB).toBe(false);

    // Verify ZERO canonical mutation occurs
    const charAfterRejections = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(charAfterRejections.level).toBe(1);
    expect(charAfterRejections.xp).toBe(100);
    expect(charAfterRejections.hp).toBe(charBeforeStale.hp);
    expect(charAfterRejections.maxHp).toBe(charBeforeStale.maxHp);
    expect(charAfterRejections.stats).toEqual(charBeforeStale.stats);
    expect(charAfterRejections.features).toEqual(charBeforeStale.features);
  });

  it('10. evaluateNextLevelStep and startLevelUpSession fail closed when canonical level progression data is missing', async () => {
    const { atlasService } = await import('../src/services/atlasService');
    const originalLoadLevelData = atlasService.loadLevelData;
    atlasService.loadLevelData = async () => null;

    try {
      const store = useCharacterStore.getState();
      await store.addXp('test-fighter-1', 300);

      // Verify direct helper fails closed
      const eligibleChar = store.characters.find(c => c.id === 'test-fighter-1')!;
      const helperSession = await evaluateNextLevelStep(eligibleChar);
      expect(helperSession).toBeNull();

      // Verify store action entrypoint fails closed and activeLevelUpSession remains null
      const storeSession = await store.startLevelUpSession('test-fighter-1');
      expect(storeSession).toBeNull();
      expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
    } finally {
      atlasService.loadLevelData = originalLoadLevelData;
    }
  });

  it('11. Unlocked spell slots are staged and committed to canonical character spellSlots state', async () => {
    const wizardChar: Character = {
      ...testCharacter,
      id: 'test-wizard-slots-1',
      class: 'Wizard',
      level: 2,
      xp: 900, // Eligible for Level 3
      knownSpells: [{ index: 'magic_missile', name: 'Magic Missile' }],
      preparedSpells: ['magic_missile'],
      spellSlots: {
        '1': { current: 1, max: 3 } // Spent 2 1st-level slots (1 remaining)
      }
    };

    useCharacterStore.setState({
      characters: [wizardChar],
      activeCharacterId: 'test-wizard-slots-1',
      activeLevelUpSession: null
    });

    const store = useCharacterStore.getState();
    const session = await store.startLevelUpSession('test-wizard-slots-1');
    expect(session).not.toBeNull();
    expect(session?.targetLevel).toBe(3);

    const commitSuccess = await store.commitLevelUpSession({
      characterId: 'test-wizard-slots-1',
      targetLevel: 3,
      finalHpGain: 5
    });

    expect(commitSuccess).toBe(true);

    const updatedWizard = useCharacterStore.getState().characters.find(c => c.id === 'test-wizard-slots-1')!;
    expect(updatedWizard.level).toBe(3);

    // Verify 1st level max increased to 4 and existing current slot (1) increased by 1 to 2
    expect(updatedWizard.spellSlots['1']).toEqual({ current: 2, max: 4 });

    // Verify 2nd level slots unlocked automatically (max 2, current 2)
    expect(updatedWizard.spellSlots['2']).toEqual({ current: 2, max: 2 });

    // Verify castSpell works for newly unlocked 2nd level slot
    const canCastLvl2 = useCharacterStore.getState().castSpell('magic_missile', 2);
    expect(canCastLvl2).toBe(true);
    expect(useCharacterStore.getState().characters.find(c => c.id === 'test-wizard-slots-1')!.spellSlots['2'].current).toBe(1);
  });
});
