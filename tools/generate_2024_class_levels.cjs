const fs = require('fs');
const path = require('path');

const LEVELS_24_DIR = path.join(__dirname, '../public/assets/atlas/class/levels/24');
if (!fs.existsSync(LEVELS_24_DIR)) {
  fs.mkdirSync(LEVELS_24_DIR, { recursive: true });
}

function getProfBonus(level) {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

function featureRef(index, name) {
  return {
    index,
    name,
    url: `/assets/atlas/features/json/${index}.json`
  };
}

// --- FIGHTER 2024 ---
function buildFighterLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("fighter_fighting_style_2024", "Fighting Style"));
    features.push(featureRef("second_wind_2024", "Second Wind"));
    features.push(featureRef("weapon_mastery_fighter", "Weapon Mastery"));
  }
  if (lvl === 2) {
    features.push(featureRef("action_surge_2024", "Action Surge"));
    features.push(featureRef("tactical_mind_2024", "Tactical Mind"));
  }
  if (lvl === 3) {
    features.push(featureRef("fighter_subclass_2024", "Fighter Subclass"));
  }
  if (lvl === 4) {
    features.push(featureRef("fighter_ability_score_improvement_1_2024", "Ability Score Improvement"));
  }
  if (lvl === 5) {
    features.push(featureRef("extra_attack_fighter_2024", "Extra Attack"));
    features.push(featureRef("tactical_shift_2024", "Tactical Shift"));
  }
  if (lvl === 6) {
    features.push(featureRef("fighter_ability_score_improvement_2_2024", "Ability Score Improvement"));
  }
  if (lvl === 8) {
    features.push(featureRef("fighter_ability_score_improvement_3_2024", "Ability Score Improvement"));
  }
  if (lvl === 9) {
    features.push(featureRef("indomitable_2024", "Indomitable"));
    features.push(featureRef("tactical_master_2024", "Tactical Master"));
  }
  if (lvl === 11) {
    features.push(featureRef("extra_attack_2_fighter_2024", "Extra Attack (2)"));
  }
  if (lvl === 12) {
    features.push(featureRef("fighter_ability_score_improvement_4_2024", "Ability Score Improvement"));
  }
  if (lvl === 13) {
    features.push(featureRef("studied_attacks_2024", "Studied Attacks"));
  }
  if (lvl === 14) {
    features.push(featureRef("fighter_ability_score_improvement_5_2024", "Ability Score Improvement"));
  }
  if (lvl === 16) {
    features.push(featureRef("fighter_ability_score_improvement_6_2024", "Ability Score Improvement"));
  }
  if (lvl === 19) {
    features.push(featureRef("epic_boon_fighter_2024", "Epic Boon"));
  }
  if (lvl === 20) {
    features.push(featureRef("extra_attack_3_fighter_2024", "Extra Attack (3)"));
  }

  const secondWindUses = lvl >= 10 ? 4 : (lvl >= 4 ? 3 : 2);
  const masteryCount = lvl >= 16 ? 6 : (lvl >= 10 ? 5 : (lvl >= 4 ? 4 : 3));
  const actionSurges = lvl >= 17 ? 2 : (lvl >= 2 ? 1 : 0);
  const indomitableUses = lvl >= 17 ? 3 : (lvl >= 13 ? 2 : (lvl >= 9 ? 1 : 0));
  const extraAttacks = lvl >= 20 ? 3 : (lvl >= 11 ? 2 : (lvl >= 5 ? 1 : 0));

  return {
    level: lvl,
    ability_score_bonuses: [4,6,8,12,14,16,19].filter(l => l <= lvl).length,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: {
      count: masteryCount,
      description: `You can master ${masteryCount} martial or simple weapons of your choice.`
    },
    class_specific: {
      second_wind_uses: secondWindUses,
      weapon_mastery_count: masteryCount,
      action_surges: actionSurges,
      indomitable_uses: indomitableUses,
      extra_attacks: extraAttacks
    },
    index: `fighter_level_${lvl}`,
    class: {
      index: "fighter",
      name: "Fighter",
      url: "/assets/atlas/class/json/24/fighter.json"
    },
    url: `/assets/atlas/class/levels/24/${lvl}/fighter_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

// Full caster spell slot table (Wizard / Cleric)
const casterSpellSlots = [
  [2,0,0,0,0,0,0,0,0], // L1
  [3,0,0,0,0,0,0,0,0], // L2
  [4,2,0,0,0,0,0,0,0], // L3
  [4,3,0,0,0,0,0,0,0], // L4
  [4,3,2,0,0,0,0,0,0], // L5
  [4,3,3,0,0,0,0,0,0], // L6
  [4,3,3,1,0,0,0,0,0], // L7
  [4,3,3,2,0,0,0,0,0], // L8
  [4,3,3,3,1,0,0,0,0], // L9
  [4,3,3,3,2,0,0,0,0], // L10
  [4,3,3,3,2,1,0,0,0], // L11
  [4,3,3,3,2,1,0,0,0], // L12
  [4,3,3,3,2,1,1,0,0], // L13
  [4,3,3,3,2,1,1,0,0], // L14
  [4,3,3,3,2,1,1,1,0], // L15
  [4,3,3,3,2,1,1,1,0], // L16
  [4,3,3,3,2,1,1,1,1], // L17
  [4,3,3,3,3,1,1,1,1], // L18
  [4,3,3,3,3,2,1,1,1], // L19
  [4,3,3,3,3,2,2,1,1]  // L20
];
const cantripsTable = [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5];
const preparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];

// --- WIZARD 2024 ---
function buildWizardLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_wizard_2024", "Spellcasting: Wizard"));
    features.push(featureRef("arcane_recovery_2024", "Arcane Recovery"));
    features.push(featureRef("ritual_adept_wizard", "Ritual Adept"));
  }
  if (lvl === 2) {
    features.push(featureRef("scholar_wizard_2024", "Scholar"));
  }
  if (lvl === 3) {
    features.push(featureRef("wizard_subclass_2024", "Wizard Subclass"));
  }
  if (lvl === 4) {
    features.push(featureRef("wizard_ability_score_improvement_1_2024", "Ability Score Improvement"));
  }
  if (lvl === 5) {
    features.push(featureRef("memorize_spell_wizard_2024", "Memorize Spell"));
  }
  if (lvl === 8) {
    features.push(featureRef("wizard_ability_score_improvement_2_2024", "Ability Score Improvement"));
  }
  if (lvl === 12) {
    features.push(featureRef("wizard_ability_score_improvement_3_2024", "Ability Score Improvement"));
  }
  if (lvl === 16) {
    features.push(featureRef("wizard_ability_score_improvement_4_2024", "Ability Score Improvement"));
  }
  if (lvl === 18) {
    features.push(featureRef("spell_mastery_wizard_2024", "Spell Mastery"));
  }
  if (lvl === 19) {
    features.push(featureRef("epic_boon_wizard_2024", "Epic Boon"));
  }
  if (lvl === 20) {
    features.push(featureRef("signature_spells_wizard_2024", "Signature Spells"));
  }

  const slots = casterSpellSlots[lvl - 1];

  return {
    level: lvl,
    ability_score_bonuses: [4,8,12,16,19].filter(l => l <= lvl).length,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: {
      arcane_recovery_levels: Math.ceil(lvl / 2),
      prepared_spells_count: preparedTable[lvl - 1]
    },
    index: `wizard_level_${lvl}`,
    class: {
      index: "wizard",
      name: "Wizard",
      url: "/assets/atlas/class/json/24/wizard.json"
    },
    url: `/assets/atlas/class/levels/24/${lvl}/wizard_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: {
      cantrips_known: cantripsTable[lvl - 1],
      prepared_spells: preparedTable[lvl - 1],
      spell_slots_level_1: slots[0],
      spell_slots_level_2: slots[1],
      spell_slots_level_3: slots[2],
      spell_slots_level_4: slots[3],
      spell_slots_level_5: slots[4],
      spell_slots_level_6: slots[5],
      spell_slots_level_7: slots[6],
      spell_slots_level_8: slots[7],
      spell_slots_level_9: slots[8]
    }
  };
}

// --- CLERIC 2024 ---
function buildClericLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_cleric_2024", "Spellcasting: Cleric"));
    features.push(featureRef("divine_order_cleric", "Divine Order"));
  }
  if (lvl === 2) {
    features.push(featureRef("channel_divinity_cleric_2024", "Channel Divinity"));
  }
  if (lvl === 3) {
    features.push(featureRef("cleric_subclass_2024", "Cleric Subclass"));
  }
  if (lvl === 4) {
    features.push(featureRef("cleric_ability_score_improvement_1_2024", "Ability Score Improvement"));
  }
  if (lvl === 5) {
    features.push(featureRef("sear_undead_cleric_2024", "Sear Undead"));
  }
  if (lvl === 7) {
    features.push(featureRef("blessed_strikes_cleric_2024", "Blessed Strikes"));
  }
  if (lvl === 8) {
    features.push(featureRef("cleric_ability_score_improvement_2_2024", "Ability Score Improvement"));
  }
  if (lvl === 10) {
    features.push(featureRef("divine_intervention_cleric_2024", "Divine Intervention"));
  }
  if (lvl === 12) {
    features.push(featureRef("cleric_ability_score_improvement_3_2024", "Ability Score Improvement"));
  }
  if (lvl === 14) {
    features.push(featureRef("blessed_strikes_improvement_cleric_2024", "Blessed Strikes Improvement"));
  }
  if (lvl === 16) {
    features.push(featureRef("cleric_ability_score_improvement_4_2024", "Ability Score Improvement"));
  }
  if (lvl === 19) {
    features.push(featureRef("epic_boon_cleric_2024", "Epic Boon"));
  }
  if (lvl === 20) {
    features.push(featureRef("greater_divine_intervention_cleric_2024", "Greater Divine Intervention"));
  }

  const slots = casterSpellSlots[lvl - 1];
  const channelCharges = lvl >= 18 ? 4 : (lvl >= 6 ? 3 : (lvl >= 2 ? 2 : 0));

  return {
    level: lvl,
    ability_score_bonuses: [4,8,12,16,19].filter(l => l <= lvl).length,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: {
      divine_order_options: ["Protector", "Thaumaturge"],
      channel_divinity_charges: channelCharges
    },
    index: `cleric_level_${lvl}`,
    class: {
      index: "cleric",
      name: "Cleric",
      url: "/assets/atlas/class/json/24/cleric.json"
    },
    url: `/assets/atlas/class/levels/24/${lvl}/cleric_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: {
      cantrips_known: cantripsTable[lvl - 1],
      prepared_spells: preparedTable[lvl - 1],
      spell_slots_level_1: slots[0],
      spell_slots_level_2: slots[1],
      spell_slots_level_3: slots[2],
      spell_slots_level_4: slots[3],
      spell_slots_level_5: slots[4],
      spell_slots_level_6: slots[5],
      spell_slots_level_7: slots[6],
      spell_slots_level_8: slots[7],
      spell_slots_level_9: slots[8]
    }
  };
}

// --- ROGUE 2024 ---
function buildRogueLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("rogue_expertise_2024", "Expertise"));
    features.push(featureRef("sneak_attack_2024", "Sneak Attack"));
    features.push(featureRef("thieves_cant_2024", "Thieves' Cant"));
    features.push(featureRef("weapon_mastery_rogue", "Weapon Mastery"));
  }
  if (lvl === 2) {
    features.push(featureRef("cunning_action_2024", "Cunning Action"));
  }
  if (lvl === 3) {
    features.push(featureRef("rogue_subclass_2024", "Rogue Subclass"));
    features.push(featureRef("steady_aim_rogue_2024", "Steady Aim"));
  }
  if (lvl === 4) {
    features.push(featureRef("rogue_ability_score_improvement_1_2024", "Ability Score Improvement"));
  }
  if (lvl === 5) {
    features.push(featureRef("cunning_strike_2024", "Cunning Strike"));
    features.push(featureRef("uncanny_dodge_2024", "Uncanny Dodge"));
  }
  if (lvl === 6) {
    features.push(featureRef("rogue_expertise_2_2024", "Expertise (Level 6)"));
  }
  if (lvl === 7) {
    features.push(featureRef("evasion_rogue_2024", "Evasion"));
    features.push(featureRef("reliable_talent_2024", "Reliable Talent"));
  }
  if (lvl === 8) {
    features.push(featureRef("rogue_ability_score_improvement_2_2024", "Ability Score Improvement"));
  }
  if (lvl === 10) {
    features.push(featureRef("rogue_ability_score_improvement_3_2024", "Ability Score Improvement"));
  }
  if (lvl === 11) {
    features.push(featureRef("improved_cunning_strike_2024", "Improved Cunning Strike"));
  }
  if (lvl === 12) {
    features.push(featureRef("rogue_ability_score_improvement_4_2024", "Ability Score Improvement"));
  }
  if (lvl === 14) {
    features.push(featureRef("devious_strikes_2024", "Devious Strikes"));
  }
  if (lvl === 15) {
    features.push(featureRef("slippery_mind_2024", "Slippery Mind"));
  }
  if (lvl === 16) {
    features.push(featureRef("rogue_ability_score_improvement_5_2024", "Ability Score Improvement"));
  }
  if (lvl === 18) {
    features.push(featureRef("elusive_2024", "Elusive"));
  }
  if (lvl === 19) {
    features.push(featureRef("epic_boon_rogue_2024", "Epic Boon"));
  }
  if (lvl === 20) {
    features.push(featureRef("stroke_of_luck_2024", "Stroke of Luck"));
  }

  const sneakDice = Math.ceil(lvl / 2);

  return {
    level: lvl,
    ability_score_bonuses: [4,8,10,12,16,19].filter(l => l <= lvl).length,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: {
      count: 2,
      description: "You can master 2 weapons of your choice from your class weapon proficiencies."
    },
    class_specific: {
      weapon_mastery_count: 2,
      sneak_attack: {
        dice_count: sneakDice,
        dice_value: 6
      }
    },
    index: `rogue_level_${lvl}`,
    class: {
      index: "rogue",
      name: "Rogue",
      url: "/assets/atlas/class/json/24/rogue.json"
    },
    url: `/assets/atlas/class/levels/24/${lvl}/rogue_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

const classesToBuild = [
  { name: 'fighter', builder: buildFighterLevel },
  { name: 'wizard', builder: buildWizardLevel },
  { name: 'cleric', builder: buildClericLevel },
  { name: 'rogue', builder: buildRogueLevel }
];

classesToBuild.forEach(({ name, builder }) => {
  const fullArray = [];
  for (let lvl = 1; lvl <= 20; lvl++) {
    const lvlObj = builder(lvl);
    fullArray.push(lvlObj);

    // Write individual level JSON file in public/assets/atlas/class/levels/24/<lvl>/<class>_level_<lvl>.json
    const subDir = path.join(LEVELS_24_DIR, `${lvl}`);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    const singleFile = path.join(subDir, `${name}_level_${lvl}.json`);
    fs.writeFileSync(singleFile, JSON.stringify(lvlObj, null, 2));
  }

  // Write array JSON in public/assets/atlas/class/levels/24/<class>.json
  const arrayFile = path.join(LEVELS_24_DIR, `${name}.json`);
  fs.writeFileSync(arrayFile, JSON.stringify(fullArray, null, 2));

  console.log(`Generated 2024 levels 1-20 for ${name}`);
});
