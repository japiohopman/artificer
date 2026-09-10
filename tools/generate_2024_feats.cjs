/**
 * tools/generate_2024_feats.cjs
 *
 * Generates the complete, canonical 2024 PHB Feats catalogue into versioned directories under
 * public/assets/atlas/feats/json/24/ (<category>/<feat>.json)
 * and builds index_24.json.
 *
 * Exact Canonical Distribution:
 * - Origin: 10
 * - Fighting Style: 10
 * - Epic Boon: 12
 * - General: 43
 * Total: 75
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../public/assets/atlas/feats/json/24');
const INDEX_PATH = path.join(__dirname, '../public/assets/atlas/feats/json/index_24.json');
const ICONS_FEATS_DIR = path.join(__dirname, '../public/assets/icons/svg/feats');

const feats = [
  // ==================== ORIGIN FEATS (10) ====================
  {
    index: 'alert',
    name: 'alert',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You gain the following benefits.",
      "Initiative Proficiency. When you roll Initiative, you can add your Proficiency Bonus to the roll.",
      "Initiative Swap. Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can't make this swap if you or the ally has the Incapacitated condition."
    ]
  },
  {
    index: 'crafter',
    name: 'crafter',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    feature_specific: {
      tool_proficiencies_count: 3,
      discount_percent: 20,
      fast_crafting_reduction_percent: 20
    },
    desc: [
      "You gain the following benefits.",
      "Tool Proficiency. You gain proficiency in three different Artisan's Tools of your choice.",
      "Discount. Whenever you buy a nonmagical item, you receive a 20 percent discount on it.",
      "Fast Crafting. When you craft an item using Artisan's Tools with which you have proficiency, the crafting time is reduced by 20 percent."
    ]
  },
  {
    index: 'healer',
    name: 'healer',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You gain the following benefits.",
      "Battle Medic. As an action, you can spend one use of a Healer's Kit to tend to a creature within 5 feet of you. That creature can expend one of its Hit Point Dice, and you roll that die. The creature regains a number of Hit Points equal to the roll plus your Proficiency Bonus.",
      "Healing Rerolls. Whenever you roll a die to determine the number of Hit Points you restore with a spell or with the Battle Medic benefit of this feat, you can reroll the die if it lands on a 1, and you must use the new roll."
    ]
  },
  {
    index: 'lucky',
    name: 'lucky',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You gain the following benefits.",
      "Luck Points. You have a number of Luck Points equal to your Proficiency Bonus. You regain all expended Luck Points when you finish a Long Rest.",
      "Advantage. Immediately after you roll a d20 for a D20 Test, you can spend 1 Luck Point to give yourself Advantage on the roll.",
      "Disadvantage. Immediately after a creature rolls a d20 for an attack roll against you, you can spend 1 Luck Point to impose Disadvantage on the roll."
    ]
  },
  {
    index: 'magic_initiate',
    name: 'magic initiate',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You gain the following benefits.",
      "Two Cantrips. You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat).",
      "Level 1 Spell. Choose a level 1 spell from the same list you selected for this feat's cantrips. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have.",
      "Spell Change. Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list.",
      "Repeatable. You can take this feat more than once, but you must choose a different spell list each time."
    ]
  },
  {
    index: 'musician',
    name: 'musician',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    feature_specific: {
      instrument_proficiencies_count: 3
    },
    desc: [
      "You gain the following benefits.",
      "Instrument Training. You gain proficiency with three Musical Instruments of your choice.",
      "Inspiring Song. As a Bonus Action, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to a number of willing allies within 30 feet of you who can hear you up to a number equal to your Proficiency Bonus. You can't use this benefit again until you finish a Short or Long Rest."
    ]
  },
  {
    index: 'savage_attacker',
    name: 'savage attacker',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You've trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target."
    ]
  },
  {
    index: 'skilled',
    name: 'skilled',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    desc: [
      "You gain proficiency in any combination of three skills or tools of your choice.",
      "Repeatable. You can take this feat more than once."
    ]
  },
  {
    index: 'tavern_brawler',
    name: 'tavern brawler',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    feature_specific: {
      unarmed_strike_dice: "1d4",
      push_distance_feet: 5
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Constitution score by 1, to a maximum of 20.",
      "Enhanced Unarmed Strike. When you hit with your Unarmed Strike, you deal Bludgeoning damage equal to 1d4 + your Strength modifier, instead of the normal damage for an Unarmed Strike.",
      "Damage Reroll. Whenever you roll a 1 on a damage die for an Unarmed Strike, you can reroll the die, and you must use the new roll.",
      "Push. When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage and push the target 5 feet away from you. You can use this benefit only once per turn.",
      "Improvised Weaponry. You have proficiency with Improvised Weapons."
    ]
  },
  {
    index: 'tough',
    name: 'tough',
    category: 'origin',
    ruleset: '2024',
    prerequisites: [],
    feature_specific: {
      passive_modifiers: {
        hp_bonus_per_level: 2
      }
    },
    desc: [
      "Your Hit Point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your Hit Point maximum increases by an additional 2 Hit Points."
    ]
  },

  // ==================== FIGHTING STYLE FEATS (10) ====================
  {
    index: 'archery',
    name: 'archery',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    feature_specific: {
      passive_modifiers: {
        ranged_attack_bonus: 2
      }
    },
    desc: [
      "You gain a +2 bonus to attack rolls you make with Ranged weapons."
    ]
  },
  {
    index: 'blind_fighting',
    name: 'blind fighting',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "You have Blindsight with a range of 10 feet. Within that range, you can effectively see anything that isn't behind total cover, even if you're Blinded or in darkness. Moreover, you can see an Invisible creature within that range, unless the creature successfully hides from you."
    ]
  },
  {
    index: 'defense',
    name: 'defense',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    feature_specific: {
      passive_modifiers: {
        ac_bonus: 1
      }
    },
    desc: [
      "While you're wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class."
    ]
  },
  {
    index: 'dueling',
    name: 'dueling',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    feature_specific: {
      passive_modifiers: {
        damage_bonus: 2
      }
    },
    desc: [
      "When you are wielding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."
    ]
  },
  {
    index: 'great_weapon_fighting',
    name: 'great weapon fighting',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit."
    ]
  },
  {
    index: 'interception',
    name: 'interception',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "When a creature you can see hits a target, other than you, within 5 feet of you with an attack, you can use your Reaction to reduce the damage the target takes by 1d10 + your Proficiency Bonus (to a minimum of 0 damage). You must be wielding a Shield or a Simple or Martial weapon to use this Reaction."
    ]
  },
  {
    index: 'protection',
    name: 'protection',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your Reaction to impose Disadvantage on the attack roll. You must be holding a Shield."
    ]
  },
  {
    index: 'thrown_weapon_fighting',
    name: 'thrown weapon fighting',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "You can draw a weapon that has the Thrown property as part of the attack you make with the weapon. In addition, when you hit with a ranged attack using a Thrown weapon, you gain a +2 bonus to the damage roll."
    ]
  },
  {
    index: 'two_weapon_fighting',
    name: 'two-weapon fighting',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren't already adding it to the damage."
    ]
  },
  {
    index: 'unarmed_fighting',
    name: 'unarmed fighting',
    category: 'fighting-style',
    ruleset: '2024',
    prerequisites: ['Fighting Style Feature'],
    desc: [
      "Your Unarmed Strikes can deal Bludgeoning damage equal to 1d6 + your Strength modifier on a hit. If you aren't holding any weapons or a Shield when you make the attack roll, the d6 becomes a d8.",
      "At the start of each of your turns, you can deal 1d4 Bludgeoning damage to one creature Grappled by you."
    ]
  },

  // ==================== EPIC BOON FEATS (12) ====================
  {
    index: 'boon_of_combat_prowess',
    name: 'boon of combat prowess',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Peerless Aim. When you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn."
    ]
  },
  {
    index: 'boon_of_dimensional_travel',
    name: 'boon of dimensional travel',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Blink Steps. Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see."
    ]
  },
  {
    index: 'boon_of_energy_resistance',
    name: 'boon of energy resistance',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Energy Resistance. You gain Resistance to two of the following damage types of your choice: Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder. Whenever you finish a Long Rest, you can change the chosen damage types.",
      "Energy Redirection. When you take damage of one of the chosen types, you can use your Reaction to deal damage of that type to a target within 60 feet of you equal to 2d6 + the ability modifier increased by this feat."
    ]
  },
  {
    index: 'boon_of_fate',
    name: 'boon of fate',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Improve Fate. When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll. Once you use this benefit, you can't use it again until you roll Initiative or finish a Short or Long Rest."
    ]
  },
  {
    index: 'boon_of_fortitude',
    name: 'boon of fortitude',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    feature_specific: {
      passive_modifiers: {
        hp_flat_bonus: 40
      }
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "HP Maximum Increase. Your Hit Point maximum increases by 40.",
      "Fortifying Heal. Whenever you regain Hit Points, you can regain additional Hit Points equal to 2d6 + your Constitution modifier. You can use this benefit only once per turn."
    ]
  },
  {
    index: 'boon_of_irresistible_offense',
    name: 'boon of irresistible offense',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 30.",
      "Overcome Defenses. The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.",
      "Overwhelming Strike. When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage's type is the same as the attack's type."
    ]
  },
  {
    index: 'boon_of_recovery',
    name: 'boon of recovery',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Lasting Health. When you drop to 0 Hit Points, you can regain Hit Points equal to half your Hit Point maximum instead. Once you use this benefit, you can't use it again until you finish a Long Rest.",
      "Recovery Action. As a Bonus Action, you can regain Hit Points equal to half your Hit Point maximum. Once you use this benefit, you can't use it again until you finish a Long Rest."
    ]
  },
  {
    index: 'boon_of_skill',
    name: 'boon of skill',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Skill Mastery. You gain proficiency in all skills.",
      "Expertise. Choose one skill in which you have proficiency. You gain Expertise in that skill."
    ]
  },
  {
    index: 'boon_of_speed',
    name: 'boon of speed',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    feature_specific: {
      passive_modifiers: {
        speed_bonus: 30
      }
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Speed Increase. Your Speed increases by 30 feet.",
      "Escape Artist. You can take the Disengage action as a Bonus Action."
    ]
  },
  {
    index: 'boon_of_spell_recall',
    name: 'boon of spell recall',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+', 'Spellcasting or Pact Magic feature'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30.",
      "Free Casting. Whenever you cast a spell with a level 1–4 spell slot, roll 1d4. If the number you roll is the same as the slot's level, the slot isn't expended."
    ]
  },
  {
    index: 'boon_of_the_night_spirit',
    name: 'boon of the night spirit',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Merge with Shadows. While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction.",
      "Shadowy Form. While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant."
    ]
  },
  {
    index: 'boon_of_truesight',
    name: 'boon of truesight',
    category: 'epic-boon',
    ruleset: '2024',
    prerequisites: ['Level 19+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30.",
      "Truesight. You have Truesight with a range of 60 feet."
    ]
  },

  // ==================== GENERAL FEATS (43) ====================
  {
    index: 'ability_score_improvement',
    name: 'ability score improvement',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can't increase an ability score above 20.",
      "Repeatable. You can take this feat more than once."
    ]
  },
  {
    index: 'actor',
    name: 'actor',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Charisma 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Charisma score by 1, to a maximum of 20.",
      "Impersonation. You have Advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person.",
      "Mimicry. You can mimic the speech of another person or the sounds made by other creatures. You must have heard the person speaking or heard the creature make the sound for at least 1 minute."
    ]
  },
  {
    index: 'athlete',
    name: 'athlete',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Climb Speed. You gain a Climb Speed equal to your Speed.",
      "Prone Recovery. You can stand up from Prone using only 5 feet of movement.",
      "Jumping. You can make a running high or long jump after moving only 5 feet on foot."
    ]
  },
  {
    index: 'charger',
    name: 'charger',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Improved Dash. When you take the Dash action, your Speed increases by 10 feet for that turn.",
      "Charge Attack. If you move at least 10 feet in a straight line toward a target immediately before hitting it with an attack roll as part of the Attack action on your turn, you can choose one of the following effects: deal 1d8 extra damage, or push the target up to 10 feet away from you (provided the target is no more than one size larger than you)."
    ]
  },
  {
    index: 'chef',
    name: 'chef',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Constitution or Wisdom score by 1, to a maximum of 20.",
      "Tool Proficiency. You gain proficiency with Cook's Utensils.",
      "Special Treats. As part of a Short Rest, you can prepare special food using Cook's Utensils. You can prepare enough treats for a number of creatures equal to 4 + your Proficiency Bonus. A creature that eats a treat regains an extra 1d8 Hit Points when it expends Hit Point Dice.",
      "Bolstering Treats. With 1 hour of work or when you finish a Long Rest, you can cook treats equal to your Proficiency Bonus that last for 8 hours. A creature can eat a treat as a Bonus Action to gain Temporary Hit Points equal to your Proficiency Bonus."
    ]
  },
  {
    index: 'crossbow_expert',
    name: 'crossbow expert',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity score by 1, to a maximum of 20.",
      "Ignore Loading. You ignore the Loading property of crossbows.",
      "Firing in Melee. Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with crossbows.",
      "Dual Wielding Crossbows. When you make an attack with a Light weapon, you can make an attack with a Hand Crossbow held in your other hand as a Bonus Action."
    ]
  },
  {
    index: 'crusher',
    name: 'crusher',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Constitution 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Constitution score by 1, to a maximum of 20.",
      "Push. Once per turn when you hit a creature with an attack that deals Bludgeoning damage, you can move it 5 feet to an unoccupied space, provided the target is no more than one size larger than you.",
      "Critical Advantage. When you score a Critical Hit that deals Bludgeoning damage to a creature, attack rolls against that creature have Advantage until the start of your next turn."
    ]
  },
  {
    index: 'defensive_duelist',
    name: 'defensive duelist',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity score by 1, to a maximum of 20.",
      "Parry. When you are wielding a Finesse weapon and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your Armor Class for that attack, potentially causing it to miss."
    ]
  },
  {
    index: 'dual_wielder',
    name: 'dual wielder',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Enhanced Dual Wielding. When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action using a different weapon that doesn't have the Two-Handed property.",
      "Quick Draw. You can draw or stow two weapons when you would normally be able to draw or stow only one."
    ]
  },
  {
    index: 'durable',
    name: 'durable',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Constitution 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Constitution score by 1, to a maximum of 20.",
      "Defy Death. You have Advantage on Death Saving Throws.",
      "Speedy Recovery. As a Bonus Action, you can expend one Hit Die to regain Hit Points."
    ]
  },
  {
    index: 'elemental_adept',
    name: 'elemental adept',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Spellcasting or Pact Magic feature'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Energy Mastery. Choose one damage type: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance to damage of the chosen type. In addition, when you roll damage for a spell that deals damage of that type, you can treat any 1 on a damage die as a 2.",
      "Repeatable. You can take this feat more than once, choosing a different damage type each time."
    ]
  },
  {
    index: 'fey_touched',
    name: 'fey-touched',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Spellcasting. You learn the Misty Step spell and one level 1 spell of your choice from the Divination or Enchantment school of magic. You can cast each spell once without expending a spell slot, regaining the ability to do so on a Long Rest. You can also cast them using any spell slots you have."
    ]
  },
  {
    index: 'grappler',
    name: 'grappler',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Punch and Grab. When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn.",
      "Attack Advantage. You have Advantage on attack rolls against a creature Grappled by you.",
      "Fast Wrestler. You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller."
    ]
  },
  {
    index: 'great_weapon_master',
    name: 'great weapon master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength score by 1, to a maximum of 20.",
      "Heavy Weapon Mastery. When you hit a creature with a Heavy weapon as part of the Attack action on your turn, you can deal extra damage equal to your Proficiency Bonus.",
      "Hew. Immediately after you score a Critical Hit with a Melee weapon or reduce a creature to 0 Hit Points with one, you can make one attack with a Melee weapon as a Bonus Action."
    ]
  },
  {
    index: 'heavy_armor_master',
    name: 'heavy armor master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Heavy Armor Training'],
    feature_specific: {
      passive_modifiers: {
        damage_reduction_type: "pb"
      }
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Constitution score by 1, to a maximum of 20.",
      "Damage Reduction. While you are wearing Heavy Armor, Bludgeoning, Piercing, and Slashing damage that you take from attacks is reduced by an amount equal to your Proficiency Bonus."
    ]
  },
  {
    index: 'heavily_armored',
    name: 'heavily armored',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Medium Armor Training'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Constitution score by 1, to a maximum of 20.",
      "Armor Training. You gain Heavy Armor Training."
    ]
  },
  {
    index: 'inspiring_leader',
    name: 'inspiring leader',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Wisdom or Charisma 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Wisdom or Charisma score by 1, to a maximum of 20.",
      "Bolstering Performance. When you finish a Short or Long Rest, you can give an inspiring performance. Choose up to six allies (which can include yourself) within 30 feet who can see or hear you. Each target gains Temporary Hit Points equal to your Proficiency Bonus + the modifier of the ability increased by this feat."
    ]
  },
  {
    index: 'keen_mind',
    name: 'keen mind',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Intelligence 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence score by 1, to a maximum of 20.",
      "Lore Knowledge. You gain proficiency in one of the following skills of your choice: Arcana, History, Investigation, Nature, or Religion. If you already have proficiency in the chosen skill, you gain Expertise in it instead.",
      "Quick Study. You can take the Search action as a Bonus Action."
    ]
  },
  {
    index: 'lightly_armored',
    name: 'lightly armored',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Armor Training. You gain Light Armor Training and Shield Training."
    ]
  },
  {
    index: 'mage_slayer',
    name: 'mage slayer',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Concentration Breaker. When you damage a creature that is concentrating on a spell, that creature has Disadvantage on the saving throw it makes to maintain its concentration.",
      "Guarded Mind. If you fail an Intelligence, Wisdom, or Charisma saving throw, you can cause yourself to succeed instead. Once you use this benefit, you can't use it again until you finish a Long Rest."
    ]
  },
  {
    index: 'martial_weapon_training',
    name: 'martial weapon training',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Martial Weapon Proficiency. You gain proficiency with Martial weapons."
    ]
  },
  {
    index: 'medium_armor_master',
    name: 'medium armor master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Medium Armor Training'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Dexterity Modifier Bonus. When you wear Medium armor, you can add 3, rather than 2, to your Armor Class if you have a Dexterity score of 16 or higher.",
      "Stealth Disadvantage. Wearing Medium armor doesn't impose Disadvantage on your Dexterity (Stealth) checks."
    ]
  },
  {
    index: 'moderately_armored',
    name: 'moderately armored',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Light Armor Training'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Armor Training. You gain Medium Armor Training and Shield Training."
    ]
  },
  {
    index: 'mounted_combatant',
    name: 'mounted combatant',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength, Dexterity, or Wisdom score by 1, to a maximum of 20.",
      "Mounted Strike. While mounted, you have Advantage on melee attack rolls against unmounted creatures smaller than your mount.",
      "Leap Aside. If your mount is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it takes no damage if it succeeds and half damage if it fails.",
      "Veer. While mounted, you can force an attack targeted at your mount to target you instead."
    ]
  },
  {
    index: 'observant',
    name: 'observant',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Intelligence or Wisdom 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
      "Keen Observer. You can take the Search action as a Bonus Action.",
      "Quick Study. Choose Insight, Investigation, or Perception. If you lack proficiency in the chosen skill, you gain proficiency in it. If you already have proficiency, you gain Expertise in it instead."
    ]
  },
  {
    index: 'piercer',
    name: 'piercer',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Piercing Reroll. Once per turn when you hit a creature with an attack that deals Piercing damage, you can reroll one of the attack's damage dice, and you must use the new roll.",
      "Piercing Critical. When you score a Critical Hit that deals Piercing damage, you can roll one additional damage die when determining the extra Piercing damage."
    ]
  },
  {
    index: 'poisoner',
    name: 'poisoner',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity or Intelligence score by 1, to a maximum of 20.",
      "Ignore Resistance. Spells and attacks you make ignore Poison Resistance.",
      "Potent Poison. You gain proficiency with Poisoner's Kit. With 1 hour of work and 50 GP of materials, you can create a number of doses of potent poison equal to your Proficiency Bonus. As a Bonus Action, you can apply poison to a weapon or piece of ammunition. A creature hit takes 2d8 Poison damage and must succeed on a DC 14 Constitution saving throw or be Poisoned until the end of your next turn."
    ]
  },
  {
    index: 'polearm_master',
    name: 'polearm master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Polearm Strike. When you take the Attack action and attack with a Quarterstaff, Spear, Glaive, Halberd, or Pike, you can use a Bonus Action to make a melee attack with the opposite end of the weapon. The damage die for this attack is 1d4 Bludgeoning damage.",
      "Reactive Strike. You can make an Opportunity Attack against a creature that enters the reach you have with a Quarterstaff, Spear, Glaive, Halberd, or Pike."
    ]
  },
  {
    index: 'resilient',
    name: 'resilient',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Choice of an ability score in which you lack saving throw proficiency'],
    desc: [
      "Choose one ability score in which you lack saving throw proficiency. You gain the following benefits.",
      "Ability Score Increase. Increase the chosen ability score by 1, to a maximum of 20.",
      "Saving Throw Proficiency. You gain proficiency in saving throws using the chosen ability.",
      "Repeatable. You can take this feat more than once, choosing a different ability score in which you lack saving throw proficiency each time."
    ]
  },
  {
    index: 'ritual_caster',
    name: 'ritual caster',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Intelligence, Wisdom, or Charisma 13+'],
    feature_specific: {
      subfeature_options: {
        choose: "pb",
        type: "ritual_spells",
        spell_level: 1
      }
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Quick Ritual. You can cast a ritual spell with its normal casting time, without adding 10 minutes. Once you use this benefit, you can't use it again until you finish a Long Rest.",
      "Ritual Spells. You learn a number of level 1 spells that have the Ritual tag equal to your Proficiency Bonus. These spells are always prepared, and you can cast them as Rituals or using any spell slots you have. Whenever your Proficiency Bonus increases, you can learn another level 1 Ritual spell."
    ]
  },
  {
    index: 'sentinel',
    name: 'sentinel',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Halt. When you hit a creature with an Opportunity Attack, the creature's Speed becomes 0 for the rest of the turn.",
      "Ignore Disengage. Creatures provoke Opportunity Attacks from you even if they take the Disengage action.",
      "Retaliation. When a creature within 5 feet of you makes an attack against a target other than you, you can use your Reaction to make a melee weapon attack against the attacking creature."
    ]
  },
  {
    index: 'shadow_touched',
    name: 'shadow-touched',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Spellcasting. You learn the Invisibility spell and one level 1 spell of your choice from the Illusion or Necromancy school of magic. You can cast each spell once without expending a spell slot, regaining the ability to do so on a Long Rest. You can also cast them using any spell slots you have."
    ]
  },
  {
    index: 'sharpshooter',
    name: 'sharpshooter',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity score by 1, to a maximum of 20.",
      "Bypass Cover. Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.",
      "Firing in Melee. Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged attack rolls.",
      "Long Shots. Attacking at long range doesn't impose Disadvantage on your ranged weapon attack rolls."
    ]
  },
  {
    index: 'shield_master',
    name: 'shield master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Shield Training'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength score by 1, to a maximum of 20.",
      "Shield Bash. If you hit a creature with a melee attack as part of the Attack action, you can use a Bonus Action to force the target to make a Strength saving throw (DC 8 + your Strength modifier + your Proficiency Bonus). On a failed save, you push the target 5 feet away or knock it Prone.",
      "Interpose Shield. If you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you can use your Reaction to take no damage if you succeed on the saving throw."
    ]
  },
  {
    index: 'skill_expert',
    name: 'skill expert',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 20.",
      "Skill Proficiency. You gain proficiency in one skill of your choice.",
      "Expertise. Choose one skill in which you have proficiency. You gain Expertise in that skill."
    ]
  },
  {
    index: 'skulker',
    name: 'skulker',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity score by 1, to a maximum of 20.",
      "Blindsight. You gain Blindsight with a range of 10 feet.",
      "Fog of War. When you are Hidden from a creature and miss it with a ranged attack roll, making the attack doesn't reveal your position.",
      "Snipe. You have Advantage on attack rolls made from a hidden position."
    ]
  },
  {
    index: 'slasher',
    name: 'slasher',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Strength or Dexterity 13+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Hamstring. Once per turn when you hit a creature with an attack that deals Slashing damage, you can reduce the Speed of the target by 10 feet until the start of your next turn.",
      "Critical Disadvantage. When you score a Critical Hit that deals Slashing damage to a creature, you impose Disadvantage on all attack rolls made by that creature until the start of your next turn."
    ]
  },
  {
    index: 'speedy',
    name: 'speedy',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Dexterity or Constitution 13+'],
    feature_specific: {
      passive_modifiers: {
        speed_bonus: 10
      }
    },
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Dexterity or Constitution score by 1, to a maximum of 20.",
      "Speed Increase. Your Speed increases by 10 feet.",
      "Dash Mobility. When you take the Dash action, difficult terrain doesn't cost you extra movement for the rest of that turn.",
      "Opportunity Protection. Opportunity attacks have Disadvantage against you."
    ]
  },
  {
    index: 'spell_sniper',
    name: 'spell sniper',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Spellcasting or Pact Magic feature'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Bypass Cover. Your spell attack rolls ignore Half Cover and Three-Quarters Cover.",
      "Casting in Melee. Being within 5 feet of an enemy doesn't impose Disadvantage on your spell attack rolls.",
      "Extended Range. When you cast a spell that has a range of at least 10 feet and requires an attack roll, the range increases by 60 feet."
    ]
  },
  {
    index: 'telekinetic',
    name: 'telekinetic',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Mage Hand. You learn the Mage Hand cantrip. You can cast it invisibly, and its range increases by 30 feet.",
      "Telekinetic Shove. As a Bonus Action, you can telekinetically shove one creature you can see within 30 feet of you. Target must succeed on a Strength saving throw (DC 8 + your spellcasting ability modifier + your Proficiency Bonus) or be moved 5 feet toward or away from you."
    ]
  },
  {
    index: 'telepathic',
    name: 'telepathic',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Telepathic Speech. You can telepathically speak to any creature you can see within 60 feet of you.",
      "Detect Thoughts. You learn the Detect Thoughts spell and can cast it once without expending a spell slot, regaining the ability to do so on a Long Rest. You can also cast it using any spell slots you have."
    ]
  },
  {
    index: 'war_caster',
    name: 'war caster',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+', 'Spellcasting or Pact Magic feature'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
      "Concentration Advantage. You have Advantage on Constitution saving throws that you make to maintain concentration on a spell when you take damage.",
      "Somatic Components. You can perform the somatic components of spells even when you have weapons or a Shield in one or both hands.",
      "Opportunity Spell. When a creature's movement provokes an Opportunity Attack from you, you can use your Reaction to cast a spell at the creature, rather than making an Opportunity Attack. The spell must have a casting time of 1 action and must target only that creature."
    ]
  },
  {
    index: 'weapon_master',
    name: 'weapon master',
    category: 'general',
    ruleset: '2024',
    prerequisites: ['Level 4+'],
    desc: [
      "You gain the following benefits.",
      "Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "Weapon Proficiency. You gain proficiency with four Martial weapons of your choice.",
      "Weapon Mastery. Choose one weapon with which you have proficiency. You gain access to its Mastery property."
    ]
  }
];

const categorySubdirs = {
  'origin': 'origin-feats',
  'fighting-style': 'fighting-style-feats',
  'epic-boon': 'epic-boon-feats',
  'general': 'general-feats'
};

function generate() {
  console.log('Generating 2024 Feats...');

  // Ensure clean target directories
  Object.values(categorySubdirs).forEach(sub => {
    const dir = path.join(BASE_DIR, sub);
    if (fs.existsSync(dir)) {
      // Clean obsolete files in subdirectory
      const existing = fs.readdirSync(dir);
      existing.forEach(f => {
        if (f.endsWith('.json') && !f.startsWith('_')) {
          fs.unlinkSync(path.join(dir, f));
        }
      });
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const indexEntries = [];

  feats.forEach(feat => {
    const subdir = categorySubdirs[feat.category];
    if (!subdir) {
      throw new Error(`Unknown category: ${feat.category} for feat ${feat.index}`);
    }

    const jsonPath = path.join(BASE_DIR, subdir, `${feat.index}.json`);
    const relativeUrl = `/assets/atlas/feats/json/24/${subdir}/${feat.index}.json`;

    // Determine image path: if dedicated SVG exists in icons/svg/feats, use it, otherwise use /assets/icons/svg/items/feature.svg
    let iconPath = `/assets/icons/svg/items/feature.svg`;
    const dedicatedSvg = path.join(ICONS_FEATS_DIR, `${feat.index}.svg`);
    if (fs.existsSync(dedicatedSvg)) {
      iconPath = `/assets/icons/svg/feats/${feat.index}.svg`;
    }

    const record = {
      index: feat.index,
      name: feat.name,
      category: feat.category,
      ruleset: feat.ruleset,
      prerequisites: feat.prerequisites,
      ...(feat.feature_specific ? { feature_specific: feat.feature_specific } : {}),
      desc: feat.desc,
      url: relativeUrl,
      image: iconPath
    };

    fs.writeFileSync(jsonPath, JSON.stringify(record, null, 2) + '\n', 'utf8');

    indexEntries.push({
      name: feat.name,
      index: feat.index,
      category: feat.category,
      ruleset: feat.ruleset
    });
  });

  // Sort index entries by category then index
  indexEntries.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.index.localeCompare(b.index);
  });

  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexEntries, null, 2) + '\n', 'utf8');

  console.log(`Successfully generated ${feats.length} 2024 feats across 4 categories and wrote index_24.json!`);
}

generate();
