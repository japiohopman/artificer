import { ItemInstance, InventoryContainer, InventorySlot, EQUIPMENT_SLOT_CATALOG } from '../types/inventory';
import { generateName } from './naming';
import { atlasService, AtlasClass, AtlasSpecies, AtlasBackground } from '../services/atlasService';
import { fetchClassData, fetchBackgroundData, fetchSpeciesData } from '../services/storageService';
import { NPCChoiceResolver } from './npcChoiceResolver';
import { resolvePersonality, generateDeterministicBackstory } from './narrative/narrativeResolver';
import { CharacterPipeline } from './characterPipeline';
import { SeedableRNG } from './naming/rng';

const SLOT_MAP: Record<string, string> = {
  'chest': 'chest',
  'main-hand': 'main_hand',
  'off-hand': 'off_hand',
  'focus': 'focus',
  'neck': 'neck',
  'ring-1': 'ring_1',
  'clothes': 'clothes',
  'acc-1': 'acc_1'
};

export const XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i;
  }
  return 0;
}

export function getXPForLevel(level: number): number {
  return XP_TABLE[Math.min(Math.max(level, 0), 20)] || 0;
}

let globalRngCounter = 0;

function getFallbackRng(): SeedableRNG {
  globalRngCounter = (globalRngCounter + 1) % 1000000;
  return new SeedableRNG(`fallback_rng_${Date.now()}_${globalRngCounter}`);
}

export function rollAbilityScore(customRng?: SeedableRNG): number {
  const rng = customRng || getFallbackRng();
  const rolls = Array.from({ length: 4 }, () => rng.nextInt(1, 6));
  rolls.sort((a, b) => b - a); // Sort descending
  return rolls[0] + rolls[1] + rolls[2]; // Sum top 3
}

export function generateStandardStats(customRng?: SeedableRNG): { str: number; dex: number; con: number; int: number; wis: number; cha: number } {
  const rng = customRng || getFallbackRng();
  return {
    str: rollAbilityScore(rng),
    dex: rollAbilityScore(rng),
    con: rollAbilityScore(rng),
    int: rollAbilityScore(rng),
    wis: rollAbilityScore(rng),
    cha: rollAbilityScore(rng),
  };
}

export function calculateHP(level: number, con: number, diceType: number): number {
  const conMod = Math.floor((con - 10) / 2);
  if (level <= 0) return Math.max(1, Math.floor(diceType / 2) + conMod);
  // Level 1: Max die + Con
  let hp = diceType + conMod;
  // Level 2+: Half die + 1 + Con per level
  for (let i = 2; i <= level; i++) {
    hp += Math.floor(diceType / 2) + 1 + conMod;
  }
  return Math.max(hp, 1);
}

export function randomFromList<T>(list: T[], customRng?: SeedableRNG): T {
  if (list.length === 0) return list[0];
  const rng = customRng || getFallbackRng();
  return rng.pick(list);
}

export const DND_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
];

export const DND_RACES_2014 = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 
  'Halfling', 'Human', 'Tiefling'
];

export const DND_RACES_2024 = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling',
  'Human', 'Orc', 'Tiefling'
];

export const DND_RACES = DND_RACES_2014;

export const DND_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const DND_BACKGROUNDS = [
  'Acolyte', 'Archaeologist', 'Charlatan', 'Criminal', 'Entertainer', 'Faceless', 
  'Far Traveler', 'Folk Hero', 'Gladiator', 'Guild Artisan', 
  'Guild Merchant', 'Haunted One', 'Hermit', 'Knight', 'Noble', 'Outlander', 
  'Pirate', 'Sage', 'Sailor', 'Smuggler', 'Soldier', 'Spy', 'Urchin'
];

export const getModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Fallback CLASS_DATA for backwards compatibility with legacy UI consumers
export const CLASS_DATA: Record<string, any> = {
  'Barbarian': { hitDie: 12, primaryStats: ['str', 'con'], savingThrows: ['str', 'con'] },
  'Bard': { hitDie: 8, primaryStats: ['cha', 'dex'], savingThrows: ['dex', 'cha'] },
  'Cleric': { hitDie: 8, primaryStats: ['wis', 'str'], savingThrows: ['wis', 'cha'] },
  'Druid': { hitDie: 8, primaryStats: ['wis', 'con'], savingThrows: ['int', 'wis'] },
  'Fighter': { hitDie: 10, primaryStats: ['str', 'dex'], savingThrows: ['str', 'con'] },
  'Monk': { hitDie: 8, primaryStats: ['dex', 'wis'], savingThrows: ['str', 'dex'] },
  'Paladin': { hitDie: 10, primaryStats: ['str', 'cha'], savingThrows: ['wis', 'cha'] },
  'Ranger': { hitDie: 10, primaryStats: ['dex', 'wis'], savingThrows: ['str', 'dex'] },
  'Rogue': { hitDie: 8, primaryStats: ['dex', 'int'], savingThrows: ['dex', 'int'] },
  'Sorcerer': { hitDie: 6, primaryStats: ['cha', 'con'], savingThrows: ['con', 'cha'] },
  'Warlock': { hitDie: 8, primaryStats: ['cha', 'wis'], savingThrows: ['wis', 'cha'] },
  'Wizard': { hitDie: 6, primaryStats: ['int', 'wis'], savingThrows: ['int', 'wis'] }
};

export function calculateAC(dex: number, armor: any = null, shield: any = null): number {
  const dexMod = getModifier(dex);
  let baseAC = 10 + dexMod;

  if (armor) {
    if (armor.armor_class) {
      const acData = armor.armor_class;
      if (acData.base) {
        baseAC = acData.base;
        if (acData.dex_bonus) {
          const maxDex = acData.max_bonus ?? 10;
          baseAC += Math.min(dexMod, maxDex);
        }
      }
    }
  }

  if (shield && (shield.armor_category === 'Shield' || shield.index === 'shield')) {
    baseAC += (shield.armor_class?.base || 2);
  }

  return baseAC;
}

export function calculateInitiative(dex: number): number {
  return getModifier(dex);
}

export function resolveStartingEquipment(options: any[], customRng?: SeedableRNG): any[] {
  const items: any[] = [];
  const rng = customRng || getFallbackRng();

  options.forEach(option => {
    const chooseCount = option.choose || 1;
    const fromOptions = option.from?.options || [];

    for (let i = 0; i < chooseCount; i++) {
        if (fromOptions.length === 0) continue;
        const selection: any = rng.pick(fromOptions);
        if (!selection) continue;
        if (selection.option_type === 'multiple') {
            selection.items?.forEach((it: any) => items.push(it.item || it));
        } else if (selection.item) {
            items.push(selection.item);
        } else if (selection.of) {
            items.push(selection.of);
        }
    }
  });

  return items;
}

export const DND_TRAITS = [
  "Speaks in riddles.", "Always checking their pockets.", "Obsessed with hygiene.", "Collects unusual stones.",
  "Never looks anyone in the eye.", "Whistles when nervous.", "Uses overly academic language.", "Deeply suspicious of magic.",
  "Unusually tall for their race.", "Speaks to their equipment.", "Has a collection of exotic spices.", "Never sleeps in the same place twice."
];

export const DND_IDEALS = [
  "Freedom: Chains are meant to be broken.", "Power: Strength is the only thing that matters.", "Charity: Help those who cannot help themselves.",
  "Logic: Emotion must not cloud our judgment.", "Tradition: The old ways are the best ways.", "Creativity: The world is a canvas for my art."
];

export const DND_BONDS = [
  "I will recover a lost family heirloom.", "I owe my life to a local tavern keeper.", "I protect a secret grove from polluters.",
  "I am searching for my long-lost sibling.", "My loyalty lies with my mercenary troupe.", "I am bound to the service of an ancient deity."
];

export const DND_FLAWS = [
  "I am a sucker for a pretty face.", "I can't resist a good bet.", "I have a sharp tongue that gets me into trouble.",
  "I am easily distracted by shiny objects.", "I am terrified of spiders.", "I never admit when I'm wrong."
];

export const HAIR_COLORS = ["Raven Black", "Platinum Blonde", "Chestnut Brown", "Crimson Red", "Silver White", "Midnight Blue", "Forest Green", "Royal Purple", "Ash Grey", "Golden Blonde"];
export const HAIR_STYLES = ["Cropped", "Medium", "Long", "Braided", "Buzzcut", "Elegant Updo", "Messy", "Ponytail", "Shaved", "Flowing", "Top Knot"];
export const EYE_COLORS = ["Emerald Green", "Sapphire Blue", "Amber", "Deep Brown", "Steel Grey", "Violet", "Glowing Gold", "Blood Red", "Cloudy White", "Icy Blue"];
export const SKIN_TONES = [
  { label: 'Pale', hex: '#fdf5e6' },
  { label: 'Fair', hex: '#ffdbac' },
  { label: 'Olive', hex: '#e0ac69' },
  { label: 'Bronzed', hex: '#8d5524' },
  { label: 'Deep', hex: '#3b2219' },
  { label: 'Drow', hex: '#4b5267' },
  { label: 'Orc', hex: '#6b8e23' },
  { label: 'Tiefl Red', hex: '#8b0000' },
  { label: 'Tiefl Purp', hex: '#483d8b' }
];

export const BACKGROUND_DATA: Record<string, any> = {};

let consumerSeedCounter = 0;

export function createConsumerSeed(prefix: string = 'npc_action'): string {
  consumerSeedCounter = (consumerSeedCounter + 1) % 1000000;
  return `${prefix}_${Date.now()}_${consumerSeedCounter}`;
}

/**
 * Modernized, canonical NPC generation function that orchestrates Atlas data,
 * deterministic narrative resolvers, and V2 inventory architecture.
 */
export async function generateNPCAsync(partial: any): Promise<any> {
  const ruleset: '2014' | '2024' = partial.ruleset || '2014';
  const playableSpecies = ruleset === '2024' ? DND_RACES_2024 : DND_RACES_2014;

  const seed = partial.seed || createConsumerSeed(`npc_gen`);
  const rng = new SeedableRNG(seed);

  const className = partial.class && partial.class !== 'Any' ? partial.class : rng.pick(DND_CLASSES);
  const race = partial.race && partial.race !== 'Any' ? partial.race : rng.pick(playableSpecies);
  const alignment = partial.alignment && partial.alignment !== 'Any' ? partial.alignment : rng.pick(DND_ALIGNMENTS);
  const background = partial.background && partial.background !== 'Any' ? partial.background : rng.pick(DND_BACKGROUNDS);
  const level = partial.level !== undefined ? partial.level : 0;
  const gender = partial.gender && partial.gender !== 'Random' ? partial.gender : rng.pick(['Male', 'Female']);

  // Fetch canonical Atlas records for mechanical authority
  const [classData, backgroundData, speciesData] = await Promise.all([
    fetchClassData(className, ruleset),
    fetchBackgroundData(background, ruleset),
    fetchSpeciesData(race, ruleset)
  ]);

  // 1. STATS: Standard stats or Point Buy/Rolling
  const stats = partial.stats || NPCChoiceResolver.resolveStats(partial.statGenMethod || 'Rolling');

  // Hit die and HP calculation from canonical class record
  const hitDie = classData?.hit_die || CLASS_DATA[className]?.hitDie || 8;
  const hp = calculateHP(level, stats.con, hitDie);

  // 2. NAME: Canonical Naming Domain resolution
  const canonicalName = (partial.name && partial.name.trim().length > 0 && partial.name !== 'Random')
    ? partial.name.trim()
    : generateName({
        species: race,
        gender: gender.toLowerCase(),
        background,
        class: className,
        alignment,
        seed
      }).displayName;

  // 3. PERSONALITY: Deterministic narrative resolution from background
  const resolvedPersonality = resolvePersonality(backgroundData, seed);
  const traits = (partial.traits && partial.traits.length > 0) ? partial.traits : resolvedPersonality.traits;
  const ideals = (partial.ideals && partial.ideals.length > 0) ? partial.ideals : resolvedPersonality.ideals;
  const bonds = (partial.bonds && partial.bonds.length > 0) ? partial.bonds : resolvedPersonality.bonds;
  const flaws = (partial.flaws && partial.flaws.length > 0) ? partial.flaws : resolvedPersonality.flaws;

  // 4. BACKSTORY: Deterministic backstory prose from character inputs
  const backstory = (partial.backstory && partial.backstory.trim().length > 0)
    ? partial.backstory
    : generateDeterministicBackstory({
        name: canonicalName,
        race,
        subrace: partial.subrace,
        class: className,
        subclass: partial.subclass,
        background,
        alignment,
        traits,
        ideals,
        bonds,
        flaws
      }, seed);

  // 5. APPEARANCE
  const skin = rng.pick(SKIN_TONES);
  const appearance = partial.appearance || {
    hairColor: rng.pick(HAIR_COLORS),
    hairStyle: rng.pick(HAIR_STYLES),
    bodyType: rng.pick(["Slender", "Athletic", "Heavy-set", "Average", "Wiry"]),
    eyeColor: rng.pick(EYE_COLORS),
    skinColor: skin.hex,
    height: `${rng.nextInt(5, 6)}'${rng.nextInt(0, 11)}"`,
    weight: `${rng.nextInt(120, 220)} lbs`
  };

  // 6. PROFICIENCIES & FEATURES
  const proficiencies = partial.proficiencies && partial.proficiencies.length > 0
    ? partial.proficiencies
    : NPCChoiceResolver.resolveAllProficiencies(classData, backgroundData, speciesData);

  const features = partial.features || classData?.features || [];

  // 7. SPELLS
  const spells = partial.spells || await NPCChoiceResolver.resolveSpells(classData);

  // 8. EQUIPMENT: V2 canonical manifestation
  const startingEquipment = await NPCChoiceResolver.resolveFullStartingEquipment(classData, backgroundData);

  const npcId = partial.id || `npc-${Date.now()}`;
  const npcIndex = npcId.toLowerCase().replace(/\s+/g, '_');
  const repo = "japiohopman/artificer";
  const branch = "main";
  const githubBase = `https://github.com/${repo}/blob/${branch}/`;

  return {
    id: npcId,
    ruleset,
    saveVersion: 2,
    name: canonicalName,
    class: className,
    race,
    gender,
    level,
    xp: getXPForLevel(level),
    alignment,
    background,
    stats,
    proficiencies,
    traits,
    features,
    flaws,
    ideals,
    bonds,
    backstory,
    appearance,
    inventory: startingEquipment.inventory,
    backpack: startingEquipment.backpack,
    // v2 Manifestation
    items: startingEquipment.v2.items,
    containers: startingEquipment.v2.containers,
    equipment: startingEquipment.v2.equipment,
    spells,
    choices: partial.choices || {},
    hp,
    maxHp: hp,
    money: partial.money || NPCChoiceResolver.resolveStartingMoney(),
    voiceProfile: partial.voiceProfile || `${className} ${gender} voice`,
    isNpc: true,
    isRecruitable: true,
    dataPath: `${githubBase}public/assets/atlas/character/npc_character_profiles/json/${npcIndex}.json`
  };
}

/**
 * Synchronous generateNPC wrapper for backwards compatibility with legacy callers.
 */
export function generateNPC(partial: any): any {
  const ruleset: '2014' | '2024' = partial.ruleset || '2014';
  const playableSpecies = ruleset === '2024' ? DND_RACES_2024 : DND_RACES_2014;

  const seed = partial.seed || createConsumerSeed('npc_sync');
  const rng = new SeedableRNG(seed);

  const className = partial.class && partial.class !== 'Any' ? partial.class : rng.pick(DND_CLASSES);
  const race = partial.race && partial.race !== 'Any' ? partial.race : rng.pick(playableSpecies);
  const alignment = partial.alignment && partial.alignment !== 'Any' ? partial.alignment : rng.pick(DND_ALIGNMENTS);
  const background = partial.background && partial.background !== 'Any' ? partial.background : rng.pick(DND_BACKGROUNDS);
  const level = partial.level !== undefined ? partial.level : 0;
  const gender = partial.gender && partial.gender !== 'Random' ? partial.gender : rng.pick(['Male', 'Female']);

  const canonicalName = (partial.name && partial.name.trim().length > 0 && partial.name !== 'Random')
    ? partial.name.trim()
    : generateName({
        species: race,
        gender: gender.toLowerCase(),
        background,
        class: className,
        alignment,
        seed
      }).displayName;

  const stats = partial.stats || generateStandardStats(rng);
  const classInfo = CLASS_DATA[className] || CLASS_DATA['Fighter'];
  const hitDie = classInfo.hitDie || 8;
  const hp = calculateHP(level, stats.con, hitDie);

  const resolvedPersonality = resolvePersonality(null, seed);
  const traits = (partial.traits && partial.traits.length > 0) ? partial.traits : (resolvedPersonality.traits.length > 0 ? resolvedPersonality.traits : [rng.pick(DND_TRAITS)]);
  const ideals = (partial.ideals && partial.ideals.length > 0) ? partial.ideals : (resolvedPersonality.ideals.length > 0 ? resolvedPersonality.ideals : [rng.pick(DND_IDEALS)]);
  const bonds = (partial.bonds && partial.bonds.length > 0) ? partial.bonds : (resolvedPersonality.bonds.length > 0 ? resolvedPersonality.bonds : [rng.pick(DND_BONDS)]);
  const flaws = (partial.flaws && partial.flaws.length > 0) ? partial.flaws : (resolvedPersonality.flaws.length > 0 ? resolvedPersonality.flaws : [rng.pick(DND_FLAWS)]);

  const backstory = (partial.backstory && partial.backstory.trim().length > 0)
    ? partial.backstory
    : generateDeterministicBackstory({
        name: canonicalName,
        race,
        subrace: partial.subrace,
        class: className,
        subclass: partial.subclass,
        background,
        alignment,
        traits,
        ideals,
        bonds,
        flaws
      }, seed);

  const skin = rng.pick(SKIN_TONES);
  const appearance = partial.appearance || {
    hairColor: rng.pick(HAIR_COLORS),
    hairStyle: rng.pick(HAIR_STYLES),
    bodyType: rng.pick(["Slender", "Athletic", "Heavy-set", "Average", "Wiry"]),
    eyeColor: rng.pick(EYE_COLORS),
    skinColor: skin.hex,
    height: `${rng.nextInt(5, 6)}'${rng.nextInt(0, 11)}"`,
    weight: `${rng.nextInt(120, 220)} lbs`
  };

  const npcId = partial.id || `npc-${Date.now()}`;
  const npcIndex = npcId.toLowerCase().replace(/\s+/g, '_');
  const repo = "japiohopman/artificer";
  const branch = "main";
  const githubBase = `https://github.com/${repo}/blob/${branch}/`;

  const itemsRegistry: Record<string, ItemInstance> = {};
  const v2Backpack: InventoryContainer = {
    id: `backpack_${npcId}`,
    name: "Backpack",
    type: "backpack",
    slots: Array.from({ length: 120 }, (_, i) => ({ id: `slot_${i}`, itemId: null }))
  };
  const v2Equipment = {
    containerId: `equipment_${npcId}`,
    slots: [...EQUIPMENT_SLOT_CATALOG].map(s => ({ ...s, itemId: null }))
  };

  return {
    id: npcId,
    ruleset,
    saveVersion: 2,
    name: canonicalName,
    class: className,
    race,
    gender,
    level,
    xp: getXPForLevel(level),
    alignment,
    background,
    stats,
    proficiencies: partial.proficiencies || [],
    traits,
    features: partial.features || classInfo.features || [],
    flaws,
    ideals,
    bonds,
    backstory,
    appearance,
    inventory: partial.inventory || {},
    backpack: partial.backpack || [],
    items: partial.items || itemsRegistry,
    containers: partial.containers || { [v2Backpack.id]: v2Backpack },
    equipment: partial.equipment || v2Equipment,
    spells: partial.spells || [],
    choices: partial.choices || {},
    hp,
    maxHp: hp,
    money: partial.money || { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    voiceProfile: partial.voiceProfile || `${className} ${gender} voice`,
    isNpc: true,
    isRecruitable: true,
    dataPath: `${githubBase}public/assets/atlas/character/npc_character_profiles/json/${npcIndex}.json`
  };
}
