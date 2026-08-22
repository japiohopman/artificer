import { Character } from "../store/useCharacterStore";
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

export function calculateWeaponAttackBonus(character: Character | undefined, weapon: any): number {
  if (!character) return 2;

  const effectiveStats = getEffectiveStats(character);
  const dexMod = getModifier(effectiveStats.dex);
  const strMod = getModifier(effectiveStats.str);
  const proficiencyBonus = Math.floor(Math.max(0, (character.level || 0) - 1) / 4) + 2;

  let weaponBonus = 0;
  let attackAbilityMod = strMod;

  if (weapon) {
    const isRanged = weapon.weapon_range === 'Ranged' || weapon.category === 'Ranged' || weapon.index?.includes('bow') || weapon.index?.includes('crossbow');
    const isFinesse = (weapon.properties || []).some((p: any) => (p.index === 'finesse' || p.name === 'Finesse'));

    if (isRanged || (isFinesse && dexMod > strMod)) {
      attackAbilityMod = dexMod;
    }

    if (typeof weapon.attack_bonus === 'number') {
      weaponBonus += weapon.attack_bonus;
    } else {
      const name = (weapon.name || "").toLowerCase();
      if (name.includes('+3')) weaponBonus = 3;
      else if (name.includes('+2')) weaponBonus = 2;
      else if (name.includes('+1')) weaponBonus = 1;
    }

    if (weapon.feature_specific?.passive_modifiers?.attack_bonus) {
      weaponBonus += weapon.feature_specific.passive_modifiers.attack_bonus;
    }

    // Archery Fighting Style checks
    if (isRanged) {
      const choices = (character.choices?.['fighting-style'] || []).map((s: any) => String(s || '').toLowerCase());
      const hasArcheryChoice = choices.some((s: string) => s === 'archery' || s.includes('archery'));

      const hasArcheryFeature = character.features?.some(f => {
        const idx = (f.index || f.name || '').toLowerCase();
        const mods = f.feature_specific?.passive_modifiers;
        return idx.includes('archery') || (mods?.attack_bonus === 2 && mods?.weapon_type === 'ranged');
      });

      if (hasArcheryChoice || hasArcheryFeature) {
        weaponBonus += 2;
      }
    }
  }

  return proficiencyBonus + attackAbilityMod + weaponBonus;
}

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

  // Process Passive Modifiers from Traits
  character.traits?.forEach(trait => {
    const mods = trait.trait_specific?.passive_modifiers;
    if (!mods) return;

    if (mods.strength_bonus) bonuses.str += safeNum(mods.strength_bonus);
    if (mods.dexterity_bonus) bonuses.dex += safeNum(mods.dexterity_bonus);
    if (mods.constitution_bonus) bonuses.con += safeNum(mods.constitution_bonus);
    if (mods.intelligence_bonus) bonuses.int += safeNum(mods.intelligence_bonus);
    if (mods.wisdom_bonus) bonuses.wis += safeNum(mods.wisdom_bonus);
    if (mods.charisma_bonus) bonuses.cha += safeNum(mods.charisma_bonus);

    if (mods.strength_set) sets.str = Math.max(sets.str, safeNum(mods.strength_set));
    if (mods.dexterity_set) sets.dex = Math.max(sets.dex, safeNum(mods.dexterity_set));
    if (mods.constitution_set) sets.con = Math.max(sets.con, safeNum(mods.constitution_set));
    if (mods.intelligence_set) sets.int = Math.max(sets.int, safeNum(mods.intelligence_set));
    if (mods.wisdom_set) sets.wis = Math.max(sets.wis, safeNum(mods.wisdom_set));
    if (mods.charisma_set) sets.cha = Math.max(sets.cha, safeNum(mods.charisma_set));
    if (mods.speed_set) (effectiveStats as any)._speedSet = Math.max((effectiveStats as any)._speedSet || 0, safeNum(mods.speed_set));
  });

  // Process Passive Modifiers from Features/Feats
  character.features?.forEach(feat => {
    const mods = feat.feature_specific?.passive_modifiers;
    if (!mods) return;

    if (mods.strength_bonus) bonuses.str += safeNum(mods.strength_bonus);
    if (mods.dexterity_bonus) bonuses.dex += safeNum(mods.dexterity_bonus);
    if (mods.constitution_bonus) bonuses.con += safeNum(mods.constitution_bonus);
    if (mods.intelligence_bonus) bonuses.int += safeNum(mods.intelligence_bonus);
    if (mods.wisdom_bonus) bonuses.wis += safeNum(mods.wisdom_bonus);
    if (mods.charisma_bonus) bonuses.cha += safeNum(mods.charisma_bonus);

    if (mods.strength_set) sets.str = Math.max(sets.str, safeNum(mods.strength_set));
    if (mods.dexterity_set) sets.dex = Math.max(sets.dex, safeNum(mods.dexterity_set));
    if (mods.constitution_set) sets.con = Math.max(sets.con, safeNum(mods.constitution_set));
    if (mods.intelligence_set) sets.int = Math.max(sets.int, safeNum(mods.intelligence_set));
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
  const conMod = getModifier(effectiveStats.con);
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

  const armorData = armor ? (armor.armor_class || armor) : null;
  const isWearingArmor = armorData && typeof armorData.base === 'number' && armorData.base > 0;

  if (isWearingArmor) {
    baseAC = armorData.base;
    if (armorData.dex_bonus || armorData.dexBonus) {
      const maxDex = armorData.max_bonus ?? armorData.maxDexBonus ?? 10;
      baseAC += Math.min(dexMod, maxDex);
    }
  } else {
    // Unarmored AC calculations
    let unarmoredAC = 10 + dexMod;

    character.features?.forEach(feat => {
      const idx = String(feat.index || feat.name || '').toLowerCase();
      const mods = feat.feature_specific?.passive_modifiers;
      const acSet = mods?.ac_set;

      if (typeof acSet === 'number') {
        unarmoredAC = Math.max(unarmoredAC, acSet + dexMod);
      } else if (typeof acSet === 'string') {
        const acSetStr = acSet.toLowerCase();
        if (acSetStr.includes('constitution') || acSetStr.includes('con_mod') || idx.includes('barbarian')) {
          unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + conMod);
        }
        if ((acSetStr.includes('wisdom') || acSetStr.includes('wis_mod') || idx.includes('monk')) && !shield) {
          unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + wisMod);
        }
        if (acSetStr.includes('13') || idx.includes('draconic') || idx.includes('shadows')) {
          unarmoredAC = Math.max(unarmoredAC, 13 + dexMod);
        }
      } else {
        if (idx.includes('barbarian')) {
          unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + conMod);
        }
        if (idx.includes('monk') && !shield) {
          unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + wisMod);
        }
        if (idx.includes('draconic')) {
          unarmoredAC = Math.max(unarmoredAC, 13 + dexMod);
        }
      }
    });

    // Fallback based on class if features are unpopulated
    const charClass = (character.class || '').toLowerCase();
    if (charClass === 'barbarian') {
      unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + conMod);
    } else if (charClass === 'monk' && !shield) {
      unarmoredAC = Math.max(unarmoredAC, 10 + dexMod + wisMod);
    }

    baseAC = unarmoredAC;
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

  // Process Passive Modifiers from Features/Feats for AC
  character.features?.forEach(feat => {
    const mods = feat.feature_specific?.passive_modifiers;
    if (!mods) return;

    if (mods.ac_bonus) acBonus += safeNum(mods.ac_bonus);
  });

  const ac = baseAC + acBonus;
  
  // 1.1 Feature AC Bonuses (e.g. Defense Fighting Style)
  let featureAcBonus = 0;
  const charClass = (character.class || '').toLowerCase();
  if (charClass === 'fighter' || charClass === 'paladin' || charClass === 'ranger') {
      const styles = (character.choices?.['fighting-style'] || []).map((s: any) => String(s || '').toLowerCase());
      if (styles.some((s: string) => s === 'defense' || s.includes('defense')) && isWearingArmor) {
          featureAcBonus += 1;
      }
  }
  
  const finalAC = ac + featureAcBonus;

  // 2. Initiative
  const initiative = dexMod;

  // 3. Speed
  let speed = (effectiveStats as any)._speedSet || 30; // Default or set by trait
  if (!(effectiveStats as any)._speedSet) {
    const race = (character.race || "").toLowerCase();
    if (race.includes('gnome') || race.includes('halfling') || race.includes('dwarf')) {
      speed = 25;
    }
  }

  // Process speed modifiers from traits and features
  character.traits?.forEach(t => {
      if (t.trait_specific?.passive_modifiers?.speed_bonus) {
          speed += safeNum(t.trait_specific.passive_modifiers.speed_bonus);
      }
  });

  character.features?.forEach(f => {
      if (f.feature_specific?.passive_modifiers?.speed_bonus) {
          speed += safeNum(f.feature_specific.passive_modifiers.speed_bonus);
      }
  });

  // 4. Attack Bonuses
  const weapon = getEquippedItem('main_hand');
  const attackBonus = calculateWeaponAttackBonus(character, weapon);

  // 5. Spellcasting
  const subclass = (character.subclass || '').toLowerCase();
  const isThirdCaster = subclass.includes('arcane trickster') || subclass.includes('eldritch knight');

  let spellcastingAbilityMod = 0;
  if (['wizard', 'artificer'].includes(charClass) || isThirdCaster) {
    spellcastingAbilityMod = intMod;
  } else if (['cleric', 'druid', 'ranger'].includes(charClass)) {
    spellcastingAbilityMod = wisMod;
  } else if (['bard', 'sorcerer', 'warlock', 'paladin'].includes(charClass)) {
    spellcastingAbilityMod = chaMod;
  }
  
  const spellSaveDC = 8 + proficiencyBonus + spellcastingAbilityMod;
  const spellAttackBonus = proficiencyBonus + spellcastingAbilityMod;

  // 6. Logistics
  const isPerceptionMatch = (val: any) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      return lower === 'perception' || lower === 'skill_perception' || lower === 'skill: perception';
    }
    if (val && typeof val === 'object') {
      const idx = String(val.index || val.name || '').toLowerCase();
      return idx.includes('perception');
    }
    return false;
  };

  const isProficientInPerception =
    (Array.isArray(character.skills) && character.skills.some(isPerceptionMatch)) ||
    (Array.isArray(character.proficiencies) && character.proficiencies.some(isPerceptionMatch)) ||
    (Array.isArray(character.choices?.['skills']) && character.choices['skills'].some(isPerceptionMatch));

  const hasExpertiseInPerception =
    (Array.isArray(character.choices?.['expertise']) && character.choices['expertise'].some(v => String(v).toLowerCase().includes('perception'))) ||
    character.features?.some(f => {
      const name = (f.name || f.index || '').toLowerCase();
      return name.includes('expertise') && JSON.stringify(f).toLowerCase().includes('perception');
    });

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
