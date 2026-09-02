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
    desc: ["You have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level and a 2nd-level Wizard spell in your spellbook. You always have these spells prepared, and you can cast each once at its lowest level without expending a spell slot. You regain the ability to cast them this way after a Short or Long Rest."],
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
    desc: ["You can channel divine energy directly from the outer planes to fuel magical effects. You start with two options: Divine Spark and Turn Undead. You gain 2 uses of Channel Divinity per Short or Long Rest (increasing to 3 at level 6 and 4 at level 18)."],
    feature_specific: { uses_at_level_2: 2, uses_at_level_6: 3, uses_at_level_18: 4 },
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
    desc: ["Your connection to your deity reaches its peak. When you use Divine Intervention, you can choose Wish (even if not on the Cleric list) or cast a Cleric spell of 1st through 8th level. After doing so, you regain the use of Divine Intervention after 2d4 Long Rests."],
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
    desc: ["You gain Expertise in two of your skill proficiencies of your choice, or in one skill proficiency and Thieves' Tools. At level 6, you gain Expertise in two more skill proficiencies or Thieves' Tools."],
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
    desc: ["You gain Expertise in two more of your skill proficiencies or Thieves' Tools."],
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

  // --- ASI FEAT PLACEHOLDERS 2024 ---
  {
    index: "fighter_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_1_2024.json"
  },
  {
    index: "fighter_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 6,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_2_2024.json"
  },
  {
    index: "fighter_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_3_2024.json"
  },
  {
    index: "fighter_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_4_2024.json"
  },
  {
    index: "fighter_ability_score_improvement_5_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 14,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_5_2024.json"
  },
  {
    index: "fighter_ability_score_improvement_6_2024",
    name: "Ability Score Improvement",
    class: fighterRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/fighter_ability_score_improvement_6_2024.json"
  },

  {
    index: "wizard_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: wizardRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/wizard_ability_score_improvement_1_2024.json"
  },
  {
    index: "wizard_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: wizardRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/wizard_ability_score_improvement_2_2024.json"
  },
  {
    index: "wizard_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: wizardRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/wizard_ability_score_improvement_3_2024.json"
  },
  {
    index: "wizard_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: wizardRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/wizard_ability_score_improvement_4_2024.json"
  },

  {
    index: "cleric_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: clericRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/cleric_ability_score_improvement_1_2024.json"
  },
  {
    index: "cleric_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: clericRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/cleric_ability_score_improvement_2_2024.json"
  },
  {
    index: "cleric_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: clericRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/cleric_ability_score_improvement_3_2024.json"
  },
  {
    index: "cleric_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: clericRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/cleric_ability_score_improvement_4_2024.json"
  },

  {
    index: "rogue_ability_score_improvement_1_2024",
    name: "Ability Score Improvement",
    class: rogueRef,
    level: 4,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/rogue_ability_score_improvement_1_2024.json"
  },
  {
    index: "rogue_ability_score_improvement_2_2024",
    name: "Ability Score Improvement",
    class: rogueRef,
    level: 8,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/rogue_ability_score_improvement_2_2024.json"
  },
  {
    index: "rogue_ability_score_improvement_3_2024",
    name: "Ability Score Improvement",
    class: rogueRef,
    level: 10,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/rogue_ability_score_improvement_3_2024.json"
  },
  {
    index: "rogue_ability_score_improvement_4_2024",
    name: "Ability Score Improvement",
    class: rogueRef,
    level: 12,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/rogue_ability_score_improvement_4_2024.json"
  },
  {
    index: "rogue_ability_score_improvement_5_2024",
    name: "Ability Score Improvement",
    class: rogueRef,
    level: 16,
    desc: ["You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."],
    url: "/assets/atlas/features/json/rogue_ability_score_improvement_5_2024.json"
  }
];

let createdCount = 0;
features.forEach(feat => {
  const filePath = path.join(FEATURES_DIR, `${feat.index}.json`);
  fs.writeFileSync(filePath, JSON.stringify(feat, null, 2));
  createdCount++;
});

console.log(`Successfully generated ${createdCount} 2024 feature definitions in ${FEATURES_DIR}`);
