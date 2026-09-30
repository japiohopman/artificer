import fs from 'fs';
import path from 'path';

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
  validateLevelUpCommit,
  getLevelFromXP,
  getXpForLevel
} from '../src/lib/progressionUtils';

console.log('Running Level-Up Progression Lifecycle Unit Tests...');

async function runProgressionTests() {
  const store = useCharacterStore.getState();

  // Test Character: Level 1 Fighter
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

  // 1. XP Eligibility Test: Adding 300 XP marks character eligible for Level 2 without mutating level or stats immediately
  if (isEligibleForLevelUp(fighter1)) {
    throw new Error('Fighter level 1 with 0 XP should not be eligible for level up');
  }

  await store.addXp('test_fighter_1', 350); // Level 2 requires 300 XP
  const updatedGarethAfterXp = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;

  if (updatedGarethAfterXp.xp !== 350) {
    throw new Error(`Expected XP 350, got ${updatedGarethAfterXp.xp}`);
  }
  if (updatedGarethAfterXp.level !== 1) {
    throw new Error(`Expected level to remain 1 after addXp, but was mutated to ${updatedGarethAfterXp.level}`);
  }
  if (!isEligibleForLevelUp(updatedGarethAfterXp)) {
    throw new Error('Character with 350 XP at Level 1 must be eligible for Level Up');
  }
  if (getNextLevelTarget(updatedGarethAfterXp) !== 2) {
    throw new Error(`Next level target must be 2, got ${getNextLevelTarget(updatedGarethAfterXp)}`);
  }

  // 2. Start Level Up Session: Target Level 2
  const sessionLvl2 = await store.startLevelUpSession('test_fighter_1');
  if (!sessionLvl2) {
    throw new Error('Failed to evaluate/start Level 2 session');
  }
  if (sessionLvl2.targetLevel !== 2) {
    throw new Error(`Expected session target level 2, got ${sessionLvl2.targetLevel}`);
  }

  // 3. Target Level Feature Leakage Check: Fighter Level 2 grants Action Surge, NOT Fighting Style
  const level2FeatureIndices = sessionLvl2.features.map(f => f.index);
  if (level2FeatureIndices.includes('fighter_fighting_style')) {
    throw new Error('Fighter level 2 session must NOT include Fighter Fighting Style choice/grant');
  }
  if (!level2FeatureIndices.includes('action_surge_1_use')) {
    throw new Error('Fighter level 2 session must include Action Surge');
  }
  if (sessionLvl2.hasASI) {
    throw new Error('Fighter level 2 does not grant ASI');
  }

  // 4. Cancel Session Test: Cancelling session leaves character state untouched
  store.cancelLevelUpSession();
  if (useCharacterStore.getState().activeLevelUpSession !== null) {
    throw new Error('cancelLevelUpSession did not clear active session');
  }
  const garethAfterCancel = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethAfterCancel.level !== 1 || garethAfterCancel.hp !== 12) {
    throw new Error('cancelLevelUpSession mutated character state');
  }

  // 5. Atomic Commit Test for Level 2
  await store.startLevelUpSession('test_fighter_1');
  const committedLvl2 = await store.commitLevelUpSession();
  if (!committedLvl2) {
    throw new Error('Level 2 commit failed');
  }

  const garethLvl2 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethLvl2.level !== 2) {
    throw new Error(`Expected character level 2 after commit, got ${garethLvl2.level}`);
  }
  if (garethLvl2.hp <= 12 || garethLvl2.maxHp <= 12) {
    throw new Error(`Expected HP gain at level 2, got hp ${garethLvl2.hp}`);
  }
  if (!garethLvl2.features.some(f => f.index === 'action_surge_1_use')) {
    throw new Error('Fighter level 2 feature Action Surge was not committed');
  }

  // 6. Subclass Selection Test at Level 3
  // Add XP for level 3 (900 XP total)
  await store.addXp('test_fighter_1', 600); // total 950 XP -> eligible for level 3
  const garethEligibleLvl3 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (!isEligibleForLevelUp(garethEligibleLvl3) || getNextLevelTarget(garethEligibleLvl3) !== 3) {
    throw new Error('Gareth should be eligible for target level 3');
  }

  const sessionLvl3 = await store.startLevelUpSession('test_fighter_1');
  if (!sessionLvl3 || sessionLvl3.targetLevel !== 3) {
    throw new Error('Failed to start level 3 session');
  }

  // Feature at Level 3 is martial_archetype which requires subclass choice
  const hasSubclassChoice = sessionLvl3.features.some(f =>
    f.index === 'martial_archetype' || f.feature_specific?.subfeature_options?.type === 'subclass'
  );
  if (!hasSubclassChoice) {
    throw new Error('Fighter level 3 must offer Martial Archetype subclass choice');
  }

  // 7. Validation Rejection Test: Trying to commit level 3 without selecting subclass must fail and show validation error reason
  const commitAttemptWithoutSubclass = await store.commitLevelUpSession();
  if (commitAttemptWithoutSubclass !== false) {
    throw new Error('Commit without required subclass selection must be rejected');
  }

  const activeSessionAfterReject = useCharacterStore.getState().activeLevelUpSession;
  if (!activeSessionAfterReject) {
    throw new Error('Rejected commit must NOT close the level up session');
  }
  if (!activeSessionAfterReject.validationError) {
    throw new Error('Rejected commit must set a visible validationError reason');
  }

  // Now satisfy subclass choice with 'champion'
  store.updateLevelUpSession({
    choices: { martial_archetype: ['champion'] },
    subclassChoice: 'champion'
  });

  const committedLvl3 = await store.commitLevelUpSession();
  if (!committedLvl3) {
    throw new Error('Level 3 commit with subclass choice failed');
  }

  const garethLvl3 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethLvl3.level !== 3 || garethLvl3.subclass !== 'champion') {
    throw new Error(`Expected level 3 and subclass champion, got level ${garethLvl3.level}, subclass ${garethLvl3.subclass}`);
  }

  // 8. ASI Grant Test at Level 4
  await store.addXp('test_fighter_1', 2000); // Total 2950 XP -> eligible for level 4 (2700 XP)
  const sessionLvl4 = await store.startLevelUpSession('test_fighter_1');
  if (!sessionLvl4 || sessionLvl4.targetLevel !== 4) {
    throw new Error('Failed to start level 4 session');
  }
  if (!sessionLvl4.hasASI) {
    throw new Error('Fighter level 4 must grant ASI');
  }

  // Validation Rejection for ASI: Commit without spending 2 points fails
  const commitWithoutASI = await store.commitLevelUpSession();
  if (commitWithoutASI !== false) {
    throw new Error('Commit level 4 without allocating ASI points must fail');
  }

  // Allocate 2 points (STR +1, CON +1)
  store.updateLevelUpSession({
    statIncreases: { str: 1, con: 1 }
  });

  const committedLvl4 = await store.commitLevelUpSession();
  if (!committedLvl4) {
    throw new Error('Level 4 commit with ASI allocation failed');
  }

  const garethLvl4 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethLvl4.level !== 4 || garethLvl4.stats.str !== 17 || garethLvl4.stats.con !== 15) {
    throw new Error(`Expected level 4, STR 17, CON 15; got level ${garethLvl4.level}, STR ${garethLvl4.stats.str}, CON ${garethLvl4.stats.con}`);
  }

  // 9. Multi-level Eligibility & Non-Silent Commit Control Test
  // Add 10,000 XP at once (XP for Level 6)
  await store.addXp('test_fighter_1', 12000); // 14,950 XP total -> eligible for Level 6
  const garethMultiLevel = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethMultiLevel.level !== 4) {
    throw new Error(`Level should remain 4 until explicit level-up session, got ${garethMultiLevel.level}`);
  }

  // Start Level Up -> must target Level 5 (exactly level + 1)
  const sessionMulti = await store.startLevelUpSession('test_fighter_1');
  if (sessionMulti?.targetLevel !== 5) {
    throw new Error(`Starting level up when eligible for multiple levels must target exactly level 5, got ${sessionMulti?.targetLevel}`);
  }

  // Commit Level 5
  await store.commitLevelUpSession();
  const garethLvl5 = useCharacterStore.getState().characters.find(c => c.id === 'test_fighter_1')!;
  if (garethLvl5.level !== 5) {
    throw new Error(`Expected level 5 after commit, got ${garethLvl5.level}`);
  }

  // After committing level 5, character remains eligible for level 6, but level 6 is NOT auto-committed!
  if (!isEligibleForLevelUp(garethLvl5) || getNextLevelTarget(garethLvl5) !== 6) {
    throw new Error('Character should remain eligible for level 6 after level 5 commit');
  }
  if (useCharacterStore.getState().activeLevelUpSession !== null) {
    throw new Error('Active level up session must be cleared after commit; level 6 must not auto-start');
  }

  console.log('✓ All Level-Up Progression Lifecycle Unit Tests Passed Successfully!');
}

runProgressionTests().catch(err => {
  console.error('Progression lifecycle unit tests failed:', err);
  process.exit(1);
});
