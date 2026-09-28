import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore, Character } from '../src/store/useCharacterStore';
import { getXPForLevel } from '../src/lib/characterUtils';

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

  it('4. Guard prevents overwriting an existing active session for another character', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.addXp('test-wizard-2', 300);

    // Active session started for fighter
    await store.startLevelUpSession('test-fighter-1');
    expect(useCharacterStore.getState().activeLevelUpSession?.characterId).toBe('test-fighter-1');

    // Attempting to start session for wizard while fighter session is active returns null
    const secondSession = await store.startLevelUpSession('test-wizard-2');
    expect(secondSession).toBeNull();
    expect(useCharacterStore.getState().activeLevelUpSession?.characterId).toBe('test-fighter-1');
  });

  it('5. Commit rejects invalid targetLevel or malformed payloads without mutating character state', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.startLevelUpSession('test-fighter-1'); // Active session for targetLevel 2

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

    // Character state remains untouched after rejected commits
    const char = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(char.level).toBe(1);
    expect(char.hp).toBe(12);
  });

  it('6. Completing level-up commits new level, HP, features, and choices atomically', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test-fighter-1', 300);
    await store.startLevelUpSession('test-fighter-1');

    const commitSuccess = await store.commitLevelUpSession({
      characterId: 'test-fighter-1',
      targetLevel: 2,
      finalHpGain: 8,
      choices: {
        'fighting-style': ['archery']
      },
      features: [
        { name: 'Action Surge', index: 'action_surge', desc: 'Gain an extra action', source: 'Class' }
      ]
    });

    expect(commitSuccess).toBe(true);

    const charAfterCommit = useCharacterStore.getState().characters.find(c => c.id === 'test-fighter-1')!;
    expect(charAfterCommit.level).toBe(2);
    expect(charAfterCommit.maxHp).toBe(20); // 12 + 8
    expect(charAfterCommit.hp).toBe(20);
    expect(charAfterCommit.choices['fighting-style']).toEqual(['archery']);
    expect(charAfterCommit.features.some(f => f.index === 'action_surge')).toBe(true);
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
  });

  it('7. Multi-level eligibility leaves the next level pending rather than automatically starting it', async () => {
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
});
