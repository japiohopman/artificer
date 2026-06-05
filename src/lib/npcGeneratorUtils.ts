
import { ItemInstance, InventoryContainer, InventorySlot, EQUIPMENT_SLOT_CATALOG } from '../types/inventory';

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

export function rollAbilityScore(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a); // Sort descending
  return rolls[0] + rolls[1] + rolls[2]; // Sum top 3
}

export function generateStandardStats(): { str: number; dex: number; con: number; int: number; wis: number; cha: number } {
  return {
    str: rollAbilityScore(),
    dex: rollAbilityScore(),
    con: rollAbilityScore(),
    int: rollAbilityScore(),
    wis: rollAbilityScore(),
    cha: rollAbilityScore(),
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

export function randomFromList<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export const DND_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
];

export const DND_RACES = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 
  'Halfling', 'Human', 'Tiefling', 'High Elf', 'Hill Dwarf', 
  'Lightfoot Halfling', 'Rock Gnome'
];

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

export const CLASS_DATA: Record<string, any> = {
  'Barbarian': {
    hitDie: 12,
    primaryStats: ['str', 'con'],
    savingThrows: ['str', 'con'],
    startingEquipment: [
      { type: 'weapon', index: 'greataxe', slot: 'main-hand' },
      { type: 'weapon', index: 'handaxe', quantity: 2, slot: 'off-hand' }, // One in hand, one in backpack
      { type: 'pack', index: 'explorers-pack' },
      { type: 'weapon', index: 'javelin', quantity: 4 }
    ]
  },
  'Bard': {
    hitDie: 8,
    primaryStats: ['cha', 'dex'],
    savingThrows: ['dex', 'cha'],
    startingEquipment: [
      { type: 'weapon', index: 'rapier', slot: 'main-hand' },
      { type: 'pack', index: 'entertainers-pack' },
      { type: 'instrument', index: 'lute', slot: 'focus' },
      { type: 'armor', index: 'leather-armor', slot: 'chest' },
      { type: 'weapon', index: 'dagger', slot: 'off-hand' }
    ]
  },
  'Cleric': {
    hitDie: 8,
    primaryStats: ['wis', 'str'],
    savingThrows: ['wis', 'cha'],
    startingEquipment: [
      { type: 'weapon', index: 'mace', slot: 'main-hand' },
      { type: 'armor', index: 'scale-mail', slot: 'chest' },
      { type: 'armor', index: 'shield', slot: 'off-hand' },
      { type: 'pack', index: 'priests-pack' },
      { type: 'focus', index: 'holy-symbol', slot: 'neck' }
    ]
  },
  'Druid': {
    hitDie: 8,
    primaryStats: ['wis', 'con'],
    savingThrows: ['int', 'wis'],
    startingEquipment: [
      { type: 'weapon', index: 'scimitar', slot: 'main-hand' },
      { type: 'armor', index: 'leather-armor', slot: 'chest' },
      { type: 'armor', index: 'shield', slot: 'off-hand' },
      { type: 'pack', index: 'explorers-pack' },
      { type: 'focus', index: 'druidic-focus', slot: 'focus' }
    ]
  },
  'Fighter': {
    hitDie: 10,
    primaryStats: ['str', 'dex'],
    savingThrows: ['str', 'con'],
    startingEquipment: [
      { type: 'armor', index: 'chain-mail', slot: 'chest' },
      { type: 'weapon', index: 'longsword', slot: 'main-hand' },
      { type: 'armor', index: 'shield', slot: 'off-hand' },
      { type: 'weapon', index: 'light-crossbow', slot: 'main-hand' }, // alternative or secondary
      { type: 'pack', index: 'explorers-pack' }
    ]
  },
  'Monk': {
    hitDie: 8,
    primaryStats: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    startingEquipment: [
      { type: 'weapon', index: 'shortsword', slot: 'main-hand' },
      { type: 'pack', index: 'dungeoneers-pack' },
      { type: 'weapon', index: 'dart', quantity: 10 }
    ]
  },
  'Paladin': {
    hitDie: 10,
    primaryStats: ['str', 'cha'],
    savingThrows: ['wis', 'cha'],
    startingEquipment: [
      { type: 'weapon', index: 'longsword', slot: 'main-hand' },
      { type: 'armor', index: 'shield', slot: 'off-hand' },
      { type: 'armor', index: 'chain-mail', slot: 'chest' },
      { type: 'pack', index: 'explorers-pack' },
      { type: 'focus', index: 'holy-symbol', slot: 'neck' }
    ]
  },
  'Ranger': {
    hitDie: 10,
    primaryStats: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    startingEquipment: [
      { type: 'armor', index: 'scale-mail', slot: 'chest' },
      { type: 'weapon', index: 'shortsword', quantity: 2, slot: 'main-hand' },
      { type: 'weapon', index: 'longbow', slot: 'main-hand' },
      { type: 'pack', index: 'explorers-pack' }
    ]
  },
  'Rogue': {
    hitDie: 8,
    primaryStats: ['dex', 'int'],
    savingThrows: ['dex', 'int'],
    startingEquipment: [
      { type: 'weapon', index: 'rapier', slot: 'main-hand' },
      { type: 'weapon', index: 'shortbow', slot: 'main-hand' },
      { type: 'pack', index: 'burglars-pack' },
      { type: 'armor', index: 'leather-armor', slot: 'chest' },
      { type: 'weapon', index: 'dagger', quantity: 2, slot: 'off-hand' }
    ]
  },
  'Sorcerer': {
    hitDie: 6,
    primaryStats: ['cha', 'con'],
    savingThrows: ['con', 'cha'],
    startingEquipment: [
      { type: 'weapon', index: 'light-crossbow', slot: 'main-hand' },
      { type: 'focus', index: 'arcane-focus', slot: 'focus' },
      { type: 'pack', index: 'dungeoneers-pack' },
      { type: 'weapon', index: 'dagger', quantity: 2, slot: 'off-hand' }
    ]
  },
  'Warlock': {
    hitDie: 8,
    primaryStats: ['cha', 'wis'],
    savingThrows: ['wis', 'cha'],
    startingEquipment: [
      { type: 'weapon', index: 'light-crossbow', slot: 'main-hand' },
      { type: 'focus', index: 'arcane-focus', slot: 'focus' },
      { type: 'pack', index: 'scholars-pack' },
      { type: 'armor', index: 'leather-armor', slot: 'chest' },
      { type: 'weapon', index: 'dagger', quantity: 2, slot: 'off-hand' }
    ]
  },
  'Wizard': {
    hitDie: 6,
    primaryStats: ['int', 'wis'],
    savingThrows: ['int', 'wis'],
    startingEquipment: [
      { type: 'weapon', index: 'quarterstaff', slot: 'main-hand' },
      { type: 'focus', index: 'arcane-focus', slot: 'focus' },
      { type: 'pack', index: 'scholars-pack' },
      { type: 'book', index: 'spellbook', slot: 'focus' }
    ]
  }
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

export function resolveStartingEquipment(options: any[]): any[] {
  const items: any[] = [];
  const randomFromList = (list: any[]) => list[Math.floor(Math.random() * list.length)];

  options.forEach(option => {
    const chooseCount = option.choose || 1;
    const fromOptions = option.from?.options || [];

    for (let i = 0; i < chooseCount; i++) {
        if (fromOptions.length === 0) continue;
        const selection = randomFromList(fromOptions);
        if (selection.option_type === 'multiple') {
            selection.items.forEach((it: any) => items.push(it.item || it));
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

export const BACKGROUND_DATA: Record<string, any> = {
  'Acolyte': {
    equipment: [
      { index: 'holy-symbol', quantity: 1, slot: 'neck' },
      { index: 'prayer-book', quantity: 1 },
      { index: 'stick-of-incense', quantity: 5 },
      { index: 'vestments', quantity: 1 },
      { index: 'common-clothes', quantity: 1, slot: 'clothes' }
    ],
    gold: 15
  },
  'Soldier': {
    equipment: [
      { index: 'insignia-of-rank', quantity: 1, slot: 'acc-1' },
      { index: 'trophy-from-fallen-enemy', quantity: 1 },
      { index: 'bone-dice', quantity: 1 },
      { index: 'common-clothes', quantity: 1, slot: 'clothes' }
    ],
    gold: 10
  },
  'Noble': {
    equipment: [
        { index: 'fine-clothes', quantity: 1, slot: 'clothes' },
        { index: 'signet-ring', quantity: 1, slot: 'ring-1' },
        { index: 'scroll-of-pedigree', quantity: 1 },
        { index: 'purse', quantity: 1, slot: 'acc-1' }
    ],
    gold: 25
  },
  'Sage': {
      equipment: [
          { index: 'ink_pen', quantity: 1 },
          { index: 'small-knife', quantity: 1 },
          { index: 'common-clothes', quantity: 1, slot: 'clothes' }
      ],
      gold: 10
  }
};

export function generateNPC(partial: any): any {
  const className = partial.class || randomFromList(DND_CLASSES);
  const race = partial.race || randomFromList(DND_RACES);
  const alignment = partial.alignment || randomFromList(DND_ALIGNMENTS);
  const background = partial.background || randomFromList(DND_BACKGROUNDS);
  const level = partial.level || 0;
  const gender = partial.gender || randomFromList(['Male', 'Female']);

  const classInfo = CLASS_DATA[className] || CLASS_DATA['Fighter'];
  
  // 1. STATS: Assign based on class priority
  const rolls = generateStandardStats();
  const pooledStats = Object.values(rolls).sort((a, b) => b - a);
  const stats: any = {};
  
  const priorities = [...(classInfo.primaryStats || ['str', 'dex'])];
  const others = Object.keys(rolls).filter(s => !priorities.includes(s)).sort(() => Math.random() - 0.5);
  const finalOrder = [...priorities, ...others];
  
  finalOrder.forEach((ability, i) => {
    stats[ability] = pooledStats[i];
  });

  const hp = calculateHP(level, stats.con, classInfo.hitDie || 8);

  // 2. FLAVOR: Randomized traits
  const traits = partial.traits && partial.traits.length > 0 ? partial.traits : [randomFromList(DND_TRAITS)];
  const ideals = partial.ideals && partial.ideals.length > 0 ? partial.ideals : [randomFromList(DND_IDEALS)];
  const bonds = partial.bonds && partial.bonds.length > 0 ? partial.bonds : [randomFromList(DND_BONDS)];
  const flaws = partial.flaws && partial.flaws.length > 0 ? partial.flaws : [randomFromList(DND_FLAWS)];
  
  // 3. APPEARANCE
  const skin = randomFromList(SKIN_TONES);
  const appearance = partial.appearance || {
    hairColor: randomFromList(HAIR_COLORS),
    hairStyle: randomFromList(HAIR_STYLES),
    bodyType: randomFromList(["Slender", "Athletic", "Heavy-set", "Average", "Wiry"]),
    eyeColor: randomFromList(EYE_COLORS),
    skinColor: skin.hex,
    height: `${Math.floor(Math.random() * 2) + 5}'${Math.floor(Math.random() * 12)}"`,
    weight: `${Math.floor(Math.random() * 100) + 120} lbs`
  };

  // 4. CHOICES (Level 1)
  const choices: Record<string, string[]> = {};
  if (className === 'Ranger') {
    choices['favored-enemy-1-type'] = [randomFromList(['beasts', 'fey', 'humanoids', 'monstrosities', 'undead'])];
    choices['natural-explorer-1-terrain-type'] = [randomFromList(['arctic', 'coast', 'desert', 'forest', 'grassland', 'mountain', 'swamp'])];
  } else if (className === 'Fighter') {
    choices['fighting-style'] = [randomFromList(['Archery', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Protection', 'Two-Weapon Fighting'])];
  }

  // 5. EQUIPMENT: Slot-aware distribution
  const inventory: Record<string, any> = {};
  const backpack: any[] = [];
  
  const npcId = partial.id || `npc-${Date.now()}`;
  const npcIndex = npcId.toLowerCase().replace(/\s+/g, '_');

  // v2 manifestation logic
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

  const addItemToRegistry = (itemRef: any, slotHint: string | null) => {
    const id = crypto.randomUUID();
    itemsRegistry[id] = {
      id,
      template: itemRef.index,
      quantity: itemRef.quantity || 1,
      addedAt: Date.now()
    };

    if (slotHint) {
      const v2SlotId = SLOT_MAP[slotHint] || slotHint;
      const slot = v2Equipment.slots.find(s => s.id === v2SlotId);
      if (slot && !slot.itemId) {
        slot.itemId = id;
        return;
      }
    }

    const bagSlot = v2Backpack.slots.find(s => s.itemId === null);
    if (bagSlot) bagSlot.itemId = id;
  };

  const repo = "japiohopman/artificer";
  const branch = "main";
  const githubBase = `https://github.com/${repo}/blob/${branch}/`;

  const createItem = (item: any) => ({
    id: `${item.index}-${Math.random().toString(36).substr(2, 9)}`,
    name: (item.name || item.index).replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    index: item.index,
    _type: item.type === 'book' || item.index === 'spellbook' ? 'books' : 'equipment',
    weight: item.weight || 1,
    quantity: item.quantity || 1,
    dataPath: `${githubBase}public/assets/atlas/equipment/json/${item.index}.json`
  });

  // Class Gear
  (classInfo.startingEquipment || []).forEach((item: any) => {
    const itemObj = createItem(item);
    addItemToRegistry(item, item.slot);
    if (item.slot) {
      if (!inventory[item.slot]) {
        inventory[item.slot] = { ...itemObj, slot: item.slot };
      } else if (item.slot === 'main-hand' && !inventory['off-hand']) {
        inventory['off-hand'] = { ...itemObj, slot: 'off-hand' };
      } else {
        backpack.push(itemObj);
      }
    } else {
      backpack.push(itemObj);
    }
  });

  // Background Gear
  const bg = BACKGROUND_DATA[background];
  if (bg) {
    bg.equipment.forEach((item: any) => {
      const itemObj = createItem(item);
      addItemToRegistry(item, item.slot);
      if (item.slot && !inventory[item.slot]) {
        inventory[item.slot] = { ...itemObj, slot: item.slot };
      } else {
        backpack.push(itemObj);
      }
    });
  }

  const npcIdPlaceholder = partial.id || `npc-${Date.now()}`;
  // Removed duplicate npcId declaration below

  return {
    id: npcId,
    saveVersion: 2,
    name: partial.name || `NPC ${Math.floor(Math.random() * 1000)}`,
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
    features: classInfo.features || [],
    flaws,
    ideals,
    bonds,
    backstory: partial.backstory || `A ${race} ${className} born in a remote village, known for their ${traits[0].toLowerCase()}`,
    appearance,
    inventory,
    backpack,
    // v2 Manifestation
    items: itemsRegistry,
    containers: { [v2Backpack.id]: v2Backpack },
    equipment: v2Equipment,
    spells: [],
    choices,
    hp,
    maxHp: hp,
    money: { cp: 0, sp: 0, gp: bg?.gold || 10, pp: 0 },
    isNpc: true,
    isRecruitable: true,
    dataPath: `${githubBase}public/assets/atlas/character/npc_character_profiles/json/${npcIndex}.json`
  };
}
