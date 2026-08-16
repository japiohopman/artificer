import { getActiveRulesetContext } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore, Character } from '../src/store/useCharacterStore';

async function run() {
  console.log('--- Verifying Ruleset Context, Resolution & Character Switching ---');

  // 1. Initial Default Context
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

  // 4. Character Switching & Ruleset Persistence Test
  const char2014: Character = {
    id: 'char-2014',
    name: 'Veteran 2014',
    ruleset: '2014',
    class: 'Fighter',
    race: 'Human',
    gender: 'Male',
    level: 1,
    xp: 0,
    alignment: 'True Neutral',
    background: 'Soldier',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    proficiencies: [],
    traits: [],
    features: [],
    flaws: [],
    ideals: [],
    bonds: [],
    backstory: '',
    languages: ['common'],
    appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
    inventory: {},
    backpack: [],
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {},
    choices: {},
    hp: 10,
    maxHp: 10,
    money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
  };

  const char2024: Character = {
    ...char2014,
    id: 'char-2024',
    name: 'Champion 2024',
    ruleset: '2024'
  };

  // Add characters to store
  useCharacterStore.setState({ characters: [char2014, char2024] });

  // Activate Character 2014 -> expect gameStore ruleset === 2014
  await useCharacterStore.getState().setActiveCharacter('char-2014');
  let currentRuleset = useGameStore.getState().ruleset;
  console.log('Active Character 2014 -> GameStore Ruleset:', currentRuleset);
  if (currentRuleset !== '2014') {
    console.error('FAILED: Active character 2014 did not set ruleset to 2014');
    process.exit(1);
  }

  // Switch to Character 2024 -> expect gameStore ruleset === 2024
  await useCharacterStore.getState().setActiveCharacter('char-2024');
  currentRuleset = useGameStore.getState().ruleset;
  console.log('Active Character 2024 -> GameStore Ruleset:', currentRuleset);
  if (currentRuleset !== '2024') {
    console.error('FAILED: Active character 2024 did not set ruleset to 2024');
    process.exit(1);
  }

  // Switch back to Character 2014 -> expect gameStore ruleset === 2014
  await useCharacterStore.getState().setActiveCharacter('char-2014');
  currentRuleset = useGameStore.getState().ruleset;
  console.log('Switch Back Character 2014 -> GameStore Ruleset:', currentRuleset);
  if (currentRuleset !== '2014') {
    console.error('FAILED: Switching back to 2014 character failed');
    process.exit(1);
  }

  console.log('✓ All ruleset context, resolution & character switching checks passed successfully!');
}

run().catch((err) => {
  console.error('Error during ruleset resolution verification:', err);
  process.exit(1);
});
