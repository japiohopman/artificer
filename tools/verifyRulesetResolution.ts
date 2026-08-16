import { getActiveRulesetContext } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore } from '../src/store/useCharacterStore';

async function run() {
  console.log('--- Verifying Ruleset Context & Resolution ---');

  // 1. Initial Default
  const defaultRuleset = getActiveRulesetContext();
  console.log('Default Ruleset Context:', defaultRuleset);
  if (defaultRuleset !== '2014') {
    console.error('FAILED: Default ruleset should be 2014');
    process.exit(1);
  }

  // 2. Explicit Ruleset
  const explicit2024 = getActiveRulesetContext('2024');
  console.log('Explicit Ruleset Context (2024):', explicit2024);
  if (explicit2024 !== '2024') {
    console.error('FAILED: Explicit ruleset 2024 not respected');
    process.exit(1);
  }

  // 3. Store Sync
  useGameStore.setState({ ruleset: '2024' });
  const storeRuleset = getActiveRulesetContext();
  console.log('GameStore Ruleset Context (2024):', storeRuleset);
  if (storeRuleset !== '2024') {
    console.error('FAILED: GameStore ruleset state not read correctly');
    process.exit(1);
  }

  // 4. Character State Sync
  const mockChar: any = {
    id: 'test-char',
    name: 'Champion 2024',
    ruleset: '2024',
    class: 'Fighter',
    race: 'Human',
    level: 1,
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  };

  useGameStore.setState({ ruleset: '2014' });
  await useCharacterStore.getState().setMainCharacter(mockChar);
  const syncedRuleset = useGameStore.getState().ruleset;
  console.log('Synced Character Ruleset (setMainCharacter):', syncedRuleset);
  if (syncedRuleset !== '2024') {
    console.error('FAILED: setMainCharacter failed to sync character ruleset to useGameStore');
    process.exit(1);
  }

  console.log('✓ All ruleset context & resolution checks passed successfully!');
}

run().catch((err) => {
  console.error('Error during ruleset resolution verification:', err);
  process.exit(1);
});
