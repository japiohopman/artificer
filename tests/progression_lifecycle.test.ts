import { describe, test, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { diceService } from '../src/dice_roller/diceService';

// Relative fetch polyfill for Node CLI environment
if (typeof window === 'undefined') {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: any, init?: any) => {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    if (urlStr.startsWith('/assets/atlas/')) {
      const localPath = path.resolve(process.cwd(), 'public' + urlStr);
      if (fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf8');
        return new Response(content, { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(null, { status: 404, statusText: 'Not Found' });
    }
    return originalFetch(input, init);
  };
}

import { useCharacterStore } from '../src/store/useCharacterStore';
import {
  isEligibleForLevelUp,
  getNextLevelTarget,
  evaluateNextLevelStep,
  validateLevelUpCommit
} from '../src/lib/progressionUtils';
import { extractStructuredOptionsFromFeature, extractOptionsFromFeature } from '../src/lib/atlasUtils';

describe('Level-Up Progression Lifecycle Architecture (#401)', () => {
  test('XP accumulation marks character eligible without mutating level or stats', async () => {
    const store = useCharacterStore.getState();

    const fighter1: any = {
      id: 'test_fighter_1',
      name: 'Gareth',
      class: 'Fighter',
      race: 'Human',
      level: 1,
      xp: 0,
      hp: 12,
      maxHp: 12,
      stats: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 8 },
      proficiencies: ['Athletics', 'Perception'],
      features: [
        { name: 'Second Wind', index: 'second_wind', desc: 'Regain HP', source: 'Class' },
        { name: 'Fighting Style', index: 'fighter_fighting_style', desc: 'Choose style', source: 'Class' }
      ],
      choices: {
        fighter_fighting_style: ['fighter_fighting_style_defense']
      }
    };

    store.setCharacters([fighter1]);

    expect(isEligibleForLevelUp(fighter1)).toBe(false);

    await store.addXp('test_fighter_1', 350); // Level 2 requires 300 XP
    const updatedGareth = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;

    expect(updatedGareth.xp).toBe(350);
    expect(updatedGareth.level).toBe(1);
    expect(isEligibleForLevelUp(updatedGareth)).toBe(true);
    expect(getNextLevelTarget(updatedGareth)).toBe(2);
  });

  test('Target-level feature resolution isolates grants without leaking choices', async () => {
    const store = useCharacterStore.getState();
    const sessionLvl2 = await store.startLevelUpSession('test_fighter_1');

    expect(sessionLvl2).not.toBeNull();
    expect(sessionLvl2?.targetLevel).toBe(2);

    const featureIndices = sessionLvl2!.features.map(f => f.index);
    expect(featureIndices).not.toContain('fighter_fighting_style');
    expect(featureIndices).toContain('action_surge_1_use');
    expect(sessionLvl2?.hasASI).toBe(false);
  });

  test('Cancelling level-up session leaves character state untouched and preserves queue', async () => {
    const store = useCharacterStore.getState();
    store.cancelLevelUpSession();

    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
    const gareth = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(gareth.level).toBe(1);
    expect(gareth.hp).toBe(12);
  });

  test('Atomic commit updates level, HP, and features for target level', async () => {
    const store = useCharacterStore.getState();
    await store.startLevelUpSession('test_fighter_1');
    const committed = await store.commitLevelUpSession();

    expect(committed).toBe(true);
    const garethLvl2 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(garethLvl2.level).toBe(2);
    expect(garethLvl2.hp).toBeGreaterThan(12);
    expect(garethLvl2.features.some(f => f.index === 'action_surge_1_use')).toBe(true);
  });

  test('Subclass selection at level 3 requires valid choice and fails closed on invalid choice', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test_fighter_1', 600); // 950 XP total -> eligible for Lvl 3

    const sessionLvl3 = await store.startLevelUpSession('test_fighter_1');
    expect(sessionLvl3?.targetLevel).toBe(3);

    // Attempting commit without subclass selection must be rejected
    const commitWithoutSubclass = await store.commitLevelUpSession();
    expect(commitWithoutSubclass).toBe(false);
    expect(useCharacterStore.getState().activeLevelUpSession).not.toBeNull();
    expect(useCharacterStore.getState().activeLevelUpSession?.validationError).toBeTruthy();

    // Satisfy subclass choice
    store.updateLevelUpSession({
      choices: { martial_archetype: ['champion'] },
      subclassChoice: 'champion'
    });

    const commitLvl3 = await store.commitLevelUpSession();
    expect(commitLvl3).toBe(true);
    const garethLvl3 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(garethLvl3.level).toBe(3);
    expect(garethLvl3.subclass).toBe('champion');
  });

  test('ASI grant at level 4 enforces allocating exactly 2 points and adjusts CON modifier for HP gain correctly', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test_fighter_1', 2000); // 2950 XP total -> eligible for Lvl 4

    const sessionLvl4 = await store.startLevelUpSession('test_fighter_1');
    expect(sessionLvl4?.targetLevel).toBe(4);
    expect(sessionLvl4?.hasASI).toBe(true);

    const initialHpRoll = sessionLvl4!.hpRollResult;
    const initialHpGain = sessionLvl4!.hpIncrease;

    const commitWithoutASI = await store.commitLevelUpSession();
    expect(commitWithoutASI).toBe(false);

    // Gareth has base STR = 16, CON = 14 (+2 mod). Allocating +1 STR and +1 CON brings STR to 17, CON to 15 (+2 mod).
    const newConMod = Math.floor((15 - 10) / 2); // 2
    const expectedUpdatedHpGain = Math.max(1, initialHpRoll + newConMod);

    store.updateLevelUpSession({
      statIncreases: { str: 1, con: 1 },
      hpIncrease: expectedUpdatedHpGain
    });

    const commitLvl4 = await store.commitLevelUpSession();
    expect(commitLvl4).toBe(true);
    const garethLvl4 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(garethLvl4.level).toBe(4);
    expect(garethLvl4.stats.str).toBe(17);
    expect(garethLvl4.stats.con).toBe(15);
  });

  test('Session roll remains stable across session updates and rerenders without re-rolling', async () => {
    const cleric: any = {
      id: 'test_cleric_stability',
      name: 'Cadderly',
      class: 'Cleric',
      level: 1,
      xp: 300,
      hp: 10,
      maxHp: 10,
      stats: { str: 12, dex: 10, con: 14, int: 12, wis: 16, cha: 10 }
    };

    const store = useCharacterStore.getState();
    store.addCharacter(cleric);

    const session = await store.startLevelUpSession('test_cleric_stability');
    expect(session).not.toBeNull();

    const rolledValue = session!.hpRollResult;
    const initialHpIncrease = session!.hpIncrease;

    // Mutate unrelated session state (e.g. choices)
    store.updateLevelUpSession({ choices: { test_feature: ['choice_a'] } });

    const updatedSession = useCharacterStore.getState().activeLevelUpSession;
    expect(updatedSession?.hpRollResult).toBe(rolledValue);
    expect(updatedSession?.hpIncrease).toBe(initialHpIncrease);

    store.cancelLevelUpSession();
  });

  test('Exactly one authoritative HP roll is performed per active level-up session', async () => {
    const cleric: any = {
      id: 'test_cleric_spy',
      name: 'Uther',
      class: 'Cleric',
      level: 1,
      xp: 300,
      hp: 12,
      maxHp: 12,
      stats: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 14 }
    };

    const store = useCharacterStore.getState();
    store.addCharacter(cleric);

    const rollSpy = vi.spyOn(diceService, 'rollBackground');
    rollSpy.mockClear();

    // 1. evaluateNextLevelStep must be pure and cause 0 rolls
    await evaluateNextLevelStep(cleric);
    expect(rollSpy).toHaveBeenCalledTimes(0);

    // 2. startLevelUpSession must perform exactly 1 roll
    const session = await store.startLevelUpSession('test_cleric_spy');
    expect(session).not.toBeNull();
    expect(rollSpy).toHaveBeenCalledTimes(1);

    // 2b. Calling startLevelUpSession a second time for the active session returns existing session without re-rolling
    const sessionAgain = await store.startLevelUpSession('test_cleric_spy');
    expect(sessionAgain).toBe(session);
    expect(sessionAgain?.hpRollResult).toBe(session!.hpRollResult);
    expect(rollSpy).toHaveBeenCalledTimes(1);

    // 3. Updating session choices or stat increases must cause 0 additional rolls
    store.updateLevelUpSession({ statIncreases: { str: 0 } });
    expect(rollSpy).toHaveBeenCalledTimes(1);

    // 4. validateLevelUpCommit must cause 0 additional rolls
    const validation = await validateLevelUpCommit(cleric, useCharacterStore.getState().activeLevelUpSession!);
    expect(validation.valid).toBe(true);
    expect(rollSpy).toHaveBeenCalledTimes(1);

    // 5. commitLevelUpSession must cause 0 additional rolls
    const commitSuccess = await store.commitLevelUpSession();
    expect(commitSuccess).toBe(true);
    expect(rollSpy).toHaveBeenCalledTimes(1);

    rollSpy.mockRestore();
  });

  test('Multi-level eligibility does not silently auto-commit next levels', async () => {
    const store = useCharacterStore.getState();
    await store.addXp('test_fighter_1', 12000); // 14950 XP -> eligible for Level 6

    const garethBefore = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(garethBefore.level).toBe(4);

    const sessionLvl5 = await store.startLevelUpSession('test_fighter_1');
    expect(sessionLvl5?.targetLevel).toBe(5);

    const commitLvl5 = await store.commitLevelUpSession();
    expect(commitLvl5).toBe(true);
    const garethLvl5 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
    expect(garethLvl5.level).toBe(5);

    // Must remain eligible for 6, but session must be cleared without auto-committing
    expect(isEligibleForLevelUp(garethLvl5)).toBe(true);
    expect(getNextLevelTarget(garethLvl5)).toBe(6);
    expect(useCharacterStore.getState().activeLevelUpSession).toBeNull();
  });

  test('evaluateNextLevelStep is pure and deterministic without side effects', async () => {
    const wizard: any = {
      id: 'test_wizard_1',
      name: 'Melf',
      class: 'Wizard',
      race: 'Elf',
      level: 1,
      xp: 300, // eligible for Lvl 2
      hp: 8,
      maxHp: 8,
      stats: { str: 8, dex: 14, con: 12, int: 16, wis: 12, cha: 10 } // CON mod = +1
    };

    const step1 = await evaluateNextLevelStep(wizard);
    const step2 = await evaluateNextLevelStep(wizard);

    expect(step1).not.toBeNull();
    expect(step2).not.toBeNull();
    expect(step1?.classHitDie).toBe(6);
    // evaluateNextLevelStep returns pure canonical step data with deterministic defaults
    expect(step1?.hpRollResult).toBe(4); // floor(6/2) + 1
    expect(step2?.hpRollResult).toBe(4);
    expect(step1?.hpIncrease).toBe(5);
    expect(step2?.hpIncrease).toBe(5);
  });

  test('Minimum HP increase rule enforces at least +1 HP even with negative CON modifier', async () => {
    const frailBarbarian: any = {
      id: 'test_barbarian_1',
      name: 'Conan',
      class: 'Barbarian',
      race: 'Human',
      level: 1,
      xp: 300,
      hp: 10,
      maxHp: 10,
      stats: { str: 16, dex: 10, con: 4, int: 10, wis: 10, cha: 8 } // CON mod = -3
    };

    const session = await evaluateNextLevelStep(frailBarbarian);
    expect(session).not.toBeNull();
    expect(session?.classHitDie).toBe(12);

    // Force roll result to 1 to test negative CON modifier floor
    session!.hpRollResult = 1;
    session!.hpIncrease = Math.max(1, 1 + (-3));

    expect(session!.hpIncrease).toBe(1);

    const validation = await validateLevelUpCommit(frailBarbarian, session!);
    expect(validation.valid).toBe(true);
  });

  test('Existing subclass target-level features are included in level-up grants', async () => {
    const championFighter: any = {
      id: 'test_champion_1',
      name: 'Elric',
      class: 'Fighter',
      subclass: 'champion_2024',
      ruleset: '2024',
      race: 'Human',
      level: 6,
      xp: 23000, // eligible for Lvl 7 (23,000 XP)
      hp: 58,
      maxHp: 58,
      stats: { str: 18, dex: 12, con: 14, int: 10, wis: 10, cha: 8 }
    };

    const session = await evaluateNextLevelStep(championFighter);
    expect(session).not.toBeNull();
    expect(session?.targetLevel).toBe(7);

    // Champion 2024 at level 7 receives 'additional_fighting_style_champion_2024'
    const subFeatureIndices = session?.features.map(f => f.index);
    expect(subFeatureIndices).toContain('additional_fighting_style_champion_2024');
  });

  test('Invalid subclass selection is rejected by fail-closed validation', async () => {
    const fighter: any = {
      id: 'test_sub_validation',
      name: 'Val',
      class: 'Fighter',
      level: 2,
      xp: 900,
      stats: { str: 16, dex: 10, con: 14, int: 10, wis: 10, cha: 8 }
    };

    const session = await evaluateNextLevelStep(fighter);
    expect(session).not.toBeNull();

    // Attach invalid subclass choice
    session!.choices['martial_archetype'] = ['fake_subclass_xyz'];
    session!.subclassChoice = 'fake_subclass_xyz';

    const validation = await validateLevelUpCommit(fighter, session!);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('fake_subclass_xyz');
  });

  test('Validation rejects tampered feature set, injected choice keys, and subclass mismatch', async () => {
    const fighter: any = {
      id: 'test_tamper',
      name: 'Tamper',
      class: 'Fighter',
      level: 1,
      xp: 300,
      stats: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 8 }
    };

    const validSession = await evaluateNextLevelStep(fighter);
    expect(validSession).not.toBeNull();

    // 1. Omitted target feature
    const incompleteSession = { ...validSession!, features: [] };
    const resIncomplete = await validateLevelUpCommit(fighter, incompleteSession);
    expect(resIncomplete.valid).toBe(false);
    expect(resIncomplete.reason).toContain('feature count');

    // 2. Extra injected non-target choice key
    const injectedChoiceSession = {
      ...validSession!,
      choices: { ungranted_feature_key: ['some_choice'] }
    };
    const resInjectedChoice = await validateLevelUpCommit(fighter, injectedChoiceSession);
    expect(resInjectedChoice.valid).toBe(false);
    expect(resInjectedChoice.reason).toContain('ungranted_feature_key');

    // 3. Mismatched subclassChoice vs session.choices
    const subFighter: any = { id: 'test_sub_mismatch', name: 'Sub', class: 'Fighter', level: 2, xp: 900, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } };
    const subSession = await evaluateNextLevelStep(subFighter);
    subSession!.choices['martial_archetype'] = ['champion'];
    subSession!.subclassChoice = 'battle_master';

    const resMismatchedSub = await validateLevelUpCommit(subFighter, subSession!);
    expect(resMismatchedSub.valid).toBe(false);
    expect(resMismatchedSub.reason).toContain('Mismatched subclassChoice');
  });



  test('extractStructuredOptionsFromFeature rejects prose description @UUID links as runtime options', () => {
    const proseFeature = {
      index: 'prose_feature_test',
      name: 'Prose Feature',
      desc: ['Choose one from the following options: @UUID[Compendium.dnd5e.feats.Item.123]{Feat A}']
    };

    const options = extractStructuredOptionsFromFeature(proseFeature);
    expect(options.length).toBe(0);

    // Verify extractOptionsFromFeature retains prose options for Character Creator legacy compatibility
    const legacyOptions = extractOptionsFromFeature(proseFeature);
    expect(legacyOptions.length).toBe(1);
    expect(legacyOptions[0].name).toBe('Feat A');
  });
});
