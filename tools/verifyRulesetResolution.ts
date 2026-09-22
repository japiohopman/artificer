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

  // 5. Downstream Atlas Loaders Resolution Check (Feats, Class Levels, Spells)
  const { fetchFeatData, fetchClassLevels, fetchSpellData, fetchEquipmentData, fetchMonsterData } = await import('../src/services/storageService');
  const { atlasService } = await import('../src/services/atlasService');

  // A. Feat Resolution Check
  const feat2024 = await fetchFeatData('archery', '2024');
  console.log('Feat 2024 (Archery) rulesetContext:', feat2024?.rulesetContext);
  if (feat2024?.rulesetContext !== '2024') {
    console.error('FAILED: Feat 2024 (Archery) did not return rulesetContext 2024');
    process.exit(1);
  }

  const feat2014 = await fetchFeatData('war_caster', '2014');
  console.log('Feat 2014 (War Caster) rulesetContext:', feat2014?.rulesetContext);
  if (feat2014?.rulesetContext !== '2014') {
    console.error('FAILED: Feat 2014 (War Caster) did not return rulesetContext 2014');
    process.exit(1);
  }

  // B. Class Levels Resolution Check
  const fighterLevels14 = await fetchClassLevels('fighter', '2014');
  console.log('Fighter Levels 2014 count:', fighterLevels14?.length, 'level 1 rulesetContext:', fighterLevels14?.[0]?.rulesetContext);
  if (!fighterLevels14 || fighterLevels14.length === 0 || fighterLevels14[0]?.rulesetContext !== '2014') {
    console.error('FAILED: Fighter levels 2014 failed or reported incorrect rulesetContext');
    process.exit(1);
  }

  const fighterLevels24 = await fetchClassLevels('fighter', '2024');
  if (fighterLevels24?.[0]?.rulesetContext === '2024') {
    console.log('Fighter Levels 2024 successfully resolved distinct 2024 data.');
  } else {
    console.log('INFO: Repository has no distinct /24/ class levels dataset for fighter. Fallback returned 2014 content with rulesetContext:', fighterLevels24?.[0]?.rulesetContext);
  }

  // C. Spell Resolution Check
  const fireball14 = await fetchSpellData('fireball', '2014');
  console.log('Spell Fireball 2014 rulesetContext:', fireball14?.rulesetContext);
  if (fireball14?.rulesetContext !== '2014') {
    console.error('FAILED: Fireball 2014 spell data did not return rulesetContext 2014');
    process.exit(1);
  }

  const fireball24 = await fetchSpellData('fireball', '2024');
  if (fireball24?.rulesetContext === '2024') {
    console.log('Spell Fireball 2024 successfully resolved distinct 2024 data.');
  } else {
    console.log('INFO: Repository has no distinct /24/ spell dataset for fireball. Fallback returned 2014 content with rulesetContext:', fireball24?.rulesetContext);
  }

  // D. Equipment 2024 Check
  const dagger24 = await fetchEquipmentData('dagger', '2024');
  console.log('Equipment Dagger 2024 rulesetContext:', dagger24?.rulesetContext);
  if (dagger24?.rulesetContext !== '2024') {
    console.error('FAILED: Equipment Dagger 2024 did not return rulesetContext 2024');
    process.exit(1);
  }

  // D. AtlasService Wrapper Checks
  const atlasFeat = await atlasService.loadFeat('archery', '2024');
  if (atlasFeat?.rulesetContext !== '2024') {
    console.error('FAILED: atlasService.loadFeat 2024 failed');
    process.exit(1);
  }

  const atlasLevel = await atlasService.loadLevelData('fighter', 1, '2014');
  if (atlasLevel?.rulesetContext !== '2014') {
    console.error('FAILED: atlasService.loadLevelData 2014 failed');
    process.exit(1);
  }

  const atlasSpell = await atlasService.loadSpell('fireball', '2014');
  if (atlasSpell?.rulesetContext !== '2014') {
    console.error('FAILED: atlasService.loadSpell 2014 failed');
    process.exit(1);
  }

  const atlasEquip = await atlasService.loadEquipment('dagger', '2014');
  if (atlasEquip?.rulesetContext !== '2014') {
    console.error('FAILED: atlasService.loadEquipment 2014 failed');
    process.exit(1);
  }

  const atlasEnemy = await atlasService.loadEnemy('gargoyle', '2014');
  if (atlasEnemy?.rulesetContext !== '2014') {
    console.error('FAILED: atlasService.loadEnemy 2014 failed');
    process.exit(1);
  }

  console.log('✓ All ruleset context, resolution, character switching & downstream loader checks passed successfully!');
}

run().catch((err) => {
  console.error('Error during ruleset resolution verification:', err);
  process.exit(1);
});
