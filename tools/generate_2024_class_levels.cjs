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

// Spell Slot Tables
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

const halfCasterSpellSlots = [
  [2,0,0,0,0], // L1
  [2,0,0,0,0], // L2
  [3,0,0,0,0], // L3
  [3,0,0,0,0], // L4
  [4,2,0,0,0], // L5
  [4,2,0,0,0], // L6
  [4,3,0,0,0], // L7
  [4,3,0,0,0], // L8
  [4,3,2,0,0], // L9
  [4,3,2,0,0], // L10
  [4,3,3,0,0], // L11
  [4,3,3,0,0], // L12
  [4,3,3,1,0], // L13
  [4,3,3,1,0], // L14
  [4,3,3,2,0], // L15
  [4,3,3,2,0], // L16
  [4,3,3,3,1], // L17
  [4,3,3,3,1], // L18
  [4,3,3,3,2], // L19
  [4,3,3,3,2]  // L20
];

const cantripsTable = [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5];
const clericPreparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const wizardPreparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25];
const bardPreparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,19,20,21,22,24];
const sorcererPreparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,19,20,21,22,24];
const druidPreparedTable = [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];

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
  if (lvl === 3) features.push(featureRef("fighter_subclass_2024", "Fighter Subclass"));
  if (lvl === 4) features.push(featureRef("fighter_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) {
    features.push(featureRef("extra_attack_fighter_2024", "Extra Attack"));
    features.push(featureRef("tactical_shift_2024", "Tactical Shift"));
  }
  if (lvl === 6) features.push(featureRef("fighter_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 8) features.push(featureRef("fighter_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 9) {
    features.push(featureRef("indomitable_2024", "Indomitable"));
    features.push(featureRef("tactical_master_2024", "Tactical Master"));
  }
  if (lvl === 11) features.push(featureRef("extra_attack_2_fighter_2024", "Extra Attack (2)"));
  if (lvl === 12) features.push(featureRef("fighter_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("studied_attacks_2024", "Studied Attacks"));
  if (lvl === 14) features.push(featureRef("fighter_ability_score_improvement_5_2024", "Ability Score Improvement"));
  if (lvl === 16) features.push(featureRef("fighter_ability_score_improvement_6_2024", "Ability Score Improvement"));
  if (lvl === 19) features.push(featureRef("epic_boon_fighter_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("extra_attack_3_fighter_2024", "Extra Attack (3)"));

  const secondWindUses = lvl >= 10 ? 4 : (lvl >= 4 ? 3 : 2);
  const masteryCount = lvl >= 16 ? 6 : (lvl >= 10 ? 5 : (lvl >= 4 ? 4 : 3));
  const actionSurges = lvl >= 17 ? 2 : (lvl >= 2 ? 1 : 0);
  const indomitableUses = lvl >= 17 ? 3 : (lvl >= 13 ? 2 : (lvl >= 9 ? 1 : 0));
  const extraAttacks = lvl >= 20 ? 3 : (lvl >= 11 ? 2 : (lvl >= 5 ? 1 : 0));
  const asiCount = [4, 6, 8, 12, 14, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: { count: masteryCount, description: `You can master ${masteryCount} martial or simple weapons of your choice.` },
    class_specific: { second_wind_uses: secondWindUses, weapon_mastery_count: masteryCount, action_surges: actionSurges, indomitable_uses: indomitableUses, extra_attacks: extraAttacks },
    index: `fighter_level_${lvl}`,
    class: { index: "fighter", name: "Fighter", url: "/assets/atlas/class/json/24/fighter.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/fighter_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

// --- WIZARD 2024 ---
function buildWizardLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_wizard_2024", "Spellcasting: Wizard"));
    features.push(featureRef("arcane_recovery_2024", "Arcane Recovery"));
    features.push(featureRef("ritual_adept_wizard", "Ritual Adept"));
  }
  if (lvl === 2) features.push(featureRef("scholar_wizard_2024", "Scholar"));
  if (lvl === 3) features.push(featureRef("wizard_subclass_2024", "Wizard Subclass"));
  if (lvl === 4) features.push(featureRef("wizard_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) features.push(featureRef("memorize_spell_wizard_2024", "Memorize Spell"));
  if (lvl === 8) features.push(featureRef("wizard_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 12) features.push(featureRef("wizard_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 16) features.push(featureRef("wizard_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("spell_mastery_wizard_2024", "Spell Mastery"));
  if (lvl === 19) features.push(featureRef("epic_boon_wizard_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("signature_spells_wizard_2024", "Signature Spells"));

  const slots = casterSpellSlots[lvl - 1];
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { arcane_recovery_levels: Math.ceil(lvl / 2), prepared_spells_count: wizardPreparedTable[lvl - 1] },
    index: `wizard_level_${lvl}`,
    class: { index: "wizard", name: "Wizard", url: "/assets/atlas/class/json/24/wizard.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/wizard_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { cantrips_known: cantripsTable[lvl - 1], prepared_spells: wizardPreparedTable[lvl - 1], spell_slots_level_1: slots[0], spell_slots_level_2: slots[1], spell_slots_level_3: slots[2], spell_slots_level_4: slots[3], spell_slots_level_5: slots[4], spell_slots_level_6: slots[5], spell_slots_level_7: slots[6], spell_slots_level_8: slots[7], spell_slots_level_9: slots[8] }
  };
}

// --- CLERIC 2024 ---
function buildClericLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_cleric_2024", "Spellcasting: Cleric"));
    features.push(featureRef("divine_order_cleric", "Divine Order"));
  }
  if (lvl === 2) features.push(featureRef("channel_divinity_cleric_2024", "Channel Divinity"));
  if (lvl === 3) features.push(featureRef("cleric_subclass_2024", "Cleric Subclass"));
  if (lvl === 4) features.push(featureRef("cleric_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) features.push(featureRef("sear_undead_cleric_2024", "Sear Undead"));
  if (lvl === 7) features.push(featureRef("blessed_strikes_cleric_2024", "Blessed Strikes"));
  if (lvl === 8) features.push(featureRef("cleric_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 10) features.push(featureRef("divine_intervention_cleric_2024", "Divine Intervention"));
  if (lvl === 12) features.push(featureRef("cleric_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 14) features.push(featureRef("blessed_strikes_improvement_cleric_2024", "Blessed Strikes Improvement"));
  if (lvl === 16) features.push(featureRef("cleric_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 19) features.push(featureRef("epic_boon_cleric_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("greater_divine_intervention_cleric_2024", "Greater Divine Intervention"));

  const slots = casterSpellSlots[lvl - 1];
  const channelCharges = lvl >= 18 ? 4 : (lvl >= 6 ? 3 : (lvl >= 2 ? 2 : 0));
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { divine_order_options: ["Protector", "Thaumaturge"], channel_divinity_charges: channelCharges },
    index: `cleric_level_${lvl}`,
    class: { index: "cleric", name: "Cleric", url: "/assets/atlas/class/json/24/cleric.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/cleric_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { cantrips_known: cantripsTable[lvl - 1], prepared_spells: clericPreparedTable[lvl - 1], spell_slots_level_1: slots[0], spell_slots_level_2: slots[1], spell_slots_level_3: slots[2], spell_slots_level_4: slots[3], spell_slots_level_5: slots[4], spell_slots_level_6: slots[5], spell_slots_level_7: slots[6], spell_slots_level_8: slots[7], spell_slots_level_9: slots[8] }
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
  if (lvl === 2) features.push(featureRef("cunning_action_2024", "Cunning Action"));
  if (lvl === 3) {
    features.push(featureRef("rogue_subclass_2024", "Rogue Subclass"));
    features.push(featureRef("steady_aim_rogue_2024", "Steady Aim"));
  }
  if (lvl === 4) features.push(featureRef("rogue_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) {
    features.push(featureRef("cunning_strike_2024", "Cunning Strike"));
    features.push(featureRef("uncanny_dodge_2024", "Uncanny Dodge"));
  }
  if (lvl === 6) features.push(featureRef("rogue_expertise_2_2024", "Expertise (Level 6)"));
  if (lvl === 7) {
    features.push(featureRef("evasion_rogue_2024", "Evasion"));
    features.push(featureRef("reliable_talent_2024", "Reliable Talent"));
  }
  if (lvl === 8) features.push(featureRef("rogue_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 10) features.push(featureRef("rogue_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 11) features.push(featureRef("improved_cunning_strike_2024", "Improved Cunning Strike"));
  if (lvl === 12) features.push(featureRef("rogue_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 14) features.push(featureRef("devious_strikes_2024", "Devious Strikes"));
  if (lvl === 15) features.push(featureRef("slippery_mind_2024", "Slippery Mind"));
  if (lvl === 16) features.push(featureRef("rogue_ability_score_improvement_5_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("elusive_2024", "Elusive"));
  if (lvl === 19) features.push(featureRef("epic_boon_rogue_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("stroke_of_luck_2024", "Stroke of Luck"));

  const sneakDice = Math.ceil(lvl / 2);
  const asiCount = [4, 8, 10, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: { count: 2, description: "You can master 2 weapons of your choice from your class weapon proficiencies." },
    class_specific: { weapon_mastery_count: 2, sneak_attack: { dice_count: sneakDice, dice_value: 6 } },
    index: `rogue_level_${lvl}`,
    class: { index: "rogue", name: "Rogue", url: "/assets/atlas/class/json/24/rogue.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/rogue_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

// --- BARBARIAN 2024 ---
function buildBarbarianLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("rage_2024", "Rage"));
    features.push(featureRef("unarmored_defense_barbarian_2024", "Unarmored Defense"));
    features.push(featureRef("weapon_mastery_barbarian_2024", "Weapon Mastery"));
  }
  if (lvl === 2) {
    features.push(featureRef("reckless_attack_2024", "Reckless Attack"));
    features.push(featureRef("danger_sense_2024", "Danger Sense"));
  }
  if (lvl === 3) {
    features.push(featureRef("barbarian_subclass_2024", "Barbarian Subclass"));
    features.push(featureRef("primal_knowledge_2024", "Primal Knowledge"));
  }
  if (lvl === 4) features.push(featureRef("barbarian_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) {
    features.push(featureRef("extra_attack_barbarian_2024", "Extra Attack"));
    features.push(featureRef("fast_movement_2024", "Fast Movement"));
  }
  if (lvl === 7) {
    features.push(featureRef("feral_instinct_2024", "Feral Instinct"));
    features.push(featureRef("instinctive_pounce_2024", "Instinctive Pounce"));
  }
  if (lvl === 8) features.push(featureRef("barbarian_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 9) features.push(featureRef("brutal_strike_2024", "Brutal Strike"));
  if (lvl === 11) features.push(featureRef("relentless_rage_2024", "Relentless Rage"));
  if (lvl === 12) features.push(featureRef("barbarian_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("improved_brutal_strike_2024", "Improved Brutal Strike"));
  if (lvl === 15) features.push(featureRef("persistent_rage_2024", "Persistent Rage"));
  if (lvl === 16) features.push(featureRef("barbarian_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 17) features.push(featureRef("improved_brutal_strike_2_2024", "Improved Brutal Strike (2)"));
  if (lvl === 18) features.push(featureRef("indomitable_might_2024", "Indomitable Might"));
  if (lvl === 19) features.push(featureRef("epic_boon_barbarian_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("primal_champion_2024", "Primal Champion"));

  const rageUses = lvl >= 17 ? 6 : (lvl >= 12 ? 5 : (lvl >= 6 ? 4 : (lvl >= 3 ? 3 : 2)));
  const rageBonus = lvl >= 16 ? 4 : (lvl >= 9 ? 3 : 2);
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: { count: 2, description: "You can master 2 martial or simple melee weapons of your choice." },
    class_specific: { rage_uses: rageUses, rage_damage_bonus: rageBonus },
    index: `barbarian_level_${lvl}`,
    class: { index: "barbarian", name: "Barbarian", url: "/assets/atlas/class/json/24/barbarian.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/barbarian_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

// --- BARD 2024 ---
function buildBardLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_bard_2024", "Spellcasting: Bard"));
    features.push(featureRef("bardic_inspiration_2024", "Bardic Inspiration"));
  }
  if (lvl === 2) {
    features.push(featureRef("jack_of_all_trades_2024", "Jack of All Trades"));
    features.push(featureRef("expertise_bard_2024", "Expertise"));
  }
  if (lvl === 3) features.push(featureRef("bard_subclass_2024", "Bard Subclass"));
  if (lvl === 4) features.push(featureRef("bard_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) {
    features.push(featureRef("font_of_inspiration_2024", "Font of Inspiration"));
    features.push(featureRef("bardic_inspiration_d8_2024", "Bardic Inspiration (d8)"));
  }
  if (lvl === 6) features.push(featureRef("countercharm_2024", "Countercharm"));
  if (lvl === 7) features.push(featureRef("expertise_bard_2_2024", "Expertise (Level 7)"));
  if (lvl === 8) features.push(featureRef("bard_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 10) {
    features.push(featureRef("bardic_inspiration_d10_2024", "Bardic Inspiration (d10)"));
    features.push(featureRef("magical_secrets_2024", "Magical Secrets"));
  }
  if (lvl === 12) features.push(featureRef("bard_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 15) features.push(featureRef("bardic_inspiration_d12_2024", "Bardic Inspiration (d12)"));
  if (lvl === 16) features.push(featureRef("bard_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("superior_inspiration_2024", "Superior Inspiration"));
  if (lvl === 19) features.push(featureRef("epic_boon_bard_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("words_of_creation_2024", "Words of Creation"));

  const slots = casterSpellSlots[lvl - 1];
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;
  const inspirationDie = lvl >= 15 ? "d12" : (lvl >= 10 ? "d10" : (lvl >= 5 ? "d8" : "d6"));

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { bardic_inspiration_die: inspirationDie },
    index: `bard_level_${lvl}`,
    class: { index: "bard", name: "Bard", url: "/assets/atlas/class/json/24/bard.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/bard_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { cantrips_known: cantripsTable[lvl - 1], prepared_spells: bardPreparedTable[lvl - 1], spell_slots_level_1: slots[0], spell_slots_level_2: slots[1], spell_slots_level_3: slots[2], spell_slots_level_4: slots[3], spell_slots_level_5: slots[4], spell_slots_level_6: slots[5], spell_slots_level_7: slots[6], spell_slots_level_8: slots[7], spell_slots_level_9: slots[8] }
  };
}

// --- DRUID 2024 ---
function buildDruidLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_druid_2024", "Spellcasting: Druid"));
    features.push(featureRef("primal_order_2024", "Primal Order"));
    features.push(featureRef("druidic_2024", "Druidic"));
  }
  if (lvl === 2) {
    features.push(featureRef("wild_shape_2024", "Wild Shape"));
    features.push(featureRef("wild_companion_2024", "Wild Companion"));
  }
  if (lvl === 3) features.push(featureRef("druid_subclass_2024", "Druid Subclass"));
  if (lvl === 4) features.push(featureRef("druid_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) features.push(featureRef("wild_resurgence_2024", "Wild Resurgence"));
  if (lvl === 7) features.push(featureRef("elemental_fury_2024", "Elemental Fury"));
  if (lvl === 8) features.push(featureRef("druid_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 12) features.push(featureRef("druid_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 15) features.push(featureRef("improved_elemental_fury_2024", "Improved Elemental Fury"));
  if (lvl === 16) features.push(featureRef("druid_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("beast_spells_2024", "Beast Spells"));
  if (lvl === 19) features.push(featureRef("epic_boon_druid_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("archdruid_2024", "Archdruid"));

  const slots = casterSpellSlots[lvl - 1];
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;
  const maxCr = lvl >= 8 ? 1 : (lvl >= 4 ? 0.5 : 0.25);
  const wildShapeUses = lvl >= 17 ? 4 : (lvl >= 6 ? 3 : 2);

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { wild_shape_max_cr: maxCr, wild_shape_uses: wildShapeUses },
    index: `druid_level_${lvl}`,
    class: { index: "druid", name: "Druid", url: "/assets/atlas/class/json/24/druid.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/druid_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { cantrips_known: cantripsTable[lvl - 1], prepared_spells: druidPreparedTable[lvl - 1], spell_slots_level_1: slots[0], spell_slots_level_2: slots[1], spell_slots_level_3: slots[2], spell_slots_level_4: slots[3], spell_slots_level_5: slots[4], spell_slots_level_6: slots[5], spell_slots_level_7: slots[6], spell_slots_level_8: slots[7], spell_slots_level_9: slots[8] }
  };
}

// --- MONK 2024 ---
function buildMonkLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("martial_arts_2024", "Martial Arts"));
    features.push(featureRef("unarmored_defense_monk_2024", "Unarmored Defense"));
  }
  if (lvl === 2) {
    features.push(featureRef("monk_focus_2024", "Monk Focus"));
    features.push(featureRef("unarmored_movement_monk_2024", "Unarmored Movement"));
    features.push(featureRef("uncanny_metabolism_2024", "Uncanny Metabolism"));
  }
  if (lvl === 3) {
    features.push(featureRef("monk_subclass_2024", "Monk Subclass"));
    features.push(featureRef("deflect_attacks_2024", "Deflect Attacks"));
  }
  if (lvl === 4) {
    features.push(featureRef("monk_ability_score_improvement_1_2024", "Ability Score Improvement"));
    features.push(featureRef("slow_fall_2024", "Slow Fall"));
  }
  if (lvl === 5) {
    features.push(featureRef("extra_attack_monk_2024", "Extra Attack"));
    features.push(featureRef("stunning_strike_2024", "Stunning Strike"));
  }
  if (lvl === 6) features.push(featureRef("empowered_strikes_2024", "Empowered Strikes"));
  if (lvl === 7) features.push(featureRef("evasion_monk_2024", "Evasion"));
  if (lvl === 8) features.push(featureRef("monk_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 9) features.push(featureRef("acrobatic_movement_2024", "Acrobatic Movement"));
  if (lvl === 10) {
    features.push(featureRef("heightened_focus_2024", "Heightened Focus"));
    features.push(featureRef("self_restoration_2024", "Self-Restoration"));
  }
  if (lvl === 12) features.push(featureRef("monk_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("deflect_energy_2024", "Deflect Energy"));
  if (lvl === 14) features.push(featureRef("disciplined_survivor_2024", "Disciplined Survivor"));
  if (lvl === 15) features.push(featureRef("perfect_focus_2024", "Perfect Focus"));
  if (lvl === 16) features.push(featureRef("monk_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("superior_defense_2024", "Superior Defense"));
  if (lvl === 19) features.push(featureRef("epic_boon_monk_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("body_and_mind_2024", "Body and Mind"));

  const focusPoints = lvl >= 2 ? lvl : 0;
  const martialArtsDie = lvl >= 17 ? "1d12" : (lvl >= 11 ? "1d10" : (lvl >= 5 ? "1d8" : "1d6"));
  const unarmoredSpeed = lvl >= 18 ? 30 : (lvl >= 14 ? 25 : (lvl >= 10 ? 20 : (lvl >= 6 ? 15 : (lvl >= 2 ? 10 : 0))));
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { focus_points: focusPoints, martial_arts_die: martialArtsDie, unarmored_movement_bonus: unarmoredSpeed },
    index: `monk_level_${lvl}`,
    class: { index: "monk", name: "Monk", url: "/assets/atlas/class/json/24/monk.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/monk_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

// --- PALADIN 2024 ---
function buildPaladinLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("lay_on_hands_2024", "Lay on Hands"));
    features.push(featureRef("spellcasting_paladin_2024", "Spellcasting: Paladin"));
    features.push(featureRef("weapon_mastery_paladin_2024", "Weapon Mastery"));
  }
  if (lvl === 2) {
    features.push(featureRef("paladin_smite_2024", "Paladin Smite"));
    features.push(featureRef("fighting_style_paladin_2024", "Fighting Style"));
  }
  if (lvl === 3) {
    features.push(featureRef("paladin_subclass_2024", "Paladin Subclass"));
    features.push(featureRef("channel_divinity_paladin_2024", "Channel Divinity"));
  }
  if (lvl === 4) features.push(featureRef("paladin_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) {
    features.push(featureRef("extra_attack_paladin_2024", "Extra Attack"));
    features.push(featureRef("faithful_steed_2024", "Faithful Steed"));
  }
  if (lvl === 6) features.push(featureRef("aura_of_protection_2024", "Aura of Protection"));
  if (lvl === 8) features.push(featureRef("paladin_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 9) features.push(featureRef("abjure_foes_2024", "Abjure Foes"));
  if (lvl === 11) features.push(featureRef("radiant_strikes_2024", "Radiant Strikes"));
  if (lvl === 12) features.push(featureRef("paladin_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 14) features.push(featureRef("restoring_touch_2024", "Restoring Touch"));
  if (lvl === 16) features.push(featureRef("paladin_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 18) features.push(featureRef("aura_expansion_2024", "Aura Expansion"));
  if (lvl === 19) features.push(featureRef("epic_boon_paladin_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("holy_nimbus_2024", "Holy Nimbus"));

  const halfSlots = halfCasterSpellSlots[lvl - 1];
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: { count: 2, description: "You can master 2 simple or martial weapons of your choice." },
    class_specific: { lay_on_hands_pool: lvl * 5 },
    index: `paladin_level_${lvl}`,
    class: { index: "paladin", name: "Paladin", url: "/assets/atlas/class/json/24/paladin.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/paladin_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { spell_slots_level_1: halfSlots[0], spell_slots_level_2: halfSlots[1], spell_slots_level_3: halfSlots[2], spell_slots_level_4: halfSlots[3], spell_slots_level_5: halfSlots[4] }
  };
}

// --- RANGER 2024 ---
function buildRangerLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_ranger_2024", "Spellcasting: Ranger"));
    features.push(featureRef("favored_enemy_2024", "Favored Enemy"));
    features.push(featureRef("weapon_mastery_ranger_2024", "Weapon Mastery"));
  }
  if (lvl === 2) {
    features.push(featureRef("deft_explorer_2024", "Deft Explorer"));
    features.push(featureRef("fighting_style_ranger_2024", "Fighting Style"));
  }
  if (lvl === 3) features.push(featureRef("ranger_subclass_2024", "Ranger Subclass"));
  if (lvl === 4) features.push(featureRef("ranger_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) features.push(featureRef("extra_attack_ranger_2024", "Extra Attack"));
  if (lvl === 6) features.push(featureRef("roving_2024", "Roving"));
  if (lvl === 8) features.push(featureRef("ranger_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 9) features.push(featureRef("expertise_ranger_2_2024", "Expertise (Level 9)"));
  if (lvl === 10) features.push(featureRef("tireless_2024", "Tireless"));
  if (lvl === 12) features.push(featureRef("ranger_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("relentless_hunter_2024", "Relentless Hunter"));
  if (lvl === 14) features.push(featureRef("nature_veil_2024", "Nature's Veil"));
  if (lvl === 16) features.push(featureRef("ranger_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 17) features.push(featureRef("precise_hunter_2024", "Precise Hunter"));
  if (lvl === 18) features.push(featureRef("feral_senses_2024", "Feral Senses"));
  if (lvl === 19) features.push(featureRef("epic_boon_ranger_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("foe_slayer_2024", "Foe Slayer"));

  const halfSlots = halfCasterSpellSlots[lvl - 1];
  const markUses = lvl >= 17 ? 6 : (lvl >= 13 ? 5 : (lvl >= 9 ? 4 : (lvl >= 5 ? 3 : 2)));
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    weapon_mastery: { count: 2, description: "You can master 2 simple or martial weapons of your choice." },
    class_specific: { hunters_mark_free_uses: markUses },
    index: `ranger_level_${lvl}`,
    class: { index: "ranger", name: "Ranger", url: "/assets/atlas/class/json/24/ranger.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/ranger_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { spell_slots_level_1: halfSlots[0], spell_slots_level_2: halfSlots[1], spell_slots_level_3: halfSlots[2], spell_slots_level_4: halfSlots[3], spell_slots_level_5: halfSlots[4] }
  };
}

// --- SORCERER 2024 ---
function buildSorcererLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("spellcasting_sorcerer_2024", "Spellcasting: Sorcerer"));
    features.push(featureRef("innate_sorcery_2024", "Innate Sorcery"));
  }
  if (lvl === 2) {
    features.push(featureRef("font_of_magic_2024", "Font of Magic"));
    features.push(featureRef("metamagic_2024", "Metamagic"));
  }
  if (lvl === 3) features.push(featureRef("sorcerer_subclass_2024", "Sorcerer Subclass"));
  if (lvl === 4) features.push(featureRef("sorcerer_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 5) features.push(featureRef("sorcerous_restoration_2024", "Sorcerous Restoration"));
  if (lvl === 7) features.push(featureRef("metamagic_options_2_2024", "Metamagic Options (Level 7)"));
  if (lvl === 8) features.push(featureRef("sorcerer_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 12) features.push(featureRef("sorcerer_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("metamagic_options_3_2024", "Metamagic Options (Level 13)"));
  if (lvl === 16) features.push(featureRef("sorcerer_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 17) features.push(featureRef("metamagic_options_4_2024", "Metamagic Options (Level 17)"));
  if (lvl === 19) features.push(featureRef("epic_boon_sorcerer_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("arcane_apotheosis_2024", "Arcane Apotheosis"));

  const slots = casterSpellSlots[lvl - 1];
  const sorceryPoints = lvl >= 2 ? lvl : 0;
  const metamagicCount = lvl >= 17 ? 8 : (lvl >= 13 ? 6 : (lvl >= 7 ? 4 : (lvl >= 2 ? 2 : 0)));
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { sorcery_points: sorceryPoints, metamagic_known_count: metamagicCount },
    index: `sorcerer_level_${lvl}`,
    class: { index: "sorcerer", name: "Sorcerer", url: "/assets/atlas/class/json/24/sorcerer.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/sorcerer_level_${lvl}.json`,
    rulesetContext: "2024",
    spellcasting: { cantrips_known: cantripsTable[lvl - 1], prepared_spells: sorcererPreparedTable[lvl - 1], spell_slots_level_1: slots[0], spell_slots_level_2: slots[1], spell_slots_level_3: slots[2], spell_slots_level_4: slots[3], spell_slots_level_5: slots[4], spell_slots_level_6: slots[5], spell_slots_level_7: slots[6], spell_slots_level_8: slots[7], spell_slots_level_9: slots[8] }
  };
}

// --- WARLOCK 2024 ---
function buildWarlockLevel(lvl) {
  const features = [];
  if (lvl === 1) {
    features.push(featureRef("pact_spells_warlock_2024", "Pact Spells"));
    features.push(featureRef("eldritch_invocations_2024", "Eldritch Invocations"));
  }
  if (lvl === 2) features.push(featureRef("magical_cunning_2024", "Magical Cunning"));
  if (lvl === 3) features.push(featureRef("warlock_subclass_2024", "Warlock Subclass"));
  if (lvl === 4) features.push(featureRef("warlock_ability_score_improvement_1_2024", "Ability Score Improvement"));
  if (lvl === 8) features.push(featureRef("warlock_ability_score_improvement_2_2024", "Ability Score Improvement"));
  if (lvl === 9) features.push(featureRef("contact_patron_2024", "Contact Patron"));
  if (lvl === 11) features.push(featureRef("mystic_arcanum_11_2024", "Mystic Arcanum (6th Level)"));
  if (lvl === 12) features.push(featureRef("warlock_ability_score_improvement_3_2024", "Ability Score Improvement"));
  if (lvl === 13) features.push(featureRef("mystic_arcanum_13_2024", "Mystic Arcanum (7th Level)"));
  if (lvl === 15) features.push(featureRef("mystic_arcanum_15_2024", "Mystic Arcanum (8th Level)"));
  if (lvl === 16) features.push(featureRef("warlock_ability_score_improvement_4_2024", "Ability Score Improvement"));
  if (lvl === 17) features.push(featureRef("mystic_arcanum_17_2024", "Mystic Arcanum (9th Level)"));
  if (lvl === 19) features.push(featureRef("epic_boon_warlock_2024", "Epic Boon"));
  if (lvl === 20) features.push(featureRef("eldritch_master_2024", "Eldritch Master"));

  const pactSlots = lvl >= 17 ? 4 : (lvl >= 11 ? 3 : (lvl >= 2 ? 2 : 1));
  const slotLevel = lvl >= 9 ? 5 : (lvl >= 7 ? 4 : (lvl >= 5 ? 3 : (lvl >= 3 ? 2 : 1)));
  const invocations = lvl >= 18 ? 10 : (lvl >= 15 ? 9 : (lvl >= 12 ? 8 : (lvl >= 9 ? 7 : (lvl >= 7 ? 6 : (lvl >= 5 ? 5 : (lvl >= 2 ? 3 : 1))))));
  const asiCount = [4, 8, 12, 16].filter(l => l <= lvl).length;

  return {
    level: lvl,
    ability_score_bonuses: asiCount,
    prof_bonus: getProfBonus(lvl),
    features,
    class_specific: { pact_slots: pactSlots, pact_slot_level: slotLevel, invocations_known: invocations },
    index: `warlock_level_${lvl}`,
    class: { index: "warlock", name: "Warlock", url: "/assets/atlas/class/json/24/warlock.json" },
    url: `/assets/atlas/class/levels/24/${lvl}/warlock_level_${lvl}.json`,
    rulesetContext: "2024"
  };
}

const classesToBuild = [
  { name: 'fighter', builder: buildFighterLevel },
  { name: 'wizard', builder: buildWizardLevel },
  { name: 'cleric', builder: buildClericLevel },
  { name: 'rogue', builder: buildRogueLevel },
  { name: 'barbarian', builder: buildBarbarianLevel },
  { name: 'bard', builder: buildBardLevel },
  { name: 'druid', builder: buildDruidLevel },
  { name: 'monk', builder: buildMonkLevel },
  { name: 'paladin', builder: buildPaladinLevel },
  { name: 'ranger', builder: buildRangerLevel },
  { name: 'sorcerer', builder: buildSorcererLevel },
  { name: 'warlock', builder: buildWarlockLevel }
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
