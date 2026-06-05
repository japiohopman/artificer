import { Character } from "../store/useStore";
import { getModifier } from "./npcGeneratorUtils";

export interface DerivedStats {
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  attackBonus: number;
  spellSaveDC: number;
  spellAttackBonus: number;
  passivePerception: number;
  weightCapacity: number;
  spellSlots: Record<string, number>;
}

const safeNum = (val: any) => typeof val === 'number' ? val : (parseInt(String(val)) || 0);

export function getEffectiveStats(character: Character | undefined): Character['stats'] {
  const baseStats = character?.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  if (!character) return baseStats;

  const effectiveStats = { ...baseStats };
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const sets = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

  // Use a Set to ensure we only process each unique item once, even if it occupies multiple slots
  let uniqueItems: Set<any>;
  if (character.saveVersion === 2) {
    uniqueItems = new Set(
      character.equipment?.slots
        .filter(s => s.itemId)
        .map(s => character.items?.[s.itemId!])
        .filter(Boolean)
    );
  } else {
    uniqueItems = new Set(Object.values(character.inventory || {}).filter(item => item !== null));
  }

  // Check all equipped items for passive modifiers
  uniqueItems.forEach((item: any) => {
    if (!item) return;

    // Check both standard location and top level for modifiers
    const mods = item.feature_specific?.passive_modifiers || item;

    // Handle Bonus modifiers
    if (mods.strength_bonus) bonuses.str += safeNum(mods.strength_bonus);
    if (mods.dexterity_bonus) bonuses.dex += safeNum(mods.dexterity_bonus);
    if (mods.constitution_bonus) bonuses.con += safeNum(mods.constitution_bonus);
    if (mods.intelligence_bonus) bonuses.int += safeNum(mods.intelligence_bonus);
    if (mods.intellect_bonus) bonuses.int += safeNum(mods.intellect_bonus);
    if (mods.wisdom_bonus) bonuses.wis += safeNum(mods.wisdom_bonus);
    if (mods.charisma_bonus) bonuses.cha += safeNum(mods.charisma_bonus);

    // Handle Set modifiers (e.g. Headband of Intellect)
    if (mods.strength_set) sets.str = Math.max(sets.str, safeNum(mods.strength_set));
    if (mods.dexterity_set) sets.dex = Math.max(sets.dex, safeNum(mods.dexterity_set));
    if (mods.constitution_set) sets.con = Math.max(sets.con, safeNum(mods.constitution_set));
    if (mods.intelligence_set) sets.int = Math.max(sets.int, safeNum(mods.intelligence_set));
    if (mods.intellect_set) sets.int = Math.max(sets.int, safeNum(mods.intellect_set));
    if (mods.wisdom_set) sets.wis = Math.max(sets.wis, safeNum(mods.wisdom_set));
    if (mods.charisma_set) sets.cha = Math.max(sets.cha, safeNum(mods.charisma_set));
  });

  const statsKeys: (keyof Character['stats'])[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  statsKeys.forEach(s => {
    // Add bonuses first
    effectiveStats[s] = safeNum(effectiveStats[s]) + bonuses[s];
    
    // Apply set value if it's higher than the current value
    if (sets[s] > effectiveStats[s]) {
      effectiveStats[s] = sets[s];
    }
  });

  // Attach the modifiers info for UI indicators (optional, but good for debugging/UX)
  (effectiveStats as any)._isModified = {
    str: bonuses.str !== 0 || sets.str > baseStats.str,
    dex: bonuses.dex !== 0 || sets.dex > baseStats.dex,
    con: bonuses.con !== 0 || sets.con > baseStats.con,
    int: bonuses.int !== 0 || sets.int > baseStats.int,
    wis: bonuses.wis !== 0 || sets.wis > baseStats.wis,
    cha: bonuses.cha !== 0 || sets.cha > baseStats.cha,
  };

  return effectiveStats;
}

export function calculateDerivedStats(character: Character | undefined): DerivedStats {
  if (!character) {
    return {
      ac: 10,
      initiative: 0,
      speed: 30,
      proficiencyBonus: 2,
      attackBonus: 2,
      spellSaveDC: 10,
      spellAttackBonus: 2,
      passivePerception: 10,
      weightCapacity: 150,
      spellSlots: {}
    };
  }

  const effectiveStats = getEffectiveStats(character);
  const dexMod = getModifier(effectiveStats.dex);
  const strMod = getModifier(effectiveStats.str);
  const intMod = getModifier(effectiveStats.int);
  const wisMod = getModifier(effectiveStats.wis);
  const chaMod = getModifier(effectiveStats.cha);

  const proficiencyBonus = Math.floor(Math.max(0, (character.level || 0) - 1) / 4) + 2;

  // 1. Armor Class Calculation
  let baseAC = 10 + dexMod;
  let acBonus = 0;

  const isV2 = character.saveVersion === 2;
  const getEquippedItem = (slotId: string) => {
    if (isV2) {
      const itemId = character.equipment?.slots.find(s => s.id === slotId)?.itemId;
      return itemId ? character.items?.[itemId] : null;
    }
    const legacyMap: Record<string, string> = {
      'chest': 'chest',
      'off_hand': 'off-hand',
      'main_hand': 'main-hand'
    };
    return character.inventory?.[legacyMap[slotId] || slotId];
  };

  const armor = getEquippedItem('chest');
  const shield = getEquippedItem('off_hand');

  if (armor) {
    const armorData = armor.armor_class || armor; // Handle both direct and nested AC
    if (armorData.base) {
      baseAC = armorData.base;
      if (armorData.dex_bonus || armorData.dexBonus) {
        const maxDex = armorData.max_bonus ?? armorData.maxDexBonus ?? 10;
        baseAC += Math.min(dexMod, maxDex);
      }
    }
  }

  if (shield && (shield.armor_category === 'Shield' || shield.index === 'shield')) {
    acBonus += (shield.armor_class?.base || shield.acBonus || 2);
  }

  // Magic Item Bonuses (Search all equipped items for AC bonuses)
  let equippedList: any[];
  if (isV2) {
    equippedList = (character.equipment?.slots || []).map(s => s.itemId ? character.items?.[s.itemId] : null).filter(Boolean);
  } else {
    equippedList = Object.values(character.inventory || {}).filter(item => item !== null);
  }

  equippedList.forEach((item: any) => {
    if (!item) return;
    
    // Check for explicit bonus fields
    if (item.ac_bonus || item.acBonus) acBonus += (item.ac_bonus || item.acBonus);

    // New format: feature_specific.passive_modifiers.ac_bonus
    if (item.feature_specific?.passive_modifiers?.ac_bonus) {
      acBonus += item.feature_specific.passive_modifiers.ac_bonus;
    }
    
    // Check description for common phrasing if field is missing
    const descText = Array.isArray(item.desc) ? item.desc.join(" ") : (item.desc || "");
    const desc = descText.toLowerCase();
    if (desc.includes("+1 bonus to armor class") || desc.includes("+1 to armor class")) {
         acBonus += 1;
    } else if (desc.includes("+2 bonus to armor class") || desc.includes("+2 to armor class")) {
         acBonus += 2;
    }
    
    // Specific items like Ring of Protection
    if (item.index === 'ring_of_protection') {
        acBonus += 1;
    }
  });

  const ac = baseAC + acBonus;
  
  // 1.1 Feature AC Bonuses (e.g. Defense Fighting Style)
  let featureAcBonus = 0;
  if (character.class === 'Fighter' || character.class === 'Paladin' || character.class === 'Ranger') {
      const styles = (character.choices?.['fighting-style'] || []).map((s: any) => String(s || '').toLowerCase());
      if (styles.some((s: string) => s === 'defense' || s.includes('defense')) && armor) {
          featureAcBonus += 1;
      }
  }
  
  const finalAC = ac + featureAcBonus;

  // 2. Initiative
  const initiative = dexMod;

  // 3. Speed
  let speed = 30; // Default
  const race = (character.race || "").toLowerCase();
  if (race.includes('gnome') || race.includes('halfling') || race.includes('dwarf')) {
    speed = 25;
  }
  // Could add more speed logic based on class features/equipment

  // 4. Attack Bonuses
  const weapon = getEquippedItem('main_hand');
  let weaponBonus = 0;
  let attackAbilityMod = strMod;

  if (weapon) {
    // Determine if finesse or ranged
    const isRanged = weapon.weapon_range === 'Ranged' || weapon.category === 'Ranged' || weapon.index?.includes('bow') || weapon.index?.includes('crossbow');
    const isFinesse = (weapon.properties || []).some((p: any) => (p.index === 'finesse' || p.name === 'Finesse'));
    
    if (isRanged || (isFinesse && dexMod > strMod)) {
        attackAbilityMod = dexMod;
    }

    // Check for weapon bonus (+1, +2, etc)
    const name = (weapon.name || "").toLowerCase();
    if (name.includes('+1')) weaponBonus = 1;
    else if (name.includes('+2')) weaponBonus = 2;
    else if (name.includes('+3')) weaponBonus = 3;
    
    if (weapon.attack_bonus) weaponBonus += weapon.attack_bonus;

    // New format: feature_specific.passive_modifiers.attack_bonus
    if (weapon.feature_specific?.passive_modifiers?.attack_bonus) {
      weaponBonus += weapon.feature_specific.passive_modifiers.attack_bonus;
    }

    // Feature Bonuses (e.g. Archery Fighting Style)
    const styles = (character.choices?.['fighting-style'] || []).map((s: any) => String(s || '').toLowerCase());
    if (isRanged && styles.some((s: string) => s === 'archery' || s.includes('archery'))) {
        weaponBonus += 2;
    }
  }

  const attackBonus = proficiencyBonus + attackAbilityMod + weaponBonus;

  // 5. Spellcasting
  const spellcastingAbilityMod = character.class === 'Wizard' || character.class === 'Artificer' ? intMod :
                                 character.class === 'Cleric' || character.class === 'Druid' || character.class === 'Ranger' ? wisMod :
                                 character.class === 'Bard' || character.class === 'Sorcerer' || character.class === 'Warlock' || character.class === 'Paladin' ? chaMod : 0;
  
  const spellSaveDC = 8 + proficiencyBonus + spellcastingAbilityMod;
  const spellAttackBonus = proficiencyBonus + spellcastingAbilityMod;

  // 6. Logistics
  const isProficientInPerception = character.proficiencies?.includes('Perception');
  const hasExpertiseInPerception = character.features?.some(f => (f.index?.toLowerCase() || '').includes('expertise') || (f.name?.toLowerCase() || '').includes('expertise')) && 
                                    character.choices?.['expertise']?.includes('Perception');
                                    
  const passivePerception = 10 + wisMod + (isProficientInPerception ? proficiencyBonus : 0) + (hasExpertiseInPerception ? proficiencyBonus : 0);
  const weightCapacity = effectiveStats.str * 15;
  const spellSlots = calculateMaxSpellSlots(character);

  return {
    ac: finalAC,
    initiative,
    speed,
    proficiencyBonus,
    attackBonus,
    spellSaveDC,
    spellAttackBonus,
    passivePerception,
    weightCapacity,
    spellSlots
  };
}

export function calculateMaxSpellSlots(character: Character): Record<string, number> {
    const level = character.level || 0;
    const charClass = (character.class || "").toLowerCase();
    
    const FULL_CASTER_PROGRESSION: Record<number, number[]> = {
        1: [2],
        2: [3],
        3: [4, 2],
        4: [4, 3],
        5: [4, 3, 2],
        6: [4, 3, 3],
        7: [4, 3, 3, 1],
        8: [4, 3, 3, 2],
        9: [4, 3, 3, 3, 1],
        10: [4, 3, 3, 3, 2],
        11: [4, 3, 3, 3, 2, 1],
        12: [4, 3, 3, 3, 2, 1],
        13: [4, 3, 3, 3, 2, 1, 1],
        14: [4, 3, 3, 3, 2, 1, 1],
        15: [4, 3, 3, 3, 2, 1, 1, 1],
        16: [4, 3, 3, 3, 2, 1, 1, 1],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
        18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
        20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
    };

    const slots: Record<string, number> = {};
    
    if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(charClass)) {
        const fullSlots = FULL_CASTER_PROGRESSION[level] || [0];
        fullSlots.forEach((count, i) => {
            slots[(i + 1).toString()] = count;
        });
    } else if (['paladin', 'ranger'].includes(charClass)) {
        const halfLevel = Math.ceil(level / 2);
        const halfSlots = FULL_CASTER_PROGRESSION[halfLevel] || [0];
        halfSlots.forEach((count, i) => {
            slots[(i + 1).toString()] = count;
        });
    } else if (charClass === 'warlock') {
        // Warlocks have Pact Magic: fixed slots of specific level
        let count = 1;
        let slotLvl = 1;
        if (level >= 17) { count = 4; slotLvl = 5; }
        else if (level >= 11) { count = 3; slotLvl = 5; }
        else if (level >= 9) { count = 2; slotLvl = 5; }
        else if (level >= 7) { count = 2; slotLvl = 4; }
        else if (level >= 5) { count = 2; slotLvl = 3; }
        else if (level >= 3) { count = 2; slotLvl = 2; }
        else if (level >= 2) { count = 2; slotLvl = 1; }
        else { count = 1; slotLvl = 1; }
        
        slots[slotLvl.toString()] = count;
    } else if (charClass === 'artificer') {
        const artLevel = Math.ceil(level / 2);
        const artSlots = FULL_CASTER_PROGRESSION[artLevel] || [0];
        artSlots.forEach((count, i) => {
            slots[(i + 1).toString()] = count;
        });
    }

    // 1/3 Casters (Arcane Trickster, Eldritch Knight)
    const subclass = (character.subclass || "").toLowerCase();
    if (subclass.includes('arcane trickster') || subclass.includes('eldritch knight')) {
        const thirdLevel = Math.floor(level / 3);
        if (thirdLevel > 0) {
            const thirdSlots = FULL_CASTER_PROGRESSION[thirdLevel] || [0];
            thirdSlots.forEach((count, i) => {
                slots[(i + 1).toString()] = count;
            });
        }
    }

    return slots;
}

export const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i + 1;
  }
  return 1;
}

export function getXPForLevel(level: number): number {
  return XP_TABLE[Math.min(Math.max(level - 1, 0), XP_TABLE.length - 1)] || 0;
}

export function getXpProgress(level: number, xp: number): number {
  const currentLevelTarget = XP_TABLE[level - 1] || 0;
  const nextLevelTarget = XP_TABLE[level] || (currentLevelTarget + 50000);
  const progress = ((xp - currentLevelTarget) / (nextLevelTarget - currentLevelTarget)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
