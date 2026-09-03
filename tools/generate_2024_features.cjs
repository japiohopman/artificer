const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '../public/assets/atlas/features/json');
if (!fs.existsSync(FEATURES_DIR)) {
  fs.mkdirSync(FEATURES_DIR, { recursive: true });
}

const fighterRef = { index: "fighter", name: "Fighter", url: "/assets/atlas/class/json/24/fighter.json" };
const wizardRef = { index: "wizard", name: "Wizard", url: "/assets/atlas/class/json/24/wizard.json" };
const clericRef = { index: "cleric", name: "Cleric", url: "/assets/atlas/class/json/24/cleric.json" };
const rogueRef = { index: "rogue", name: "Rogue", url: "/assets/atlas/class/json/24/rogue.json" };
const barbarianRef = { index: "barbarian", name: "Barbarian", url: "/assets/atlas/class/json/24/barbarian.json" };
const bardRef = { index: "bard", name: "Bard", url: "/assets/atlas/class/json/24/bard.json" };
const druidRef = { index: "druid", name: "Druid", url: "/assets/atlas/class/json/24/druid.json" };
const monkRef = { index: "monk", name: "Monk", url: "/assets/atlas/class/json/24/monk.json" };
const paladinRef = { index: "paladin", name: "Paladin", url: "/assets/atlas/class/json/24/paladin.json" };
const rangerRef = { index: "ranger", name: "Ranger", url: "/assets/atlas/class/json/24/ranger.json" };
const sorcererRef = { index: "sorcerer", name: "Sorcerer", url: "/assets/atlas/class/json/24/sorcerer.json" };
const warlockRef = { index: "warlock", name: "Warlock", url: "/assets/atlas/class/json/24/warlock.json" };

const features = [
  // --- FIGHTER 2024 FEATURES ---
  {
    index: "fighter_fighting_style_2024",
    name: "Fighting Style",
    class: fighterRef,
    level: 1,
    desc: ["You gain a Fighting Style feat of your choice. If you later gain a choice of Fighting Style feat, you must choose a different one."],
    url: "/assets/atlas/features/json/fighter_fighting_style_2024.json"
  },
  {
    index: "second_wind_2024",
    name: "Second Wind",
    class: fighterRef,
    level: 1,
    desc: ["You have a limited well of stamina that you can draw on to protect yourself from harm. As a Bonus Action, you can regain Hit Points equal to 1d10 + your Fighter level. You can use this feature twice. You regain one expended use when you finish a Short Rest, and all expended uses when you finish a Long Rest. The number of uses increases at Fighter levels 4 (3 uses) and 10 (4 uses)."],
    feature_specific: { uses_at_level_1: 2, uses_at_level_4: 3, uses_at_level_10: 4, recharge: "short_rest_1_all_long_rest" },
    url: "/assets/atlas/features/json/second_wind_2024.json"
  },
  {
    index: "weapon_mastery_fighter",
    name: "Weapon Mastery",
    class: fighterRef,
    level: 1,
    desc: ["Your training with weapons allows you to use the mastery properties of three martial or simple weapons of your choice. Whenever you finish a Long Rest, you can change the kinds of weapons you master. The number of weapons increases to 4 at level 4, 5 at level 10, and 6 at level 16."],
    feature_specific: { mastery_count: 3 },
    url: "/assets/atlas/features/json/weapon_mastery_fighter.json"
  },
  {
    index: "action_surge_2024",
    name: "Action Surge",
    class: fighterRef,
    level: 2,
    desc: ["You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the Magic action. Once you use this feature, you must finish a Short or Long Rest before you can use it again. Starting at level 17, you can use it twice before a rest, but only once on the same turn."],
    feature_specific: { uses: 1, recharge: "short_or_long_rest" },
    url: "/assets/atlas/features/json/action_surge_2024.json"
  },
  {
    index: "tactical_mind_2024",
    name: "Tactical Mind",
    class: fighterRef,
    level: 2,
    desc: ["When you fail an ability check, you can expend one use of your Second Wind to roll 1d10 and add the number rolled to the check, potentially turning the failure into a success. If the check still fails, the Second Wind use isn't expended."],
    url: "/assets/atlas/features/json/tactical_mind_2024.json"
  },
  {
    index: "fighter_subclass_2024",
    name: "Fighter Subclass",
    class: fighterRef,
    level: 3,
    desc: ["You gain a Fighter subclass of your choice. A subclass is a specialization that grants you features at certain Fighter levels (levels 3, 7, 10, and 15)."],
    url: "/assets/atlas/features/json/fighter_subclass_2024.json"
  },
  {
    index: "tactical_shift_2024",
    name: "Tactical Shift",
    class: fighterRef,
    level: 5,
    desc: ["Whenever you activate Second Wind as a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks."],
    url: "/assets/atlas/features/json/tactical_shift_2024.json"
  },
  {
    index: "extra_attack_fighter_2024",
    name: "Extra Attack",
    class: fighterRef,
    level: 5,
    desc: ["You can attack twice, instead of once, whenever you take the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_fighter_2024.json"
  },
  {
    index: "indomitable_2024",
    name: "Indomitable",
    class: fighterRef,
    level: 9,
    desc: ["If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can't use this feature again until you finish a Long Rest. You gain additional uses at level 13 (2 uses) and level 17 (3 uses)."],
    feature_specific: { uses_at_level_9: 1, bonus: "fighter_level" },
    url: "/assets/atlas/features/json/indomitable_2024.json"
  },
  {
    index: "tactical_master_2024",
    name: "Tactical Master",
    class: fighterRef,
    level: 9,
    desc: ["When you attack with a weapon whose mastery property you can use, you can replace that property for that attack with Push, Sap, or Slow."],
    url: "/assets/atlas/features/json/tactical_master_2024.json"
  },
  {
    index: "extra_attack_2_fighter_2024",
    name: "Extra Attack (2)",
    class: fighterRef,
    level: 11,
    desc: ["You can attack three times, instead of twice, whenever you take the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_2_fighter_2024.json"
  },
  {
    index: "studied_attacks_2024",
    name: "Studied Attacks",
    class: fighterRef,
    level: 13,
    desc: ["If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn."],
    url: "/assets/atlas/features/json/studied_attacks_2024.json"
  },
  {
    index: "extra_attack_3_fighter_2024",
    name: "Extra Attack (3)",
    class: fighterRef,
    level: 20,
    desc: ["You can attack four times, instead of three, whenever you take the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_3_fighter_2024.json"
  },
  {
    index: "epic_boon_fighter_2024",
    name: "Epic Boon",
    class: fighterRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_fighter_2024.json"
  },

  // --- WIZARD 2024 FEATURES ---
  {
    index: "spellcasting_wizard_2024",
    name: "Spellcasting: Wizard",
    class: wizardRef,
    level: 1,
    desc: ["As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. Intelligence is your spellcasting ability for your Wizard spells."],
    url: "/assets/atlas/features/json/spellcasting_wizard_2024.json"
  },
  {
    index: "arcane_recovery_2024",
    name: "Arcane Recovery",
    class: wizardRef,
    level: 1,
    desc: ["You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a Short Rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your Wizard level (rounded up), and none of the slots can be 6th level or higher."],
    url: "/assets/atlas/features/json/arcane_recovery_2024.json"
  },
  {
    index: "scholar_wizard_2024",
    name: "Scholar",
    class: wizardRef,
    level: 2,
    desc: ["While studying magic, you specialized in another field of study. Choose one of the following skills in which you have proficiency: Arcana, History, Investigation, Medicine, Nature, or Religion. You gain Expertise in the chosen skill."],
    url: "/assets/atlas/features/json/scholar_wizard_2024.json"
  },
  {
    index: "wizard_subclass_2024",
    name: "Wizard Subclass",
    class: wizardRef,
    level: 3,
    desc: ["You gain a Wizard subclass of your choice. A subclass is a specialization that grants you features at certain Wizard levels (levels 3, 6, 10, and 14)."],
    url: "/assets/atlas/features/json/wizard_subclass_2024.json"
  },
  {
    index: "memorize_spell_wizard_2024",
    name: "Memorize Spell",
    class: wizardRef,
    level: 5,
    desc: ["Whenever you finish a Short Rest, you can study your spellbook and replace one of your prepared Wizard spells of level 1 or higher with another level 1+ spell from your spellbook."],
    url: "/assets/atlas/features/json/memorize_spell_wizard_2024.json"
  },
  {
    index: "spell_mastery_wizard_2024",
    name: "Spell Mastery",
    class: wizardRef,
    level: 18,
    desc: ["You have achieved such mastery over certain spells that you can cast them at will. Choose one 1st-level Wizard spell and one 2nd-level Wizard spell in your spellbook that have a casting time of an Action. You always have these spells prepared, and you can cast each at its lowest level without expending a spell slot. If you want to cast either spell at a higher level, you must expend a spell slot as normal. Whenever you finish a Long Rest, you can study your spellbook and replace one of these chosen spells with another eligible spell of the same level."],
    feature_specific: {
      at_will_casting: true,
      slot_expenditure: false,
      casting_time_restriction: "1 Action",
      replace_on_long_rest: 1
    },
    url: "/assets/atlas/features/json/spell_mastery_wizard_2024.json"
  },
  {
    index: "signature_spells_wizard_2024",
    name: "Signature Spells",
    class: wizardRef,
    level: 20,
    desc: ["You gain mastery over two powerful spells. Choose two 3rd-level Wizard spells in your spellbook as your signature spells. You always have these spells prepared, and you can cast each once at 3rd level without expending a spell slot. You regain the ability to cast them after a Short or Long Rest."],
    url: "/assets/atlas/features/json/signature_spells_wizard_2024.json"
  },
  {
    index: "epic_boon_wizard_2024",
    name: "Epic Boon",
    class: wizardRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_wizard_2024.json"
  },

  // --- CLERIC 2024 FEATURES ---
  {
    index: "spellcasting_cleric_2024",
    name: "Spellcasting: Cleric",
    class: clericRef,
    level: 1,
    desc: ["As a conduit for divine power, you can cast Cleric spells. Wisdom is your spellcasting ability for your Cleric spells."],
    url: "/assets/atlas/features/json/spellcasting_cleric_2024.json"
  },
  {
    index: "divine_order_cleric",
    name: "Divine Order",
    class: clericRef,
    level: 1,
    desc: ["You have dedicated yourself to one of the following sacred roles of your choice: Protector (trained for battle with Martial weapon proficiency and Heavy Armor proficiency) or Thaumaturge (delving deeper into sacred lore, gaining an extra cantrip and a bonus to Arcana and Religion checks)."],
    url: "/assets/atlas/features/json/divine_order_cleric.json"
  },
  {
    index: "channel_divinity_cleric_2024",
    name: "Channel Divinity",
    class: clericRef,
    level: 2,
    desc: [
      "You can channel divine energy directly from the outer planes to fuel magical effects. You start with two options: Divine Spark and Turn Undead. You gain 2 uses of Channel Divinity. You regain 1 expended use when you finish a Short Rest, and all expended uses when you finish a Long Rest. The number of uses increases to 3 at level 6 and 4 at level 18.",
      "Divine Spark: As a Magic action, you point your holy symbol at a creature you can see within 30 feet of yourself and focus divine energy. Roll 1d8 + your Wisdom modifier. You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw against your Cleric spell save DC. On a failed save, the target takes Radiant or Necrotic damage (your choice) equal to the total, or half as much damage on a successful save. The damage or healing increases to 2d8 + WIS at level 7, 3d8 + WIS at level 13, and 4d8 + WIS at level 18.",
      "Turn Undead: As a Magic action, you present your holy symbol and censure Undead creatures. Each Undead within 30 feet of you that can see or hear you must make a Wisdom saving throw against your Cleric spell save DC. On a failed save, the creature is Turned for 1 minute or until it takes damage."
    ],
    feature_specific: {
      uses_at_level_2: 2,
      uses_at_level_6: 3,
      uses_at_level_18: 4,
      recharge: "short_rest_1_all_long_rest",
      save_dc: "Cleric spell save DC",
      divine_spark: { action: "Magic", range: "30 feet", dice: "1d8 (L2), 2d8 (L7), 3d8 (L13), 4d8 (L18) + WIS mod", save: "CON" },
      turn_undead: { action: "Magic", range: "30 feet", save: "WIS", duration: "1 minute" }
    },
    url: "/assets/atlas/features/json/channel_divinity_cleric_2024.json"
  },
  {
    index: "cleric_subclass_2024",
    name: "Cleric Subclass",
    class: clericRef,
    level: 3,
    desc: ["You gain a Cleric subclass of your choice. A subclass is a specialization that grants you features at certain Cleric levels (levels 3, 6, and 17)."],
    url: "/assets/atlas/features/json/cleric_subclass_2024.json"
  },
  {
    index: "sear_undead_cleric_2024",
    name: "Sear Undead",
    class: clericRef,
    level: 5,
    desc: ["Whenever you use Turn Undead, roll a number of d8s equal to your Wisdom modifier (minimum of 1d8). Each Undead that fails its saving throw against Turn Undead takes Radiant damage equal to the total rolled."],
    url: "/assets/atlas/features/json/sear_undead_cleric_2024.json"
  },
  {
    index: "blessed_strikes_cleric_2024",
    name: "Blessed Strikes",
    class: clericRef,
    level: 7,
    desc: ["Divine power infuses your attacks. Choose Divine Strike (once per turn, dealing extra 1d8 Radiant or Necrotic damage on weapon hit) or Potent Spellcasting (adding Wisdom modifier to damage dealt by any Cleric cantrip)."],
    url: "/assets/atlas/features/json/blessed_strikes_cleric_2024.json"
  },
  {
    index: "divine_intervention_cleric_2024",
    name: "Divine Intervention",
    class: clericRef,
    level: 10,
    desc: ["You can call directly on your deity for aid. As a Magic action, choose any Cleric spell of level 5 or lower that doesn't require a Reaction. You cast that spell without expending a spell slot or material components. Once used, you must finish a Long Rest before using this feature again."],
    url: "/assets/atlas/features/json/divine_intervention_cleric_2024.json"
  },
  {
    index: "blessed_strikes_improvement_cleric_2024",
    name: "Blessed Strikes Improvement",
    class: clericRef,
    level: 14,
    desc: ["Your Blessed Strikes option improves. Divine Strike: The extra damage increases to 2d8. Potent Spellcasting: When you deal damage to a creature with a Cleric cantrip, you gain temporary hit points equal to twice your Wisdom modifier."],
    feature_specific: { divine_strike_dice: "2d8", potent_spellcasting_temp_hp: "2_x_wis_modifier" },
    url: "/assets/atlas/features/json/blessed_strikes_improvement_cleric_2024.json"
  },
  {
    index: "greater_divine_intervention_cleric_2024",
    name: "Greater Divine Intervention",
    class: clericRef,
    level: 20,
    desc: ["Your connection to your deity reaches its peak. When you use Divine Intervention, you can choose Wish. After doing so, you can't use Divine Intervention again until you finish 2d4 Long Rests."],
    feature_specific: { effect: "cast_wish", recharge: "2d4_long_rests" },
    url: "/assets/atlas/features/json/greater_divine_intervention_cleric_2024.json"
  },
  {
    index: "epic_boon_cleric_2024",
    name: "Epic Boon",
    class: clericRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_cleric_2024.json"
  },

  // --- ROGUE 2024 FEATURES ---
  {
    index: "rogue_expertise_2024",
    name: "Expertise",
    class: rogueRef,
    level: 1,
    desc: ["You gain Expertise in two of your skill proficiencies of your choice. At level 6, you gain Expertise in two more skill proficiencies of your choice."],
    url: "/assets/atlas/features/json/rogue_expertise_2024.json"
  },
  {
    index: "sneak_attack_2024",
    name: "Sneak Attack",
    class: rogueRef,
    level: 1,
    desc: ["You know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal extra damage to one creature you hit with an attack roll if you have Advantage on the roll. The attack must use a Finesse or Ranged weapon. You don't need Advantage if another enemy of the target is within 5 feet of it, that enemy isn't incapacitated, and you don't have Disadvantage. The extra damage is 1d6 at level 1 and increases as you gain Rogue levels."],
    feature_specific: { dice_count: 1, dice_value: 6 },
    url: "/assets/atlas/features/json/sneak_attack_2024.json"
  },
  {
    index: "thieves_cant_2024",
    name: "Thieves' Cant",
    class: rogueRef,
    level: 1,
    desc: ["You learn Thieves' Cant and one other language of your choice."],
    url: "/assets/atlas/features/json/thieves_cant_2024.json"
  },
  {
    index: "weapon_mastery_rogue",
    name: "Weapon Mastery",
    class: rogueRef,
    level: 1,
    desc: ["Your training with weapons allows you to use the mastery properties of two weapons of your choice from your class weapon proficiencies."],
    feature_specific: { mastery_count: 2 },
    url: "/assets/atlas/features/json/weapon_mastery_rogue.json"
  },
  {
    index: "cunning_action_2024",
    name: "Cunning Action",
    class: rogueRef,
    level: 2,
    desc: ["Your quick thinking and agility allow you to move and act quickly. On your turn, you can take a Bonus Action to take one of the following actions: Dash, Disengage, or Hide."],
    url: "/assets/atlas/features/json/cunning_action_2024.json"
  },
  {
    index: "rogue_subclass_2024",
    name: "Rogue Subclass",
    class: rogueRef,
    level: 3,
    desc: ["You gain a Rogue subclass of your choice. A subclass is a specialization that grants you features at certain Rogue levels (levels 3, 9, 13, and 17)."],
    url: "/assets/atlas/features/json/rogue_subclass_2024.json"
  },
  {
    index: "steady_aim_rogue_2024",
    name: "Steady Aim",
    class: rogueRef,
    level: 3,
    desc: ["As a Bonus Action, you can give yourself Advantage on your next attack roll on the current turn. You can use this feature only if you haven't moved during this turn, and after using it your Speed becomes 0 until the end of the current turn."],
    url: "/assets/atlas/features/json/steady_aim_rogue_2024.json"
  },
  {
    index: "cunning_strike_2024",
    name: "Cunning Strike",
    class: rogueRef,
    level: 5,
    desc: [
      "You have developed cunning ways to use your Sneak Attack. When you deal Sneak Attack damage, you can forgo 1d6 of that damage to apply one of the following Cunning Strike effects of your choice. The save DC for these effects equals 8 + your Proficiency Bonus + your Dexterity modifier.",
      "Disarm (Cost: 1d6): The target must succeed on a Dexterity saving throw or drop one object of your choice that it is holding.",
      "Poison (Cost: 1d6): You must have a Poisoner's Kit on your person. The target must succeed on a Constitution saving throw or have the Poisoned condition for 1 minute. At the end of each of its turns, the target repeats the save, ending the effect on itself on a success.",
      "Trip (Cost: 1d6): If the target is Large or smaller, it must succeed on a Dexterity saving throw or fall Prone.",
      "Withdraw (Cost: 1d6): Immediately after the attack, you can move up to half your Speed without provoking Opportunity Attacks."
    ],
    feature_specific: {
      save_dc: "8 + PB + DEX",
      options: {
        disarm: { cost: "1d6", save: "DEX" },
        poison: { cost: "1d6", save: "CON", duration: "1 minute", requires: "Poisoner's Kit" },
        trip: { cost: "1d6", save: "DEX", size_limit: "Large" },
        withdraw: { cost: "1d6", no_oa: true }
      }
    },
    url: "/assets/atlas/features/json/cunning_strike_2024.json"
  },
  {
    index: "uncanny_dodge_2024",
    name: "Uncanny Dodge",
    class: rogueRef,
    level: 5,
    desc: ["When an attacker that you can see hits you with an attack roll, you can use your Reaction to halve the attack's damage against you."],
    url: "/assets/atlas/features/json/uncanny_dodge_2024.json"
  },
  {
    index: "rogue_expertise_2_2024",
    name: "Expertise (Level 6)",
    class: rogueRef,
    level: 6,
    desc: ["You gain Expertise in two more of your skill proficiencies of your choice."],
    url: "/assets/atlas/features/json/rogue_expertise_2_2024.json"
  },
  {
    index: "evasion_rogue_2024",
    name: "Evasion",
    class: rogueRef,
    level: 7,
    desc: ["When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail."],
    url: "/assets/atlas/features/json/evasion_rogue_2024.json"
  },
  {
    index: "reliable_talent_2024",
    name: "Reliable Talent",
    class: rogueRef,
    level: 7,
    desc: ["Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10."],
    url: "/assets/atlas/features/json/reliable_talent_2024.json"
  },
  {
    index: "improved_cunning_strike_2024",
    name: "Improved Cunning Strike",
    class: rogueRef,
    level: 11,
    desc: ["You can use up to two Cunning Strike effects when you deal Sneak Attack damage, paying the Sneak Attack cost for each."],
    url: "/assets/atlas/features/json/improved_cunning_strike_2024.json"
  },
  {
    index: "devious_strikes_2024",
    name: "Devious Strikes",
    class: rogueRef,
    level: 14,
    desc: [
      "You learn new ways to use your Cunning Strike. The following options now cost additional Sneak Attack dice:",
      "Daze (Cost: 2d6): The target must succeed on a Constitution saving throw or be dazed until the end of its next turn. While dazed, the target can take an action or a bonus action, not both, and it cannot take reactions.",
      "Knock Out (Cost: 6d6): The target must succeed on a Constitution saving throw or fall Prone and have the Unconscious condition for 1 minute or until it takes damage or a creature uses an action to wake it.",
      "Obscure (Cost: 3d6): The target must succeed on a Dexterity saving throw or have the Blinded condition until the end of its next turn."
    ],
    feature_specific: {
      options: {
        daze: { cost: "2d6", save: "CON", effect: "action_or_bonus_action_no_reaction" },
        knock_out: { cost: "6d6", save: "CON", condition: "Unconscious", duration: "1 minute" },
        obscure: { cost: "3d6", save: "DEX", condition: "Blinded", duration: "1 round" }
      }
    },
    url: "/assets/atlas/features/json/devious_strikes_2024.json"
  },
  {
    index: "slippery_mind_2024",
    name: "Slippery Mind",
    class: rogueRef,
    level: 15,
    desc: ["Your agile mind is difficult to control. You gain proficiency in Wisdom and Charisma saving throws."],
    url: "/assets/atlas/features/json/slippery_mind_2024.json"
  },
  {
    index: "elusive_2024",
    name: "Elusive",
    class: rogueRef,
    level: 18,
    desc: ["No attack roll has Advantage against you while you aren't Incapacitated."],
    url: "/assets/atlas/features/json/elusive_2024.json"
  },
  {
    index: "stroke_of_luck_2024",
    name: "Stroke of Luck",
    class: rogueRef,
    level: 20,
    desc: ["You have a knack for succeeding when you need to. If you fail a D20 Test, you can turn the roll into a 20. Once you use this feature, you can't use it again until you finish a Short or Long Rest."],
    feature_specific: {
      recharge: "short_or_long_rest",
      effect: "turn_failed_d20_test_into_20"
    },
    url: "/assets/atlas/features/json/stroke_of_luck_2024.json"
  },
  {
    index: "epic_boon_rogue_2024",
    name: "Epic Boon",
    class: rogueRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_rogue_2024.json"
  },

  // --- BARBARIAN 2024 FEATURES ---
  {
    index: "rage_2024",
    name: "Rage",
    class: barbarianRef,
    level: 1,
    desc: ["In battle, you fight with primal ferocity. As a Bonus Action, enter a Rage. While raging, you gain Advantage on Strength checks and saves, extra rage damage on Strength weapon attacks (+2 at L1, scaling to +4), and resistance to Bludgeoning, Piercing, and Slashing damage. Maintain by attacking, forcing a save, or taking a Bonus Action to extend. Uses: 2 at L1, scaling to 6 at L17. Regain 1 on Short Rest, all on Long Rest."],
    feature_specific: { uses_at_level_1: 2, recharge: "short_rest_1_all_long_rest" },
    url: "/assets/atlas/features/json/rage_2024.json"
  },
  {
    index: "unarmored_defense_barbarian_2024",
    name: "Unarmored Defense",
    class: barbarianRef,
    level: 1,
    desc: ["While you are wearing no armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit."],
    url: "/assets/atlas/features/json/unarmored_defense_barbarian_2024.json"
  },
  {
    index: "weapon_mastery_barbarian_2024",
    name: "Weapon Mastery",
    class: barbarianRef,
    level: 1,
    desc: ["Your training with weapons allows you to use the mastery properties of two martial or simple melee weapons of your choice."],
    feature_specific: { mastery_count: 2 },
    url: "/assets/atlas/features/json/weapon_mastery_barbarian_2024.json"
  },
  {
    index: "reckless_attack_2024",
    name: "Reckless Attack",
    class: barbarianRef,
    level: 2,
    desc: ["When you make your first attack on your turn, you can throw away all concern for defense to attack recklessly. Doing so gives you Advantage on Strength attack rolls during this turn, but attack rolls against you have Advantage until your next turn."],
    url: "/assets/atlas/features/json/reckless_attack_2024.json"
  },
  {
    index: "danger_sense_2024",
    name: "Danger Sense",
    class: barbarianRef,
    level: 2,
    desc: ["You gain an uncanny sense of when things nearby aren't as they should be, giving you Advantage on Dexterity saving throws against effects that you can see."],
    url: "/assets/atlas/features/json/danger_sense_2024.json"
  },
  {
    index: "barbarian_subclass_2024",
    name: "Barbarian Subclass",
    class: barbarianRef,
    level: 3,
    desc: ["You choose a Barbarian subclass (Path of the Berserker, Path of the Wild Heart, Path of the Zealot, or Path of the World Tree) that grants features at levels 3, 6, 10, and 14."],
    url: "/assets/atlas/features/json/barbarian_subclass_2024.json"
  },
  {
    index: "primal_knowledge_2024",
    name: "Primal Knowledge",
    class: barbarianRef,
    level: 3,
    desc: ["You gain proficiency in one skill of your choice from the Barbarian skill list. In addition, while raging, you can use your Strength modifier for Acrobatics, Intimidation, Perception, Stealth, or Survival checks."],
    url: "/assets/atlas/features/json/primal_knowledge_2024.json"
  },
  {
    index: "extra_attack_barbarian_2024",
    name: "Extra Attack",
    class: barbarianRef,
    level: 5,
    desc: ["You can attack twice, instead of once, whenever you take the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_barbarian_2024.json"
  },
  {
    index: "fast_movement_2024",
    name: "Fast Movement",
    class: barbarianRef,
    level: 5,
    desc: ["Your speed increases by 10 feet while you aren't wearing Heavy Armor."],
    url: "/assets/atlas/features/json/fast_movement_2024.json"
  },
  {
    index: "feral_instinct_2024",
    name: "Feral Instinct",
    class: barbarianRef,
    level: 7,
    desc: ["Your instincts are so honed that you have Advantage on Initiative rolls."],
    url: "/assets/atlas/features/json/feral_instinct_2024.json"
  },
  {
    index: "instinctive_pounce_2024",
    name: "Instinctive Pounce",
    class: barbarianRef,
    level: 7,
    desc: ["As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed."],
    url: "/assets/atlas/features/json/instinctive_pounce_2024.json"
  },
  {
    index: "brutal_strike_2024",
    name: "Brutal Strike",
    class: barbarianRef,
    level: 9,
    desc: ["If you use Reckless Attack, you can forgo Advantage on one attack roll to deal an extra 1d10 damage and apply a Brutal Strike effect (Forceful Blow or Hamstring Blow)."],
    feature_specific: { dice: "1d10" },
    url: "/assets/atlas/features/json/brutal_strike_2024.json"
  },
  {
    index: "relentless_rage_2024",
    name: "Relentless Rage",
    class: barbarianRef,
    level: 11,
    desc: ["If you drop to 0 Hit Points while raging, you can make a DC 10 Constitution saving throw. On a success, you drop to 1 Hit Point instead. Each time you use this feature after the first, the DC increases by 5."],
    url: "/assets/atlas/features/json/relentless_rage_2024.json"
  },
  {
    index: "improved_brutal_strike_2024",
    name: "Improved Brutal Strike",
    class: barbarianRef,
    level: 13,
    desc: ["Your Brutal Strike extra damage increases to 2d10, and you gain two new Brutal Strike options: Staggering Blow and Sundering Blow."],
    feature_specific: { dice: "2d10" },
    url: "/assets/atlas/features/json/improved_brutal_strike_2024.json"
  },
  {
    index: "persistent_rage_2024",
    name: "Persistent Rage",
    class: barbarianRef,
    level: 15,
    desc: ["Your Rage lasts for 10 minutes without requiring you to attack or take damage to maintain it. Once per Long Rest, when you roll Initiative and have no Rage uses remaining, you regain all expended uses."],
    url: "/assets/atlas/features/json/persistent_rage_2024.json"
  },
  {
    index: "improved_brutal_strike_2_2024",
    name: "Improved Brutal Strike (2)",
    class: barbarianRef,
    level: 17,
    desc: ["You can apply up to two different Brutal Strike effects when you hit with a Brutal Strike."],
    url: "/assets/atlas/features/json/improved_brutal_strike_2_2024.json"
  },
  {
    index: "indomitable_might_2024",
    name: "Indomitable Might",
    class: barbarianRef,
    level: 18,
    desc: ["If your total for a Strength check is less than your Strength score, you can use that score in place of the total."],
    url: "/assets/atlas/features/json/indomitable_might_2024.json"
  },
  {
    index: "epic_boon_barbarian_2024",
    name: "Epic Boon",
    class: barbarianRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_barbarian_2024.json"
  },
  {
    index: "primal_champion_2024",
    name: "Primal Champion",
    class: barbarianRef,
    level: 20,
    desc: ["Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 25."],
    url: "/assets/atlas/features/json/primal_champion_2024.json"
  },

  // --- BARD 2024 FEATURES ---
  {
    index: "spellcasting_bard_2024",
    name: "Spellcasting: Bard",
    class: bardRef,
    level: 1,
    desc: ["You can cast Bard spells using Charisma as your spellcasting ability. You prepare Bard spells from the Bard spell list."],
    url: "/assets/atlas/features/json/spellcasting_bard_2024.json"
  },
  {
    index: "bardic_inspiration_2024",
    name: "Bardic Inspiration",
    class: bardRef,
    level: 1,
    desc: ["As a Bonus Action, give a Bardic Inspiration die (d6 at L1, scaling to d12) to a creature within 60ft. It can add the die to a d20 Test or use it to regain Hit Points. Uses equal your Charisma modifier (minimum 1). Regain on Long Rest; at L5 regain on Short or Long Rest."],
    feature_specific: { die: "d6" },
    url: "/assets/atlas/features/json/bardic_inspiration_2024.json"
  },
  {
    index: "jack_of_all_trades_2024",
    name: "Jack of All Trades",
    class: bardRef,
    level: 2,
    desc: ["You can add half your Proficiency Bonus, rounded down, to any ability check you make that doesn't already include your Proficiency Bonus."],
    url: "/assets/atlas/features/json/jack_of_all_trades_2024.json"
  },
  {
    index: "expertise_bard_2024",
    name: "Expertise",
    class: bardRef,
    level: 2,
    desc: ["Choose two of your skill proficiencies. You gain Expertise in those skills."],
    url: "/assets/atlas/features/json/expertise_bard_2024.json"
  },
  {
    index: "bard_subclass_2024",
    name: "Bard Subclass",
    class: bardRef,
    level: 3,
    desc: ["You gain a Bard subclass of your choice (College of Dance, College of Glamour, College of Lore, or College of Valor)."],
    url: "/assets/atlas/features/json/bard_subclass_2024.json"
  },
  {
    index: "font_of_inspiration_2024",
    name: "Font of Inspiration",
    class: bardRef,
    level: 5,
    desc: ["You regain all of your expended uses of Bardic Inspiration when you finish a Short or Long Rest. In addition, you can expend 1 Bardic Inspiration use to cast a level 1 spell slot if you are out of level 1 slots."],
    url: "/assets/atlas/features/json/font_of_inspiration_2024.json"
  },
  {
    index: "bardic_inspiration_d8_2024",
    name: "Bardic Inspiration (d8)",
    class: bardRef,
    level: 5,
    desc: ["Your Bardic Inspiration die becomes a d8."],
    feature_specific: { die: "d8" },
    url: "/assets/atlas/features/json/bardic_inspiration_d8_2024.json"
  },
  {
    index: "countercharm_2024",
    name: "Countercharm",
    class: bardRef,
    level: 6,
    desc: ["As a Reaction when you or a creature within 30 feet fails a save against Charmed or Frightened, you can force the save to be rerolled with Advantage."],
    url: "/assets/atlas/features/json/countercharm_2024.json"
  },
  {
    index: "expertise_bard_2_2024",
    name: "Expertise (Level 7)",
    class: bardRef,
    level: 7,
    desc: ["Choose two more of your skill proficiencies to gain Expertise."],
    url: "/assets/atlas/features/json/expertise_bard_2_2024.json"
  },
  {
    index: "bardic_inspiration_d10_2024",
    name: "Bardic Inspiration (d10)",
    class: bardRef,
    level: 9,
    desc: ["Your Bardic Inspiration die becomes a d10."],
    feature_specific: { die: "d10" },
    url: "/assets/atlas/features/json/bardic_inspiration_d10_2024.json"
  },
  {
    index: "magical_secrets_2024",
    name: "Magical Secrets",
    class: bardRef,
    level: 10,
    desc: ["You learn spells from the Cleric, Druid, or Wizard spell lists in addition to Bard spells. Whenever you gain a Bard level, you can replace a prepared spell with a spell from those lists."],
    url: "/assets/atlas/features/json/magical_secrets_2024.json"
  },
  {
    index: "bardic_inspiration_d12_2024",
    name: "Bardic Inspiration (d12)",
    class: bardRef,
    level: 15,
    desc: ["Your Bardic Inspiration die becomes a d12."],
    feature_specific: { die: "d12" },
    url: "/assets/atlas/features/json/bardic_inspiration_d12_2024.json"
  },
  {
    index: "superior_inspiration_2024",
    name: "Superior Inspiration",
    class: bardRef,
    level: 18,
    desc: ["When you roll Initiative and have fewer than two uses of Bardic Inspiration remaining, you regain uses up to two."],
    url: "/assets/atlas/features/json/superior_inspiration_2024.json"
  },
  {
    index: "epic_boon_bard_2024",
    name: "Epic Boon",
    class: bardRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_bard_2024.json"
  },
  {
    index: "words_of_creation_2024",
    name: "Words of Creation",
    class: bardRef,
    level: 20,
    desc: ["You always have Power Word Heal and Power Word Kill prepared. You can cast each once per Long Rest without expending a spell slot, and when you do, you can target two creatures instead of one."],
    url: "/assets/atlas/features/json/words_of_creation_2024.json"
  },

  // --- DRUID 2024 FEATURES ---
  {
    index: "spellcasting_druid_2024",
    name: "Spellcasting: Druid",
    class: druidRef,
    level: 1,
    desc: ["You can cast Druid spells using Wisdom as your spellcasting ability. You prepare Druid spells from the Druid spell list."],
    url: "/assets/atlas/features/json/spellcasting_druid_2024.json"
  },
  {
    index: "primal_order_2024",
    name: "Primal Order",
    class: druidRef,
    level: 1,
    desc: ["Dedicated to a sacred role: Magician (extra cantrip & Arcana/Nature check bonus equal to WIS mod) or Warden (Martial weapon & Medium Armor proficiency)."],
    url: "/assets/atlas/features/json/primal_order_2024.json"
  },
  {
    index: "druidic_2024",
    name: "Druidic",
    class: druidRef,
    level: 1,
    desc: ["You know Druidic, the secret language of Druids. You also learn one additional language of your choice."],
    url: "/assets/atlas/features/json/druidic_2024.json"
  },
  {
    index: "wild_shape_2024",
    name: "Wild Shape",
    class: druidRef,
    level: 2,
    desc: ["As a Bonus Action, magically assume the shape of a Beast you have seen. Max CR: 1/4 at L2, 1/2 at L4, 1 at L8. Uses: 2 per Short or Long Rest. Gain Temp HP equal to 2x Druid level."],
    feature_specific: { uses: 2, recharge: "short_or_long_rest" },
    url: "/assets/atlas/features/json/wild_shape_2024.json"
  },
  {
    index: "wild_companion_2024",
    name: "Wild Companion",
    class: druidRef,
    level: 2,
    desc: ["You can expend a use of Wild Shape to cast Find Familiar without material components."],
    url: "/assets/atlas/features/json/wild_companion_2024.json"
  },
  {
    index: "druid_subclass_2024",
    name: "Druid Subclass",
    class: druidRef,
    level: 3,
    desc: ["Choose a Druid subclass (Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars)."],
    url: "/assets/atlas/features/json/druid_subclass_2024.json"
  },
  {
    index: "wild_resurgence_2024",
    name: "Wild Resurgence",
    class: druidRef,
    level: 5,
    desc: ["You can expend a spell slot of 1st level or higher to regain 1 use of Wild Shape, or expend 1 Wild Shape use to gain a 1st-level spell slot."],
    url: "/assets/atlas/features/json/wild_resurgence_2024.json"
  },
  {
    index: "elemental_fury_2024",
    name: "Elemental Fury",
    class: druidRef,
    level: 7,
    desc: ["Choose Potent Spellcasting (add WIS mod to cantrip damage) or Primal Strike (once per turn, deal extra 1d8 Cold, Fire, Lightning, or Thunder damage on weapon/Wild Shape hit)."],
    url: "/assets/atlas/features/json/elemental_fury_2024.json"
  },
  {
    index: "improved_elemental_fury_2024",
    name: "Improved Elemental Fury",
    class: druidRef,
    level: 15,
    desc: ["Your Elemental Fury option improves: Primal Strike damage increases to 2d8, or Potent Spellcasting range increases by 30 feet."],
    url: "/assets/atlas/features/json/improved_elemental_fury_2024.json"
  },
  {
    index: "beast_spells_2024",
    name: "Beast Spells",
    class: druidRef,
    level: 18,
    desc: ["You can cast spells in Beast form, provided the spells don't require material components with a gold cost or that are consumed."],
    url: "/assets/atlas/features/json/beast_spells_2024.json"
  },
  {
    index: "epic_boon_druid_2024",
    name: "Epic Boon",
    class: druidRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_druid_2024.json"
  },
  {
    index: "archdruid_2024",
    name: "Archdruid",
    class: druidRef,
    level: 20,
    desc: ["When you roll Initiative and have no uses of Wild Shape left, you regain 1 use. For every 10 years that pass, your body ages only 1 year. You can cast spells in Wild Shape ignoring Verbal and Somatic components."],
    url: "/assets/atlas/features/json/archdruid_2024.json"
  },

  // --- MONK 2024 FEATURES ---
  {
    index: "martial_arts_2024",
    name: "Martial Arts",
    class: monkRef,
    level: 1,
    desc: ["Martial Arts die: 1d6 at L1, 1d8 at L5, 1d10 at L11, 1d12 at L17. Use DEX for Monk weapon/Unarmed Strike attack/damage rolls. Make an Unarmed Strike as a Bonus Action."],
    feature_specific: { die: "1d6" },
    url: "/assets/atlas/features/json/martial_arts_2024.json"
  },
  {
    index: "unarmored_defense_monk_2024",
    name: "Unarmored Defense",
    class: monkRef,
    level: 1,
    desc: ["While wearing no armor and not wielding a shield, your AC equals 10 + Dexterity modifier + Wisdom modifier."],
    url: "/assets/atlas/features/json/unarmored_defense_monk_2024.json"
  },
  {
    index: "monk_focus_2024",
    name: "Monk Focus",
    class: monkRef,
    level: 2,
    desc: ["Focus Points equal your Monk level. Regain all on Short or Long Rest. Spend 1 Focus Point for Flurry of Blows (2 Unarmed Strikes as Bonus Action), Patient Defense (Disengage as Bonus Action, or spend 1 Focus Point for Dodge + Temp HP), or Step of the Wind (Dash + Disengage as Bonus Action)."],
    url: "/assets/atlas/features/json/monk_focus_2024.json"
  },
  {
    index: "unarmored_movement_monk_2024",
    name: "Unarmored Movement",
    class: monkRef,
    level: 2,
    desc: ["Your Speed increases by 10 feet while not wearing armor or wielding a shield. Increases at levels 6 (+15ft), 10 (+20ft), 14 (+25ft), and 18 (+30ft)."],
    url: "/assets/atlas/features/json/unarmored_movement_monk_2024.json"
  },
  {
    index: "uncanny_metabolism_2024",
    name: "Uncanny Metabolism",
    class: monkRef,
    level: 2,
    desc: ["When you roll Initiative, you can regain all your Focus Points and regain HP equal to 1 Martial Arts die + Monk level. Once per Long Rest."],
    url: "/assets/atlas/features/json/uncanny_metabolism_2024.json"
  },
  {
    index: "monk_subclass_2024",
    name: "Monk Subclass",
    class: monkRef,
    level: 3,
    desc: ["Choose a Monk subclass (Warrior of Mercy, Warrior of Shadow, Warrior of the Elements, or Warrior of Open Hand)."],
    url: "/assets/atlas/features/json/monk_subclass_2024.json"
  },
  {
    index: "deflect_attacks_2024",
    name: "Deflect Attacks",
    class: monkRef,
    level: 3,
    desc: ["As a Reaction when hit by a melee/ranged attack, reduce damage by 1d10 + DEX + Monk level. If reduced to 0, spend 1 Focus Point to deflect the attack dealing 2 Martial Arts dice + DEX damage to a creature within 60 feet."],
    url: "/assets/atlas/features/json/deflect_attacks_2024.json"
  },
  {
    index: "slow_fall_2024",
    name: "Slow Fall",
    class: monkRef,
    level: 4,
    desc: ["You can use your Reaction when you fall to reduce falling damage by 5 times your Monk level."],
    url: "/assets/atlas/features/json/slow_fall_2024.json"
  },
  {
    index: "extra_attack_monk_2024",
    name: "Extra Attack",
    class: monkRef,
    level: 5,
    desc: ["You can attack twice, instead of once, whenever you take the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_monk_2024.json"
  },
  {
    index: "stunning_strike_2024",
    name: "Stunning Strike",
    class: monkRef,
    level: 5,
    desc: ["When hitting a creature with a Monk weapon/Unarmed Strike, spend 1 Focus Point. Target makes CON save vs Monk DC. On fail, Stunned until start of your next turn. On success, Speed halved and next attack against it has Advantage."],
    url: "/assets/atlas/features/json/stunning_strike_2024.json"
  },
  {
    index: "empowered_strikes_2024",
    name: "Empowered Strikes",
    class: monkRef,
    level: 6,
    desc: ["Your Unarmed Strikes can deal Force damage instead of physical damage."],
    url: "/assets/atlas/features/json/empowered_strikes_2024.json"
  },
  {
    index: "evasion_monk_2024",
    name: "Evasion",
    class: monkRef,
    level: 7,
    desc: ["DEX save for half damage -> take no damage on success, half on fail."],
    url: "/assets/atlas/features/json/evasion_monk_2024.json"
  },
  {
    index: "heightened_focus_2024",
    name: "Heightened Focus",
    class: monkRef,
    level: 7,
    desc: ["Flurry of Blows gives 3 strikes; Patient Defense gives Temp HP = 2 Martial Arts dice; Step of the Wind lets you carry a willing creature."],
    url: "/assets/atlas/features/json/heightened_focus_2024.json"
  },
  {
    index: "acrobatic_movement_2024",
    name: "Acrobatic Movement",
    class: monkRef,
    level: 9,
    desc: ["You can move along vertical surfaces and across liquids on your turn without falling."],
    url: "/assets/atlas/features/json/acrobatic_movement_2024.json"
  },
  {
    index: "self_restoration_2024",
    name: "Self-Restoration",
    class: monkRef,
    level: 10,
    desc: ["At the start of your turn, end Charmed, Frightened, or Poisoned condition. You no longer need food or water."],
    url: "/assets/atlas/features/json/self_restoration_2024.json"
  },
  {
    index: "deflect_energy_2024",
    name: "Deflect Energy",
    class: monkRef,
    level: 13,
    desc: ["Deflect Attacks now works against attack rolls of any damage type, not just Bludgeoning, Piercing, or Slashing."],
    url: "/assets/atlas/features/json/deflect_energy_2024.json"
  },
  {
    index: "disciplined_survivor_2024",
    name: "Disciplined Survivor",
    class: monkRef,
    level: 14,
    desc: ["Gain proficiency in all saving throws. If you fail a saving throw, spend 1 Focus Point to reroll."],
    url: "/assets/atlas/features/json/disciplined_survivor_2024.json"
  },
  {
    index: "perfect_focus_2024",
    name: "Perfect Focus",
    class: monkRef,
    level: 15,
    desc: ["When you roll Initiative and have fewer than 4 Focus Points, you regain Focus Points up to 4."],
    url: "/assets/atlas/features/json/perfect_focus_2024.json"
  },
  {
    index: "empty_body_2024",
    name: "Empty Body",
    class: monkRef,
    level: 18,
    desc: ["As a Bonus Action, spend 3 Focus Points for Invisibility and resistance to all damage except Force for 1 minute."],
    url: "/assets/atlas/features/json/empty_body_2024.json"
  },
  {
    index: "epic_boon_monk_2024",
    name: "Epic Boon",
    class: monkRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_monk_2024.json"
  },
  {
    index: "body_and_mind_2024",
    name: "Body and Mind",
    class: monkRef,
    level: 20,
    desc: ["Your Dexterity and Wisdom scores increase by 4. Your maximum for those scores is now 25."],
    url: "/assets/atlas/features/json/body_and_mind_2024.json"
  },

  // --- PALADIN 2024 FEATURES ---
  {
    index: "lay_on_hands_2024",
    name: "Lay on Hands",
    class: paladinRef,
    level: 1,
    desc: ["Pool of healing = 5x Paladin level. As a Bonus Action, touch a creature to restore HP or spend 5 points to cure Poisoned condition."],
    feature_specific: { pool: "5_x_paladin_level" },
    url: "/assets/atlas/features/json/lay_on_hands_2024.json"
  },
  {
    index: "spellcasting_paladin_2024",
    name: "Spellcasting: Paladin",
    class: paladinRef,
    level: 1,
    desc: ["You cast Paladin spells using Charisma as your spellcasting ability. Prepare spells from Paladin spell list."],
    url: "/assets/atlas/features/json/spellcasting_paladin_2024.json"
  },
  {
    index: "weapon_mastery_paladin_2024",
    name: "Weapon Mastery",
    class: paladinRef,
    level: 1,
    desc: ["Mastery properties of two simple or martial weapons of your choice."],
    feature_specific: { mastery_count: 2 },
    url: "/assets/atlas/features/json/weapon_mastery_paladin_2024.json"
  },
  {
    index: "paladin_smite_2024",
    name: "Paladin Smite",
    class: paladinRef,
    level: 2,
    desc: ["As a Bonus Action when hitting a creature with melee weapon/Unarmed Strike, cast Divine Smite or a Smite spell using a spell slot. Deal 2d8 Radiant damage + 1d8 per slot level above 1st, +1d8 vs Fiends/Undead."],
    url: "/assets/atlas/features/json/paladin_smite_2024.json"
  },
  {
    index: "fighting_style_paladin_2024",
    name: "Fighting Style",
    class: paladinRef,
    level: 2,
    desc: ["Gain a Fighting Style feat of your choice."],
    url: "/assets/atlas/features/json/fighting_style_paladin_2024.json"
  },
  {
    index: "paladin_subclass_2024",
    name: "Paladin Subclass",
    class: paladinRef,
    level: 3,
    desc: ["Choose a Paladin subclass (Oath of Devotion, Oath of Glory, Oath of Ancients, or Oath of Vengeance)."],
    url: "/assets/atlas/features/json/paladin_subclass_2024.json"
  },
  {
    index: "channel_divinity_paladin_2024",
    name: "Channel Divinity",
    class: paladinRef,
    level: 3,
    desc: ["1 charge per Short or Long Rest. Use Divine Sense as a Bonus Action or fuel subclass options."],
    feature_specific: { uses: 1, recharge: "short_or_long_rest" },
    url: "/assets/atlas/features/json/channel_divinity_paladin_2024.json"
  },
  {
    index: "extra_attack_paladin_2024",
    name: "Extra Attack",
    class: paladinRef,
    level: 5,
    desc: ["Attack twice whenever taking the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_paladin_2024.json"
  },
  {
    index: "faithful_steed_2024",
    name: "Faithful Steed",
    class: paladinRef,
    level: 5,
    desc: ["Always have Find Steed prepared. Cast it once per Long Rest without expending a spell slot."],
    url: "/assets/atlas/features/json/faithful_steed_2024.json"
  },
  {
    index: "aura_of_protection_2024",
    name: "Aura of Protection",
    class: paladinRef,
    level: 6,
    desc: ["You and allies within 10 feet add Charisma modifier to all saving throws while conscious."],
    url: "/assets/atlas/features/json/aura_of_protection_2024.json"
  },
  {
    index: "abjure_foes_2024",
    name: "Abjure Foes",
    class: paladinRef,
    level: 9,
    desc: ["As a Magic action, spend Channel Divinity charge. Up to CHA mod creatures within 60ft make WIS save. On fail, Frightened & Speed 0."],
    url: "/assets/atlas/features/json/abjure_foes_2024.json"
  },
  {
    index: "radiant_strikes_2024",
    name: "Radiant Strikes",
    class: paladinRef,
    level: 11,
    desc: ["All melee weapon and Unarmed Strike hits deal an extra 1d8 Radiant damage."],
    feature_specific: { extra_damage: "1d8_radiant" },
    url: "/assets/atlas/features/json/radiant_strikes_2024.json"
  },
  {
    index: "restoring_touch_2024",
    name: "Restoring Touch",
    class: paladinRef,
    level: 14,
    desc: ["Expending 5 points of Lay on Hands can remove Charmed, Frightened, or Stunned conditions."],
    url: "/assets/atlas/features/json/restoring_touch_2024.json"
  },
  {
    index: "aura_expansion_2024",
    name: "Aura Expansion",
    class: paladinRef,
    level: 18,
    desc: ["Aura of Protection range expands to 30 feet."],
    url: "/assets/atlas/features/json/aura_expansion_2024.json"
  },
  {
    index: "epic_boon_paladin_2024",
    name: "Epic Boon",
    class: paladinRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_paladin_2024.json"
  },

  // --- RANGER 2024 FEATURES ---
  {
    index: "spellcasting_ranger_2024",
    name: "Spellcasting: Ranger",
    class: rangerRef,
    level: 1,
    desc: ["Cast Ranger spells using Wisdom as spellcasting ability."],
    url: "/assets/atlas/features/json/spellcasting_ranger_2024.json"
  },
  {
    index: "favored_enemy_2024",
    name: "Favored Enemy",
    class: rangerRef,
    level: 1,
    desc: ["Always have Hunter's Mark prepared. Cast it without a spell slot 2 times at L1, scaling up to 6 times at L17. Regain uses on Long Rest."],
    feature_specific: { uses_at_level_1: 2 },
    url: "/assets/atlas/features/json/favored_enemy_2024.json"
  },
  {
    index: "weapon_mastery_ranger_2024",
    name: "Weapon Mastery",
    class: rangerRef,
    level: 1,
    desc: ["Mastery properties of two simple or martial weapons of your choice."],
    feature_specific: { mastery_count: 2 },
    url: "/assets/atlas/features/json/weapon_mastery_ranger_2024.json"
  },
  {
    index: "deft_explorer_2024",
    name: "Deft Explorer",
    class: rangerRef,
    level: 2,
    desc: ["Gain Expertise in 1 skill proficiency, speak 2 extra languages."],
    url: "/assets/atlas/features/json/deft_explorer_2024.json"
  },
  {
    index: "fighting_style_ranger_2024",
    name: "Fighting Style",
    class: rangerRef,
    level: 2,
    desc: ["Gain a Fighting Style feat of your choice."],
    url: "/assets/atlas/features/json/fighting_style_ranger_2024.json"
  },
  {
    index: "ranger_subclass_2024",
    name: "Ranger Subclass",
    class: rangerRef,
    level: 3,
    desc: ["Choose a Ranger subclass (Beast Master, Fey Wanderer, Hunter, or Gloom Stalker)."],
    url: "/assets/atlas/features/json/ranger_subclass_2024.json"
  },
  {
    index: "extra_attack_ranger_2024",
    name: "Extra Attack",
    class: rangerRef,
    level: 5,
    desc: ["Attack twice whenever taking the Attack action on your turn."],
    url: "/assets/atlas/features/json/extra_attack_ranger_2024.json"
  },
  {
    index: "roving_2024",
    name: "Roving",
    class: rangerRef,
    level: 6,
    desc: ["+10ft Speed while not in heavy armor; gain Climbing and Swimming speed equal to Speed."],
    url: "/assets/atlas/features/json/roving_2024.json"
  },
  {
    index: "expertise_ranger_2_2024",
    name: "Expertise (Level 9)",
    class: rangerRef,
    level: 9,
    desc: ["Expertise in 2 additional skill proficiencies."],
    url: "/assets/atlas/features/json/expertise_ranger_2_2024.json"
  },
  {
    index: "tireless_2024",
    name: "Tireless",
    class: rangerRef,
    level: 10,
    desc: ["As Action, gain 1d8 + WIS Temp HP WIS mod times per LR. Reduce Exhaustion level by 1 on Short Rest."],
    url: "/assets/atlas/features/json/tireless_2024.json"
  },
  {
    index: "relentless_hunter_2024",
    name: "Relentless Hunter",
    class: rangerRef,
    level: 13,
    desc: ["Taking damage cannot break your Concentration on Hunter's Mark."],
    url: "/assets/atlas/features/json/relentless_hunter_2024.json"
  },
  {
    index: "nature_veil_2024",
    name: "Nature's Veil",
    class: rangerRef,
    level: 14,
    desc: ["As Bonus Action, become Invisible until end of your next turn WIS mod times per LR."],
    url: "/assets/atlas/features/json/nature_veil_2024.json"
  },
  {
    index: "precise_hunter_2024",
    name: "Precise Hunter",
    class: rangerRef,
    level: 17,
    desc: ["Advantage on attack rolls against target of your Hunter's Mark."],
    url: "/assets/atlas/features/json/precise_hunter_2024.json"
  },
  {
    index: "epic_boon_ranger_2024",
    name: "Epic Boon",
    class: rangerRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_ranger_2024.json"
  },
  {
    index: "foe_slayer_2024",
    name: "Foe Slayer",
    class: rangerRef,
    level: 20,
    desc: ["Hunter's Mark extra damage die increases from 1d6 to 1d10."],
    feature_specific: { mark_damage_die: "1d10" },
    url: "/assets/atlas/features/json/foe_slayer_2024.json"
  },

  // --- SORCERER 2024 FEATURES ---
  {
    index: "spellcasting_sorcerer_2024",
    name: "Spellcasting: Sorcerer",
    class: sorcererRef,
    level: 1,
    desc: ["Cast Sorcerer spells using Charisma as spellcasting ability."],
    url: "/assets/atlas/features/json/spellcasting_sorcerer_2024.json"
  },
  {
    index: "innate_sorcery_2024",
    name: "Innate Sorcery",
    class: sorcererRef,
    level: 1,
    desc: ["As Bonus Action, activate Innate Sorcery for 1 minute: spell save DC +1, Advantage on Sorcerer spell attack rolls. 2 uses per Long Rest."],
    feature_specific: { uses: 2, recharge: "long_rest" },
    url: "/assets/atlas/features/json/innate_sorcery_2024.json"
  },
  {
    index: "font_of_magic_2024",
    name: "Font of Magic",
    class: sorcererRef,
    level: 2,
    desc: ["Sorcery Points equal Sorcerer level. Convert Sorcery Points to spell slots and vice versa."],
    url: "/assets/atlas/features/json/font_of_magic_2024.json"
  },
  {
    index: "metamagic_2024",
    name: "Metamagic",
    class: sorcererRef,
    level: 2,
    desc: ["Gain 2 Metamagic options to alter spells (Careful, Distant, Empowered, Extended, Heightened, Quickened, Seeking, Subtle, Twinned)."],
    url: "/assets/atlas/features/json/metamagic_2024.json"
  },
  {
    index: "sorcerer_subclass_2024",
    name: "Sorcerer Subclass",
    class: sorcererRef,
    level: 3,
    desc: ["Choose a Sorcerer subclass (Aberrant Sorcery, Clockwork Sorcery, Draconic Sorcery, or Wild Magic Sorcery)."],
    url: "/assets/atlas/features/json/sorcerer_subclass_2024.json"
  },
  {
    index: "sorcerous_restoration_2024",
    name: "Sorcerous Restoration",
    class: sorcererRef,
    level: 5,
    desc: ["When you finish a Short Rest with 0 Sorcery Points, regain Sorcery Points equal to half your Sorcerer level."],
    url: "/assets/atlas/features/json/sorcerous_restoration_2024.json"
  },
  {
    index: "metamagic_options_2_2024",
    name: "Metamagic Options (Level 7)",
    class: sorcererRef,
    level: 7,
    desc: ["Gain 2 additional Metamagic options."],
    url: "/assets/atlas/features/json/metamagic_options_2_2024.json"
  },
  {
    index: "metamagic_options_3_2024",
    name: "Metamagic Options (Level 13)",
    class: sorcererRef,
    level: 13,
    desc: ["Gain 2 additional Metamagic options."],
    url: "/assets/atlas/features/json/metamagic_options_3_2024.json"
  },
  {
    index: "metamagic_options_4_2024",
    name: "Metamagic Options (Level 17)",
    class: sorcererRef,
    level: 17,
    desc: ["Gain 2 additional Metamagic options."],
    url: "/assets/atlas/features/json/metamagic_options_4_2024.json"
  },
  {
    index: "epic_boon_sorcerer_2024",
    name: "Epic Boon",
    class: sorcererRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_sorcerer_2024.json"
  },
  {
    index: "arcane_apotheosis_2024",
    name: "Arcane Apotheosis",
    class: sorcererRef,
    level: 20,
    desc: ["While Innate Sorcery is active, use 1 Metamagic option per turn without expending Sorcery Points."],
    url: "/assets/atlas/features/json/arcane_apotheosis_2024.json"
  },

  // --- WARLOCK 2024 FEATURES ---
  {
    index: "pact_spells_warlock_2024",
    name: "Pact Spells",
    class: warlockRef,
    level: 1,
    desc: ["Cast Warlock spells using Pact Slots. All slots same level, regain on Short or Long Rest. Charisma is spellcasting ability."],
    url: "/assets/atlas/features/json/pact_spells_warlock_2024.json"
  },
  {
    index: "eldritch_invocations_2024",
    name: "Eldritch Invocations",
    class: warlockRef,
    level: 1,
    desc: ["Inbued with eldritch magic. Gain Invocations starting at L1 (Pact of Blade, Pact of Chain, Pact of Tome, Agonizing Blast, etc.). Total: 1 at L1, 2 at L2, scaling to 8 at L18."],
    feature_specific: { invocations_at_level_1: 1 },
    url: "/assets/atlas/features/json/eldritch_invocations_2024.json"
  },
  {
    index: "magical_cunning_2024",
    name: "Magical Cunning",
    class: warlockRef,
    level: 2,
    desc: ["As a 1-minute ritual, regain half your Pact Slots once per Long Rest."],
    url: "/assets/atlas/features/json/magical_cunning_2024.json"
  },
  {
    index: "warlock_subclass_2024",
    name: "Warlock Subclass",
    class: warlockRef,
    level: 3,
    desc: ["Choose a Warlock patron subclass (Archfey, Fiend, Great Old One, or Celestial)."],
    url: "/assets/atlas/features/json/warlock_subclass_2024.json"
  },
  {
    index: "mystic_arcanum_11_2024",
    name: "Mystic Arcanum (6th Level)",
    class: warlockRef,
    level: 11,
    desc: ["Choose one 6th-level Warlock spell as Arcanum. Cast once per Long Rest without spell slot."],
    url: "/assets/atlas/features/json/mystic_arcanum_11_2024.json"
  },
  {
    index: "mystic_arcanum_13_2024",
    name: "Mystic Arcanum (7th Level)",
    class: warlockRef,
    level: 13,
    desc: ["Choose one 7th-level Warlock spell as Arcanum. Cast once per Long Rest without spell slot."],
    url: "/assets/atlas/features/json/mystic_arcanum_13_2024.json"
  },
  {
    index: "mystic_arcanum_15_2024",
    name: "Mystic Arcanum (8th Level)",
    class: warlockRef,
    level: 15,
    desc: ["Choose one 8th-level Warlock spell as Arcanum. Cast once per Long Rest without spell slot."],
    url: "/assets/atlas/features/json/mystic_arcanum_15_2024.json"
  },
  {
    index: "mystic_arcanum_17_2024",
    name: "Mystic Arcanum (9th Level)",
    class: warlockRef,
    level: 17,
    desc: ["Choose one 9th-level Warlock spell as Arcanum. Cast once per Long Rest without spell slot."],
    url: "/assets/atlas/features/json/mystic_arcanum_17_2024.json"
  },
  {
    index: "epic_boon_warlock_2024",
    name: "Epic Boon",
    class: warlockRef,
    level: 19,
    desc: ["You gain an Epic Boon feat of your choice or another feat for which you qualify."],
    url: "/assets/atlas/features/json/epic_boon_warlock_2024.json"
  },
  {
    index: "eldritch_master_2024",
    name: "Eldritch Master",
    class: warlockRef,
    level: 20,
    desc: ["When using Magical Cunning, you regain ALL your expended Pact Slots instead of half."],
    url: "/assets/atlas/features/json/eldritch_master_2024.json"
  },

  // --- ASI FEAT PLACEHOLDERS 2024 FOR NEW 8 CLASSES ---
  {
    index: "barbarian_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: barbarianRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/barbarian_ability_score_improvement_1_2024.json"
  },
  {
    index: "barbarian_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: barbarianRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/barbarian_ability_score_improvement_2_2024.json"
  },
  {
    index: "barbarian_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: barbarianRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/barbarian_ability_score_improvement_3_2024.json"
  },
  {
    index: "barbarian_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: barbarianRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/barbarian_ability_score_improvement_4_2024.json"
  },

  {
    index: "bard_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: bardRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/bard_ability_score_improvement_1_2024.json"
  },
  {
    index: "bard_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: bardRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/bard_ability_score_improvement_2_2024.json"
  },
  {
    index: "bard_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: bardRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/bard_ability_score_improvement_3_2024.json"
  },
  {
    index: "bard_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: bardRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/bard_ability_score_improvement_4_2024.json"
  },

  {
    index: "druid_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: druidRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/druid_ability_score_improvement_1_2024.json"
  },
  {
    index: "druid_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: druidRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/druid_ability_score_improvement_2_2024.json"
  },
  {
    index: "druid_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: druidRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/druid_ability_score_improvement_3_2024.json"
  },
  {
    index: "druid_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: druidRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/druid_ability_score_improvement_4_2024.json"
  },

  {
    index: "monk_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: monkRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/monk_ability_score_improvement_1_2024.json"
  },
  {
    index: "monk_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: monkRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/monk_ability_score_improvement_2_2024.json"
  },
  {
    index: "monk_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: monkRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/monk_ability_score_improvement_3_2024.json"
  },
  {
    index: "monk_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: monkRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/monk_ability_score_improvement_4_2024.json"
  },

  {
    index: "paladin_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: paladinRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/paladin_ability_score_improvement_1_2024.json"
  },
  {
    index: "paladin_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: paladinRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/paladin_ability_score_improvement_2_2024.json"
  },
  {
    index: "paladin_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: paladinRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/paladin_ability_score_improvement_3_2024.json"
  },
  {
    index: "paladin_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: paladinRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/paladin_ability_score_improvement_4_2024.json"
  },

  {
    index: "ranger_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: rangerRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/ranger_ability_score_improvement_1_2024.json"
  },
  {
    index: "ranger_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: rangerRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/ranger_ability_score_improvement_2_2024.json"
  },
  {
    index: "ranger_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: rangerRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/ranger_ability_score_improvement_3_2024.json"
  },
  {
    index: "ranger_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: rangerRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/ranger_ability_score_improvement_4_2024.json"
  },

  {
    index: "sorcerer_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: sorcererRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/sorcerer_ability_score_improvement_1_2024.json"
  },
  {
    index: "sorcerer_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: sorcererRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/sorcerer_ability_score_improvement_2_2024.json"
  },
  {
    index: "sorcerer_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: sorcererRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/sorcerer_ability_score_improvement_3_2024.json"
  },
  {
    index: "sorcerer_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: sorcererRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/sorcerer_ability_score_improvement_4_2024.json"
  },

  {
    index: "warlock_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: warlockRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/warlock_ability_score_improvement_1_2024.json"
  },
  {
    index: "warlock_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: warlockRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/warlock_ability_score_improvement_2_2024.json"
  },
  {
    index: "warlock_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: warlockRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/warlock_ability_score_improvement_3_2024.json"
  },
  {
    index: "warlock_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: warlockRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat for which you qualify."],
    url: "/assets/atlas/features/json/warlock_ability_score_improvement_4_2024.json"
  }
];

let createdCount = 0;
features.forEach(feat => {
  const filePath = path.join(FEATURES_DIR, `${feat.index}.json`);
  fs.writeFileSync(filePath, JSON.stringify(feat, null, 2));
  createdCount++;
});

console.log(`Successfully generated ${createdCount} 2024 feature definitions in ${FEATURES_DIR}`);
