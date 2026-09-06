const fs = require('fs');
const path = require('path');

const SUBCLASSES_DIR = path.join(__dirname, '../public/assets/atlas/subclasses/json/24');
const FEATURES_DIR = path.join(__dirname, '../public/assets/atlas/features/json');

if (!fs.existsSync(SUBCLASSES_DIR)) fs.mkdirSync(SUBCLASSES_DIR, { recursive: true });
if (!fs.existsSync(FEATURES_DIR)) fs.mkdirSync(FEATURES_DIR, { recursive: true });

const classRefs = {
  barbarian: { index: "barbarian", name: "Barbarian", url: "/assets/atlas/class/json/24/barbarian.json" },
  bard: { index: "bard", name: "Bard", url: "/assets/atlas/class/json/24/bard.json" },
  cleric: { index: "cleric", name: "Cleric", url: "/assets/atlas/class/json/24/cleric.json" },
  druid: { index: "druid", name: "Druid", url: "/assets/atlas/class/json/24/druid.json" },
  fighter: { index: "fighter", name: "Fighter", url: "/assets/atlas/class/json/24/fighter.json" },
  monk: { index: "monk", name: "Monk", url: "/assets/atlas/class/json/24/monk.json" },
  paladin: { index: "paladin", name: "Paladin", url: "/assets/atlas/class/json/24/paladin.json" },
  ranger: { index: "ranger", name: "Ranger", url: "/assets/atlas/class/json/24/ranger.json" },
  rogue: { index: "rogue", name: "Rogue", url: "/assets/atlas/class/json/24/rogue.json" },
  sorcerer: { index: "sorcerer", name: "Sorcerer", url: "/assets/atlas/class/json/24/sorcerer.json" },
  warlock: { index: "warlock", name: "Warlock", url: "/assets/atlas/class/json/24/warlock.json" },
  wizard: { index: "wizard", name: "Wizard", url: "/assets/atlas/class/json/24/wizard.json" }
};

const newSubclassesData = [
  // --- BARBARIAN ---
  {
    index: "berserker_2024",
    name: "Path of the Berserker",
    classKey: "barbarian",
    desc: ["For some Barbarians, rage is a means to a violent end. The Path of the Berserker is a path of untamed, thrilling fury. You thrill in the chaos of battle, heedless of your own health or safety."],
    levels: [
      {
        level: 3,
        features: [
          { index: "frenzy_berserker_2024", name: "Frenzy", desc: "If you use Reckless Attack while raging, you can deal extra damage to the first target you hit on your turn. The extra damage equal to a number of d6s equal to your Rage Damage bonus." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "mindless_rage_berserker_2024", name: "Mindless Rage", desc: "You are immune to the Charmed and Frightened conditions while raging. If you are Charmed or Frightened when you enter your Rage, the effect is suspended for the duration of the Rage." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "retaliation_berserker_2024", name: "Retaliation", desc: "When you take damage from a creature that is within 5 feet of you, you can use your Reaction to make one melee weapon or Unarmed Strike attack against that creature." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "intimidating_presence_berserker_2024", name: "Intimidating Presence", desc: "As a Bonus Action, force each creature of your choice within 30 feet to make a Wisdom save vs DC 8 + PB + STR. On a fail, a target is Frightened of you for 1 minute." }
        ]
      }
    ]
  },
  {
    index: "wild_heart_2024",
    name: "Path of the Wild Heart",
    classKey: "barbarian",
    desc: ["The Path of the Wild Heart tunes your fury to the natural realm and animal spirits. You embody primal aspects of beasts to channel speed, resilience, and feral power."],
    levels: [
      {
        level: 3,
        features: [
          { index: "animal_speaker_wild_heart_2024", name: "Animal Speaker", desc: "You gain the ability to cast Beast Sense and Speak with Animals as Rituals using Wisdom as your spellcasting ability." },
          { index: "rage_of_the_wild_wild_heart_2024", name: "Rage of the Wild", desc: "Whenever you enter your Rage, choose an animal aspect (Bear for resistance to all damage except Force, Eagle for Dash as Bonus Action, or Wolf for Advantage on melee attacks for allies)." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "aspect_of_the_wild_wild_heart_2024", name: "Aspect of the Wild", desc: "Gain a permanent animal aspect benefit such as Elephant (carrying capacity & Strength Advantage) or Owl (Darkvision and flying speed in Rage)." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "nature_speaker_wild_heart_2024", name: "Nature Speaker", desc: "You can cast the Commune with Nature spell as a Ritual without material components." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "power_of_the_wild_wild_heart_2024", name: "Power of the Wild", desc: "While raging, choose an empowered aspect such as Falcon (flying speed equal to Speed) or Rhino (knock enemies Prone on charge)." }
        ]
      }
    ]
  },
  {
    index: "world_tree_2024",
    name: "Path of the World Tree",
    classKey: "barbarian",
    desc: ["Barbarians who follow the Path of the World Tree draw vitality and cosmic roots from the cosmic Yggdrasil, connecting their rage to the lifeforce of creation."],
    levels: [
      {
        level: 3,
        features: [
          { index: "vitality_of_the_tree_world_tree_2024", name: "Vitality of the Tree", desc: "When you enter your Rage, gain Temporary Hit Points equal to your Barbarian level. At the start of each of your turns while raging, give Temp HP to an ally within 10 feet." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "branches_of_the_tree_world_tree_2024", name: "Branches of the Tree", desc: "When a creature starts its turn within 30 feet, use a Reaction to summon spectral roots that teleport it to an empty space near you and reduce its Speed to 0." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "bountiful_roots_world_tree_2024", name: "Bountiful Roots", desc: "Your vitality aura expands to 20 feet, and allies near you gain resistance to damage while holding Temp HP granted by your Vitality of the Tree." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "travel_along_the_tree_world_tree_2024", name: "Travel Along the Tree", desc: "While raging, teleport up to 60 feet to an unoccupied space on your turn. You can also transport willing allies along with you." }
        ]
      }
    ]
  },
  {
    index: "zealot_2024",
    name: "Path of the Zealot",
    classKey: "barbarian",
    desc: ["Some deities inspire their followers to a holy fury. Barbarians who walk the Path of the Zealot channel divine zeal into their weapon attacks and defy death itself."],
    levels: [
      {
        level: 3,
        features: [
          { index: "divine_fury_zealot_2024", name: "Divine Fury", desc: "While raging, the first target you hit on your turn with a weapon attack takes extra Radiant or Necrotic damage equal to 1d6 + half your Barbarian level." },
          { index: "warrior_of_the_gods_zealot_2024", name: "Warrior of the Gods", desc: "If a spell has the sole effect of restoring Hit Points to you (or reviving you), the caster doesn't need material components to cast the spell on you." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "fanatical_focus_zealot_2024", name: "Fanatical Focus", desc: "If you fail a saving throw while raging, you can reroll it with a bonus equal to your Rage Damage bonus. You must use the new roll." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "zealous_presence_zealot_2024", name: "Zealous Presence", desc: "As a Bonus Action, unleash a battle cry. Up to 10 allies within 60 feet gain Advantage on attack rolls and saving throws until the start of your next turn." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "rage_beyond_death_zealot_2024", name: "Rage Beyond Death", desc: "While raging, dropping to 0 Hit Points doesn't knock you Unconscious. You make death saves as normal, and only die if you have 3 failures when your Rage ends." }
        ]
      }
    ]
  },

  // --- BARD ---
  {
    index: "dance_2024",
    name: "College of Dance",
    classKey: "bard",
    desc: ["Bards of the College of Dance know that rhythm and movement carry ancient spellcraft. They weave agility, unarmed strikes, and evasive grace into battle performance."],
    levels: [
      {
        level: 3,
        features: [
          { index: "dazzling_footwork_dance_2024", name: "Dazzling Footwork", desc: "While not wearing armor or wielding a shield, AC equals 10 + DEX + CHA. In addition, your Unarmed Strikes deal damage equal to your Bardic Inspiration die." },
          { index: "bardic_damage_dance_2024", name: "Bardic Damage", desc: "When you spend a Bardic Inspiration die, you can make an Unarmed Strike as a Bonus Action or add the die roll to your Unarmed Strike damage." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "inspiring_movement_dance_2024", name: "Inspiring Movement", desc: "When an enemy ends its turn within 5 feet of you, spend a Bardic Inspiration die to move up to half your Speed without provoking Opportunity Attacks and allow an ally to move." },
          { index: "tandem_footwork_dance_2024", name: "Tandem Footwork", desc: "When rolling Initiative, spend one Bardic Inspiration die to add the roll to your Initiative and the Initiative of all willing allies within 60 feet." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "leading_evasion_dance_2024", name: "Leading Evasion", desc: "You gain Evasion. When you use Evasion to take no damage from an area effect, allies within 5 feet of you also take no damage if they failed their save." }
        ]
      }
    ]
  },
  {
    index: "glamour_2024",
    name: "College of Glamour",
    classKey: "bard",
    desc: ["Bards of the College of Glamour trace their origin to the Feywild. Their magic mesmerizes audiences, charms foes, and shields allies in glorious fey light."],
    levels: [
      {
        level: 3,
        features: [
          { index: "beguiling_magic_glamour_2024", name: "Beguiling Magic", desc: "You always have Charm Person and Enthrall prepared. When you cast an Enchantment or Illusion spell, you can force a creature to make a WIS save or be Charmed or Frightened." },
          { index: "mantle_of_inspiration_glamour_2024", name: "Mantle of Inspiration", desc: "As a Bonus Action, spend a Bardic Inspiration die to grant allies within 60 feet Temp HP equal to 2x the roll and allow them to move using their Reaction." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "mantle_of_majesty_glamour_2024", name: "Mantle of Majesty", desc: "As a Bonus Action, cast Command without expending a spell slot. For 1 minute, you can cast Command as a Bonus Action on each of your turns." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "unbreakable_majesty_glamour_2024", name: "Unbreakable Majesty", desc: "As a Bonus Action, assume a majestic appearance for 1 minute. Enemies attempting to attack you must succeed on a Charisma save or choose another target." }
        ]
      }
    ]
  },
  {
    index: "lore_2024",
    name: "College of Lore",
    classKey: "bard",
    desc: ["Bards of the College of Lore collect knowledge from every realm. They use secrets, cutting wit, and stolen magical discoveries to outsmart any challenge."],
    levels: [
      {
        level: 3,
        features: [
          { index: "bonus_proficiencies_lore_2024", name: "Bonus Proficiencies", desc: "You gain proficiency in three skills of your choice." },
          { index: "cutting_words_lore_2024", name: "Cutting Words", desc: "When a creature within 60 feet makes an attack roll, ability check, or damage roll, use your Reaction to spend a Bardic Inspiration die and subtract the number rolled." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "magical_discoveries_lore_2024", name: "Magical Discoveries", desc: "You learn two spells of your choice from any class list (Cleric, Druid, Wizard). These count as Bard spells for you." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "peerless_skill_lore_2024", name: "Peerless Skill", desc: "When you make an ability check or attack roll and miss, spend a Bardic Inspiration die and add the number rolled to the total." }
        ]
      }
    ]
  },
  {
    index: "valor_2024",
    name: "College of Valor",
    classKey: "bard",
    desc: ["Bards of the College of Valor keep memory of great heroes alive through martial skill, battle hymns, and inspiring leadership on the front line."],
    levels: [
      {
        level: 3,
        features: [
          { index: "combat_inspiration_valor_2024", name: "Combat Inspiration", desc: "Creatures with your Bardic Inspiration die can add it to weapon damage rolls or add it to AC as a Reaction against an incoming attack." },
          { index: "martial_training_valor_2024", name: "Martial Training", desc: "You gain proficiency with Medium Armor, Shields, and Martial weapons. You can use a weapon as a spellcasting focus for Bard spells." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "extra_attack_valor_2024", name: "Extra Attack", desc: "You can attack twice whenever taking the Attack action. You can replace one attack with casting a Bard cantrip." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "battle_magic_valor_2024", name: "Battle Magic", desc: "Whenever you cast a Bard spell with an action, you can make one weapon attack as a Bonus Action." }
        ]
      }
    ]
  },

  // --- CLERIC ---
  {
    index: "light_domain_2024",
    name: "Light Domain",
    classKey: "cleric",
    desc: ["Clerics of the Light Domain embody truth, vigilance, and burning divine fire. They blind dark forces and incinerate threats with radiant power."],
    levels: [
      {
        level: 3,
        features: [
          { index: "light_domain_spells_2024", name: "Light Domain Spells", desc: "You always have domain spells prepared (Burning Hands, Faerie Fire, Scorching Ray, Daylight, Fireball, etc.)." },
          { index: "warding_flare_light_2024", name: "Warding Flare", desc: "When an attacker within 30 feet hits you, use a Reaction to impose Disadvantage on the attack roll WIS mod times per Long Rest." },
          { index: "radiance_of_the_dawn_light_2024", name: "Channel Divinity: Radiance of the Dawn", desc: "As a Magic action, harness divine light to dispel magical darkness and deal 2d10 + Cleric level Radiant damage to hostile creatures within 30 feet (CON save for half)." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "improved_flare_light_2024", name: "Improved Flare", desc: "You can use Warding Flare when an attacker hits a creature within 30 feet of you, imposing Disadvantage on the attack roll." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "corona_of_light_light_2024", name: "Corona of Light", desc: "As an Action, emit an aura of bright sunlight in a 60-foot radius. Enemies in the aura have Disadvantage on saves against fire and radiant spells." }
        ]
      }
    ]
  },
  {
    index: "trickery_domain_2024",
    name: "Trickery Domain",
    classKey: "cleric",
    desc: ["Clerics of Trickery promote deceit, illusion, and freedom. They confuse enemies with duplicates, stealth, and divine trickery."],
    levels: [
      {
        level: 3,
        features: [
          { index: "trickery_domain_spells_2024", name: "Trickery Domain Spells", desc: "You always have domain spells prepared (Disguise Self, Charm Person, Invisibility, Pass Without Trace, Hypnotic Pattern, etc.)." },
          { index: "blessing_of_the_trickster_trickery_2024", name: "Blessing of the Trickster", desc: "As an Action, touch a willing creature to grant it Advantage on Stealth checks for 1 hour or until you use this feature again." },
          { index: "invoke_duplicity_trickery_2024", name: "Channel Divinity: Invoke Duplicity", desc: "As a Bonus Action, create a illusory duplicate within 30 feet. You can cast spells from its space and gain Advantage on attacks when near it." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "tricksters_transposition_trickery_2024", name: "Trickster's Transposition", desc: "When you use Invoke Duplicity or as a Bonus Action on later turns, you can swap places with your illusory duplicate." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "improved_duplicity_trickery_2024", name: "Improved Duplicity", desc: "You can create up to four duplicates with Invoke Duplicity, and move any number of them as a Bonus Action." }
        ]
      }
    ]
  },
  {
    index: "war_domain_2024",
    name: "War Domain",
    classKey: "cleric",
    desc: ["War Clerics excel in battle, rallying allies, striking with divine accuracy, and crushing enemies under heavy armaments."],
    levels: [
      {
        level: 3,
        features: [
          { index: "war_domain_spells_2024", name: "War Domain Spells", desc: "You always have domain spells prepared (Divine Favor, Shield of Faith, Spiritual Weapon, Crusader's Mantle, Freedom of Movement, etc.)." },
          { index: "war_priest_war_2024", name: "War Priest", desc: "When you take the Attack action, you can make one weapon attack as a Bonus Action WIS mod times per Long Rest." },
          { index: "guided_strike_war_2024", name: "Channel Divinity: Guided Strike", desc: "When you or an ally within 30 feet makes an attack roll, spend Channel Divinity to add +10 to the roll." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "war_gods_blessing_war_2024", name: "War God's Blessing", desc: "You can spend Channel Divinity to cast Shield of Faith or Spiritual Weapon without expending a spell slot." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "avatar_of_battle_war_2024", name: "Avatar of Battle", desc: "You gain resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical attacks." }
        ]
      }
    ]
  },

  // --- DRUID ---
  {
    index: "land_2024",
    name: "Circle of the Land",
    classKey: "druid",
    desc: ["Druids of the Circle of the Land draw nature magic from specific biomes—arid deserts, lush forests, or polar tundras."],
    levels: [
      {
        level: 3,
        features: [
          { index: "circle_spells_land_2024", name: "Circle Spells", desc: "Choose a land biome (Arid, Polar, Temperate, Tropical) to gain prepared circle spells and change biome on Long Rest." },
          { index: "lands_aid_land_2024", name: "Land's Aid", desc: "As a Magic Action, expend Wild Shape to cause thorny vines to deal 2d6 Force damage to foes and heal an ally in a 10-foot area." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "natural_recovery_land_2024", name: "Natural Recovery", desc: "During a Short Rest, regain expended spell slots with a combined level equal to half your Druid level." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "natures_ward_land_2024", name: "Nature's Ward", desc: "You cannot be Poisoned, and you gain resistance to Poison damage and immune to disease." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "natures_sanctuary_land_2024", name: "Nature's Sanctuary", desc: "When you use Land's Aid, create a protective sanctuary area for 1 minute granting half cover to allies." }
        ]
      }
    ]
  },
  {
    index: "moon_2024",
    name: "Circle of the Moon",
    classKey: "druid",
    desc: ["Druids of the Circle of the Moon are fierce guardians of the wilds who assume terrifying animal and elemental battle forms."],
    levels: [
      {
        level: 3,
        features: [
          { index: "circle_forms_moon_2024", name: "Circle Forms", desc: "Assume Beast forms up to CR 1 at L3, CR 2 at L6, CR 3 at L9, scaling higher. Gain AC equal to 13 + WIS mod while transformed." },
          { index: "combat_wild_shape_moon_2024", name: "Combat Wild Shape", desc: "Transform as a Bonus Action. While in Beast form, cast circle spells (Cure Wounds, Moonbeam, Starry Wisp, etc.) and spend spell slots to heal." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "moonlight_strike_moon_2024", name: "Moonlight Strike", desc: "Your attacks in Wild Shape form deal Radiant damage instead of physical damage if you choose." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "elemental_wild_shape_moon_2024", name: "Elemental Wild Shape", desc: "Expend two uses of Wild Shape to transform into an Air, Earth, Fire, or Water Elemental." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "lunar_form_moon_2024", name: "Lunar Form", desc: "Your attacks in Wild Shape deal an extra 1d10 Radiant damage, and you can share your Wild Shape Temp HP with an ally." }
        ]
      }
    ]
  },
  {
    index: "sea_2024",
    name: "Circle of the Sea",
    classKey: "druid",
    desc: ["Circle of the Sea Druids channel the turbulent currents, freezing depths, and howling oceanic tempests."],
    levels: [
      {
        level: 3,
        features: [
          { index: "circle_spells_sea_2024", name: "Circle Spells", desc: "You always have sea spells prepared (Fog Cloud, Shatter, Lightning Bolt, Ice Storm, Wrath of Nature, etc.)." },
          { index: "wrath_of_the_sea_sea_2024", name: "Wrath of the Sea", desc: "As a Bonus Action, spend a Wild Shape use to manifest an aura of ocean spray dealing Cold or Lightning damage and pushing enemies 10 feet." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "aquatic_affinity_sea_2024", name: "Aquatic Affinity", desc: "You gain a Swimming speed equal to your Speed and can breathe underwater indefinitely." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "stormborn_sea_2024", name: "Stormborn", desc: "While Wrath of the Sea is active, gain a Flying speed equal to your Speed and resistance to Cold, Lightning, and Thunder damage." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "oceanic_gift_sea_2024", name: "Oceanic Gift", desc: "You can manifest Wrath of the Sea around a willing ally within 60 feet instead of yourself." }
        ]
      }
    ]
  },
  {
    index: "stars_2024",
    name: "Circle of the Stars",
    classKey: "druid",
    desc: ["Circle of the Stars Druids harness starlight and cosmic constellations to guide allies, blast foes, and foretell fate."],
    levels: [
      {
        level: 3,
        features: [
          { index: "star_map_stars_2024", name: "Star Map", desc: "You possess a cosmic map that grants Guiding Bolt prepared without counting against spell limit, castable without slots WIS mod times per LR." },
          { index: "starry_form_stars_2024", name: "Starry Form", desc: "As a Bonus Action, spend a Wild Shape use to assume a Starry Form: Archer (luminous bonus action blast), Chalice (healing boost), or Dragon (minimum 10 on INT/WIS rolls)." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "cosmic_omen_stars_2024", name: "Cosmic Omen", desc: "Consult your star map on Long Rest to roll a d6: Weal (add d6 to ally roll) or Woe (subtract d6 from enemy roll) WIS mod times per day." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "twinkling_constellations_stars_2024", name: "Twinkling Constellations", desc: "Starry Form constellation effects improve (Archer 2d8 damage, Chalice 2d8 heal, Dragon grants flying speed)." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "full_of_stars_stars_2024", name: "Full of Stars", desc: "While in Starry Form, you become partially incorporeal and gain resistance to Bludgeoning, Piercing, and Slashing damage." }
        ]
      }
    ]
  },

  // --- FIGHTER ---
  {
    index: "eldritch_knight_2024",
    name: "Eldritch Knight",
    classKey: "fighter",
    desc: ["Eldritch Knights combine martial prowess with arcane magic, channeling abjuration and evocation spells to weaponize elemental magic."],
    levels: [
      {
        level: 3,
        features: [
          { index: "spellcasting_eldritch_knight_2024", name: "Spellcasting", desc: "You cast Wizard spells using Intelligence as spellcasting ability. Prepare 1/3 caster spell progression from Wizard list." },
          { index: "weapon_bond_eldritch_knight_2024", name: "Weapon Bond", desc: "Perform a 1-hour ritual to bond with up to two weapons. You cannot be disarmed of a bonded weapon and can summon it to hand as a Bonus Action." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "war_magic_eldritch_knight_2024", name: "War Magic", desc: "When you take the Attack action, you can replace one of your attacks with casting a Wizard cantrip." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "eldritch_strike_eldritch_knight_2024", name: "Eldritch Strike", desc: "When you hit a creature with a weapon attack, that creature has Disadvantage on the next saving throw it makes against a spell you cast." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "arcane_charge_eldritch_knight_2024", name: "Arcane Charge", desc: "When you use Action Surge, teleport up to 30 feet to an unoccupied space you can see before or after taking your additional action." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "improved_war_magic_eldritch_knight_2024", name: "Improved War Magic", desc: "When you take the Attack action, you can replace two attacks with casting a 1st-level or 2nd-level Wizard spell." }
        ]
      }
    ]
  },
  {
    index: "psi_warrior_2024",
    name: "Psi Warrior",
    classKey: "fighter",
    desc: ["Psi Warriors augment physical might with psionic energy, manipulating telekinetic energy to shield allies, leap across battlefields, and crush foes."],
    levels: [
      {
        level: 3,
        features: [
          { index: "psionic_power_psi_warrior_2024", name: "Psionic Power", desc: "Gain Psionic Energy Dice (d6 at L3, d8 at L7, d10 at L11, d12 at L17). Use for Protective Field (reduce damage), Psionic Strike (extra Force damage), or Telekinetic Movement (move objects/allies)." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "telekinetic_movement_psi_warrior_2024", name: "Telekinetic Movement", desc: "Move an object or willing creature within 30 feet up to 30 feet as an action." },
          { index: "psi_powered_leap_psi_warrior_2024", name: "Psi-Powered Leap", desc: "As a Bonus Action, gain a Flying speed equal to twice your Speed until the end of the current turn." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "guarded_mind_psi_warrior_2024", name: "Guarded Mind", desc: "Gain resistance to Psychic damage, and spend 1 Psionic Energy die to end Charmed or Frightened on yourself." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "bulwark_of_force_psi_warrior_2024", name: "Bulwark of Force", desc: "As a Bonus Action, grant half cover to allies within 30 feet for 1 minute INT mod times per Long Rest." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "telekinetic_master_psi_warrior_2024", name: "Telekinetic Master", desc: "Cast Telekinesis without components once per Long Rest, making a weapon attack as a Bonus Action while concentrating on it." }
        ]
      }
    ]
  },

  // --- MONK ---
  {
    index: "mercy_2024",
    name: "Warrior of Mercy",
    classKey: "monk",
    desc: ["Warriors of Mercy manipulate the life force of creatures to heal wounds or inflict necrotic torment on enemies."],
    levels: [
      {
        level: 3,
        features: [
          { index: "implements_of_mercy_mercy_2024", name: "Implements of Mercy", desc: "You gain proficiency in Insight, Medicine, and the Herbalism Kit." },
          { index: "hand_of_harm_mercy_2024", name: "Hand of Harm", desc: "When you hit a creature with an Unarmed Strike, spend 1 Focus Point to deal extra Necrotic damage equal to 1 Martial Arts die + WIS mod." },
          { index: "hand_of_healing_mercy_2024", name: "Hand of Healing", desc: "As an Action or Bonus Action during Flurry of Blows, touch a creature and spend 1 Focus Point to heal HP equal to 1 Martial Arts die + WIS mod." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "physicians_touch_mercy_2024", name: "Physician's Touch", desc: "Hand of Healing removes Poisoned, Blinded, Deafened, Paralyzed, or Stunned. Hand of Harm inflicts Poisoned until end of your next turn." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "flurry_of_healing_and_harm_mercy_2024", name: "Flurry of Healing and Harm", desc: "When using Flurry of Blows, replace every Unarmed Strike with Hand of Healing without spending extra Focus Points." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "hand_of_ultimate_mercy_mercy_2024", name: "Hand of Ultimate Mercy", desc: "Once per Long Rest, touch a creature dead within 24 hours and spend 5 Focus Points to revive it with HP equal to 4 Martial Arts dice + WIS mod." }
        ]
      }
    ]
  },
  {
    index: "elements_2024",
    name: "Warrior of the Elements",
    classKey: "monk",
    desc: ["Warriors of the Elements channel elemental cataclysms through their Ki, blasting foes with fire, ice, wind, and stone."],
    levels: [
      {
        level: 3,
        features: [
          { index: "elemental_attunement_elements_2024", name: "Elemental Attunement", desc: "As a Bonus Action, spend 1 Focus Point to enter elemental reach for 1 minute: Unarmed Strike reach increases by 10 feet, dealing Acid, Cold, Fire, Lightning, or Thunder damage." },
          { index: "environmental_stride_elements_2024", name: "Environmental Stride", desc: "You gain a Climbing and Swimming speed equal to your Speed while Elemental Attunement is active." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "elemental_burst_elements_2024", name: "Elemental Burst", desc: "As an Action, spend 2 Focus Points to unleash a 20-foot radius elemental explosion dealing 3 Martial Arts dice damage (DEX save for half)." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "stride_of_the_elements_elements_2024", name: "Stride of the Elements", desc: "While Elemental Attunement is active, gain a Flying speed equal to your Speed and hover." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "elemental_epitome_elements_2024", name: "Elemental Epitome", desc: "While Elemental Attunement is active, gain resistance to Acid, Cold, Fire, Lightning, and Thunder, and automatically deal elemental damage when stepping near foes." }
        ]
      }
    ]
  },
  {
    index: "open_hand_2024",
    name: "Warrior of the Open Hand",
    classKey: "monk",
    desc: ["Warriors of the Open Hand master physical martial combat, pushing enemies, knocking them prone, and executing lethal vibrational strikes."],
    levels: [
      {
        level: 3,
        features: [
          { index: "open_hand_technique_open_hand_2024", name: "Open Hand Technique", desc: "Whenever you hit a target with Flurry of Blows, apply an effect: knock Prone (DEX save), push 15ft (STR save), or remove Reactions." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "wholeness_of_body_open_hand_2024", name: "Wholeness of Body", desc: "As a Bonus Action, regain Hit Points equal to 1 Martial Arts die + WIS mod WIS mod times per Long Rest." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "fleet_step_open_hand_2024", name: "Fleet Step", desc: "You can take Step of the Wind without expending Focus Points whenever you take the Attack action." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "quivering_palm_open_hand_2024", name: "Quivering Palm", desc: "Hit a target with an Unarmed Strike and spend 4 Focus Points to set up lethal vibrations. Later, trigger the vibration as an Action dealing 10d12 Force damage or dropping it to 0 HP on failed CON save." }
        ]
      }
    ]
  },
  {
    index: "shadow_2024",
    name: "Warrior of the Shadow",
    classKey: "monk",
    desc: ["Warriors of the Shadow slip through darkness, creating magical gloom, teleporting between shadows, and striking from stealth."],
    levels: [
      {
        level: 3,
        features: [
          { index: "shadow_arts_shadow_2024", name: "Shadow Arts", desc: "Spend 1 Focus Point to cast Darkness without spell slots, moving it on your turn and seeing through it clearly with Darkvision up to 60 feet." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "shadow_step_shadow_2024", name: "Shadow Step", desc: "As a Bonus Action while in dim light or darkness, teleport up to 60 feet to another unoccupied space in dim light or darkness and gain Advantage on your next melee attack." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "improved_shadow_step_shadow_2024", name: "Improved Shadow Step", desc: "When you use Shadow Step, spend 1 Focus Point to make an Unarmed Strike as part of the same Bonus Action." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "cloak_of_shadows_shadow_2024", name: "Cloak of Shadows", desc: "While in dim light or darkness, spend 3 Focus Points to become Invisible for 1 minute and phase through solid objects." }
        ]
      }
    ]
  },

  // --- PALADIN ---
  {
    index: "ancients_2024",
    name: "Oath of the Ancients",
    classKey: "paladin",
    desc: ["Paladins who swear the Oath of the Ancients preserve the light of the world, fighting for nature, joy, and beauty against dark forces."],
    levels: [
      {
        level: 3,
        features: [
          { index: "oath_spells_ancients_2024", name: "Oath Spells", desc: "You always have oath spells prepared (Ensnaring Strike, Speak with Animals, Misty Step, Moonbeam, Plant Growth, Protection from Energy, etc.)." },
          { index: "natures_wrath_ancients_2024", name: "Channel Divinity: Nature's Wrath", desc: "As an Action or Bonus Action, cause spectral vines to entangle a foe within 15 feet (STR/DEX save or Restrained)." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "aura_of_warding_ancients_2024", name: "Aura of Warding", desc: "You and allies within 10 feet have resistance to spell damage while conscious." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "undying_sentinel_ancients_2024", name: "Undying Sentinel", desc: "When you drop to 0 HP, drop to 1 HP instead once per Long Rest. You suffer no drawbacks of old age." }
        ]
      },
      {
        level: 20,
        features: [
          { index: "elder_champion_ancients_2024", name: "Elder Champion", desc: "Transform into a force of nature for 1 minute: regain HP at start of turn, cast paladin spells as Bonus Action, and enemies save vs spells at Disadvantage." }
        ]
      }
    ]
  },
  {
    index: "devotion_2024",
    name: "Oath of Devotion",
    classKey: "paladin",
    desc: ["Paladins of Devotion uphold justice, honor, and duty. They weaponize holy light to protect innocents and smite evil."],
    levels: [
      {
        level: 3,
        features: [
          { index: "oath_spells_devotion_2024", name: "Oath Spells", desc: "You always have oath spells prepared (Protection from Evil and Good, Sanctuary, Aid, Zone of Truth, Beacon of Hope, Dispel Magic, etc.)." },
          { index: "sacred_weapon_devotion_2024", name: "Channel Divinity: Sacred Weapon", desc: "As a Bonus Action, imbue a weapon with holy light: add CHA mod to attack rolls and emit bright light for 10 minutes." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "aura_of_devotion_devotion_2024", name: "Aura of Devotion", desc: "You and allies within 10 feet cannot be Charmed while conscious." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "smite_of_protection_devotion_2024", name: "Smite of Protection", desc: "Whenever you cast a Smite spell, you and allies within 30 feet gain half cover until the start of your next turn." }
        ]
      },
      {
        level: 20,
        features: [
          { index: "holy_nimbus_devotion_2024", name: "Holy Nimbus", desc: "As a Bonus Action, emit a 30-foot aura of holy sunlight dealing Radiant damage equal to CHA mod + PB to foes and Advantage on saves vs fiends/undead." }
        ]
      }
    ]
  },
  {
    index: "glory_2024",
    name: "Oath of Glory",
    classKey: "paladin",
    desc: ["Paladins of Glory strive for athletic perfection and legendary heroic deeds that echo through history."],
    levels: [
      {
        level: 3,
        features: [
          { index: "oath_spells_glory_2024", name: "Oath Spells", desc: "You always have oath spells prepared (Guiding Bolt, Heroism, Enhance Ability, Magic Weapon, Haste, Protection from Energy, etc.)." },
          { index: "peerless_athlete_glory_2024", name: "Channel Divinity: Peerless Athlete", desc: "As a Bonus Action, gain Advantage on Athletics/Acrobatics checks and double jump distance for 10 minutes." },
          { index: "inspiring_smite_glory_2024", name: "Channel Divinity: Inspiring Smite", desc: "Immediately after hitting with Divine Smite, grant Temp HP equal to 2d8 + Paladin level split among allies within 30 feet." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "aura_of_alacrity_glory_2024", name: "Aura of Alacrity", desc: "Your Speed increases by 10 feet, and allies starting their turn within 10 feet gain +10 feet Speed for that turn." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "glorious_defense_glory_2024", name: "Glorious Defense", desc: "When an attacker hits an ally within 10 feet, use Reaction to add CHA mod to AC and make a counterattack if it misses." }
        ]
      },
      {
        level: 20,
        features: [
          { index: "living_legend_glory_2024", name: "Living Legend", desc: "For 1 minute, gain Advantage on Charisma checks, turn missed attacks into hits once per turn, and reroll failed saves as Reaction." }
        ]
      }
    ]
  },
  {
    index: "vengeance_2024",
    name: "Oath of Vengeance",
    classKey: "paladin",
    desc: ["Paladins of Vengeance pursue wicked evildoers without mercy, swearing holy vows to hunt down those who commit atrocities."],
    levels: [
      {
        level: 3,
        features: [
          { index: "oath_spells_vengeance_2024", name: "Oath Spells", desc: "You always have oath spells prepared (Bane, Hunter's Mark, Hold Person, Misty Step, Haste, Protection from Energy, etc.)." },
          { index: "vow_of_enmity_vengeance_2024", name: "Channel Divinity: Vow of Enmity", desc: "As a Bonus Action, swear enmity against a target within 30 feet to gain Advantage on attack rolls against it for 1 minute." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "relentless_avenger_vengeance_2024", name: "Relentless Avenger", desc: "When you hit a creature with an Opportunity Attack, move up to half your Speed as part of the same Reaction without provoking Opportunity Attacks." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "soul_of_vengeance_vengeance_2024", name: "Soul of Vengeance", desc: "When the target of your Vow of Enmity makes an attack, use your Reaction to make a melee weapon attack against it." }
        ]
      },
      {
        level: 20,
        features: [
          { index: "avenging_angel_vengeance_2024", name: "Avenging Angel", desc: "Transform into an angelic avenger for 10 minutes: gain wings with 60-foot flying speed and an aura of fear that frightens enemies." }
        ]
      }
    ]
  },

  // --- RANGER ---
  {
    index: "beast_master_2024",
    name: "Beast Master",
    classKey: "ranger",
    desc: ["Beast Masters bond with a fierce primal beast that fights alongside them in perfect unison on the battlefield."],
    levels: [
      {
        level: 3,
        features: [
          { index: "primal_companion_beast_master_2024", name: "Primal Companion", desc: "Summon a Primal Beast (Beast of the Land, Sea, or Sky) that acts on your turn and obeys your commands in battle." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "exceptional_training_beast_master_2024", name: "Exceptional Training", desc: "On your turn, command your beast to Dash, Disengage, Dodge, or Help as a Bonus Action, and its attacks count as magical." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "bestial_fury_beast_master_2024", name: "Bestial Fury", desc: "When you command your companion to attack, it can attack twice or benefit from Hunter's Mark extra damage." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "share_spells_beast_master_2024", name: "Share Spells", desc: "Whenever you cast a spell targeting yourself, you can also have the spell affect your primal companion if within 30 feet." }
        ]
      }
    ]
  },
  {
    index: "fey_wanderer_2024",
    name: "Fey Wanderer",
    classKey: "ranger",
    desc: ["Fey Wanderers draw otherworldly joy and deceptive charm from the Feywild, weaving illusion and psychic venom into battle."],
    levels: [
      {
        level: 3,
        features: [
          { index: "dreadful_strikes_fey_wanderer_2024", name: "Dreadful Strikes", desc: "Once per turn when you hit a creature with a weapon, deal an extra 1d4 Psychic damage (1d6 at L11)." },
          { index: "fey_wanderer_spells_2024", name: "Fey Wanderer Spells", desc: "You always have prepared spells (Charm Person, Misty Step, Dispel Magic, Dimension Door, Mislead)." },
          { index: "otherworldly_glamour_fey_wanderer_2024", name: "Otherworldly Glamour", desc: "Whenever you make a Charisma check, add your Wisdom modifier to the total." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "beguiling_twist_fey_wanderer_2024", name: "Beguiling Twist", desc: "Advantage on saves vs Charmed or Frightened. When a creature succeeds on a save vs Charmed/Frightened near you, redirect the condition to another enemy." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "fey_reinforcements_fey_wanderer_2024", name: "Fey Reinforcements", desc: "Summon Fey without material components once per Long Rest or by expending a 3rd-level spell slot." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "misty_wanderer_fey_wanderer_2024", name: "Misty Wanderer", desc: "Cast Misty Step WIS mod times per Long Rest without expending a spell slot, bringing a willing ally with you." }
        ]
      }
    ]
  },
  {
    index: "gloom_stalker_2024",
    name: "Gloom Stalker",
    classKey: "ranger",
    desc: ["Gloom Stalkers haunt the dark depths of the Underdark and shadowed wilderness, striking unseen from pitch darkness."],
    levels: [
      {
        level: 3,
        features: [
          { index: "dread_ambusher_gloom_stalker_2024", name: "Dread Ambusher", desc: "Add WIS mod to Initiative. On the first turn of combat, speed increases by 10 feet and making an attack deals an extra 2d6 damage WIS mod times per day." },
          { index: "gloom_stalker_spells_2024", name: "Gloom Stalker Spells", desc: "You always have prepared spells (Disguise Self, Rope Trick, Fear, Greater Invisibility, Seeming)." },
          { index: "umbral_sight_gloom_stalker_2024", name: "Umbral Sight", desc: "Gain Darkvision up to 60 feet (or extend by 60 feet). While in darkness, you are Invisible to creatures relying on Darkvision to see you." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "iron_mind_gloom_stalker_2024", name: "Iron Mind", desc: "You gain proficiency in Wisdom saving throws. If you already have it, gain proficiency in Intelligence or Charisma saves." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "stalkers_flurry_gloom_stalker_2024", name: "Stalker's Flurry", desc: "When you miss a weapon attack on your turn, make another weapon attack, or cause a Dread Ambusher burst to hit adjacent targets." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "shadowy_dodge_gloom_stalker_2024", name: "Shadowy Dodge", desc: "When an attack roll hits you, use your Reaction to impose Disadvantage on that roll unless the attacker has Advantage." }
        ]
      }
    ]
  },
  {
    index: "hunter_2024",
    name: "Hunter",
    classKey: "ranger",
    desc: ["Hunters adapt martial techniques to eliminate deadly monsters and horde threats."],
    levels: [
      {
        level: 3,
        features: [
          { index: "hunters_prey_hunter_2024", name: "Hunter's Prey", desc: "Choose Colossus Slayer (extra 1d8 damage to damaged targets), Horde Breaker (extra attack on adjacent enemy), or Retaliator." },
          { index: "hunters_lore_hunter_2024", name: "Hunter's Lore", desc: "When you mark a target with Hunter's Mark, instantly learn its immunities, resistances, and vulnerabilities." }
        ]
      },
      {
        level: 7,
        features: [
          { index: "defensive_tactics_hunter_2024", name: "Defensive Tactics", desc: "Choose Escape the Horde (Opportunity Attacks against you have Disadvantage) or Multiattack Defense (+4 AC vs follow-up attacks)." }
        ]
      },
      {
        level: 11,
        features: [
          { index: "superior_hunters_prey_hunter_2024", name: "Superior Hunter's Prey", desc: "When you hit a target marked by Hunter's Mark, deal the extra Hunter's Mark damage to another creature within 30 feet." }
        ]
      },
      {
        level: 15,
        features: [
          { index: "superior_hunters_defense_hunter_2024", name: "Superior Hunter's Defense", desc: "When you take damage, use your Reaction to halve the damage and reflect the halved damage back to an attacker within 30 feet." }
        ]
      }
    ]
  },

  // --- ROGUE ---
  {
    index: "arcane_trickster_2024",
    name: "Arcane Trickster",
    classKey: "rogue",
    desc: ["Arcane Tricksters enhance stealth and sleight of hand with Wizard illusions and enchantments."],
    levels: [
      {
        level: 3,
        features: [
          { index: "spellcasting_arcane_trickster_2024", name: "Spellcasting", desc: "You cast Wizard spells using Intelligence as spellcasting ability. Prepare 1/3 caster spell progression from Wizard list." },
          { index: "mage_hand_legerdemain_arcane_trickster_2024", name: "Mage Hand Legerdemain", desc: "Cast Mage Hand as a Bonus Action, making the spectral hand invisible to stow/retrieve objects or pick locks silently." }
        ]
      },
      {
        level: 9,
        features: [
          { index: "magical_ambush_arcane_trickster_2024", name: "Magical Ambush", desc: "If you are hidden from a creature when you cast a spell on it, that creature has Disadvantage on saves against the spell this turn." }
        ]
      },
      {
        level: 13,
        features: [
          { index: "versatile_trickster_arcane_trickster_2024", name: "Versatile Trickster", desc: "Use a Bonus Action to distract a target with your Mage Hand, gaining Advantage on attack rolls against it until the end of your turn." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "spell_thief_arcane_trickster_2024", name: "Spell Thief", desc: "When targeted by a spell, use Reaction to negate its effect on you and temporarily steal the spell for 8 hours." }
        ]
      }
    ]
  },
  {
    index: "soulknife_2024",
    name: "Soulknife",
    classKey: "rogue",
    desc: ["Soulknives strike with psionic blades forged from pure mental focus, piercing minds and leaping across shadow."],
    levels: [
      {
        level: 3,
        features: [
          { index: "psychic_blades_soulknife_2024", name: "Psychic Blades", desc: "Manifest psionic daggers (1d6 Psychic damage, Finesse/Thrown 60ft) whenever you take the Attack action, making a bonus action blade attack (1d4)." },
          { index: "psionic_power_soulknife_2024", name: "Psionic Power", desc: "Gain Psionic Energy Dice (d6 at L3, scaling to d12). Use for Psi-Bolstered Knack (add to failed skill check) or Psychic Whispers (telepathy)." }
        ]
      },
      {
        level: 9,
        features: [
          { index: "soul_blades_soulknife_2024", name: "Soul Blades", desc: "Harness psionic energy for Homing Strikes (add Psionic die to missed attack) or Psychic Teleportation (teleport to thrown blade)." }
        ]
      },
      {
        level: 13,
        features: [
          { index: "psychic_veil_soulknife_2024", name: "Psychic Veil", desc: "As an Action, turn Invisible for 1 hour once per Long Rest or by spending 1 Psionic Energy die." }
        ]
      },
      {
        level: 17,
        features: [
          { index: "rend_mind_soulknife_2024", name: "Rend Mind", desc: "When dealing Sneak Attack with Psychic Blades, force a WIS save vs DC 8 + PB + DEX or Stun the target for 1 minute." }
        ]
      }
    ]
  },

  // --- SORCERER ---
  {
    index: "aberrant_sorcery_2024",
    name: "Aberrant Sorcery",
    classKey: "sorcerer",
    desc: ["Aberrant Sorcerers channel alien mind power, cosmic voids, and tentacled psionic horrors."],
    levels: [
      {
        level: 3,
        features: [
          { index: "psionic_spells_aberrant_2024", name: "Psionic Spells", desc: "You always have psionic spells prepared (Mind Spike, Dissonant Whispers, Hunger of Hadar, Evard's Black Tentacles, Telekinesis, etc.)." },
          { index: "telepathic_speech_aberrant_2024", name: "Telepathic Speech", desc: "Form a telepathic link with a creature within 30 feet for 1 hour as a Bonus Action." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "psionic_sorcery_aberrant_2024", name: "Psionic Sorcery", desc: "Cast psionic spells by spending Sorcery Points equal to spell level without Verbal, Somatic, or Material components." },
          { index: "psychic_defenses_aberrant_2024", name: "Psychic Defenses", desc: "Gain resistance to Psychic damage and Advantage on saves against Charmed or Frightened." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "revelation_in_flesh_aberrant_2024", name: "Revelation in Flesh", desc: "Spend 1 Sorcery Point to transform for 10 minutes: gain flight, swimming speed, squeeze through tight spaces, or see invisible creatures." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "warping_implosion_aberrant_2024", name: "Warping Implosion", desc: "Teleport up to 120 feet and cause a 30-foot implosion dealing 3d10 Force damage and pulling enemies toward your former space." }
        ]
      }
    ]
  },
  {
    index: "clockwork_sorcery_2024",
    name: "Clockwork Sorcery",
    classKey: "sorcerer",
    desc: ["Clockwork Sorcerers connect their magic to the perfect cosmic order of Mechanus, imposing balance and cosmic law."],
    levels: [
      {
        level: 3,
        features: [
          { index: "clockwork_spells_clockwork_2024", name: "Clockwork Spells", desc: "You always have clockwork spells prepared (Alarm, Armor of Agathys, Aid, Lesser Restoration, Protection from Energy, Dispel Magic, etc.)." },
          { index: "restore_balance_clockwork_2024", name: "Restore Balance", desc: "As a Reaction when a creature within 60 feet rolls with Advantage or Disadvantage, negate the Advantage or Disadvantage PB times per Long Rest." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "bastion_of_law_clockwork_2024", name: "Bastion of Law", desc: "Spend 1 to 5 Sorcery Points to grant an ally a ward of d8 dice that absorbs incoming damage." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "trance_of_order_clockwork_2024", name: "Trance of Order", desc: "As a Bonus Action, spend 5 Sorcery Points to enter a trance for 1 minute: attack rolls cannot have Advantage against you, and d20 rolls of 9 or lower count as 10." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "clockwork_cavalcade_clockwork_2024", name: "Clockwork Cavalcade", desc: "Summon cosmic construct spirits in a 30-foot cube that restore up to 100 Hit Points, repair damaged objects, and end 6th-level or lower spell effects." }
        ]
      }
    ]
  },
  {
    index: "draconic_sorcery_2024",
    name: "Draconic Sorcery",
    classKey: "sorcerer",
    desc: ["Draconic Sorcerers carry the ancient bloodline of dragons, manifesting scales, elemental breath, and draconic wings."],
    levels: [
      {
        level: 3,
        features: [
          { index: "draconic_resilience_draconic_2024", name: "Draconic Resilience", desc: "Your HP maximum increases by 3 (and by +1 each level). While not wearing armor, your AC equals 10 + DEX + CHA." },
          { index: "draconic_speech_draconic_2024", name: "Draconic Speech", desc: "You can speak, read, and write Draconic, and comprehend dragons instinctively." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "elemental_affinity_draconic_2024", name: "Elemental Affinity", desc: "When you cast a spell that deals damage associated with your draconic ancestor, add CHA mod to the damage and gain resistance to that element for 1 hour." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "dragon_wings_draconic_2024", name: "Dragon Wings", desc: "Manifest draconic wings granting a Flying speed equal to your Speed." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "dragonkind_draconic_2024", name: "Dragonkind", desc: "Exude a 60-foot aura of draconic majesty for 1 minute: frighten or charm enemies and deal elemental damage on command." }
        ]
      }
    ]
  },
  {
    index: "wild_magic_sorcery_2024",
    name: "Wild Magic Sorcery",
    classKey: "sorcerer",
    desc: ["Wild Magic Sorcerers channel raw, chaotic magic from the Feywild and Limbo, unleashing unpredictable magical surges."],
    levels: [
      {
        level: 3,
        features: [
          { index: "wild_magic_surge_wild_magic_2024", name: "Wild Magic Surge", desc: "Whenever you cast a Sorcerer spell of level 1 or higher, roll a d20 to trigger a Wild Magic Surge table effect." },
          { index: "tides_of_chaos_wild_magic_2024", name: "Tides of Chaos", desc: "Gain Advantage on one attack roll, ability check, or save once per Long Rest. Regain immediately after triggering a Wild Magic Surge." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "bend_fate_wild_magic_2024", name: "Bend Fate", desc: "Use Reaction and spend 2 Sorcery Points to roll a d10 and add or subtract it from another creature's d20 roll." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "controlled_chaos_wild_magic_2024", name: "Controlled Chaos", desc: "Whenever you roll on the Wild Magic Surge table, roll twice and choose either effect." }
        ]
      },
      {
        level: 18,
        features: [
          { index: "wild_bombardment_wild_magic_2024", name: "Wild Bombardment", desc: "When you cast a spell that deals damage, roll maximum damage for one of the spell's damage dice and trigger a Wild Magic Surge automatically." }
        ]
      }
    ]
  },

  // --- WARLOCK ---
  {
    index: "archfey_2024",
    name: "Archfey Patron",
    classKey: "warlock",
    desc: ["You forged a pact with an Archfey lord or lady of the Feywild, weaving fey steps, glamours, and deceptive mist into combat."],
    levels: [
      {
        level: 3,
        features: [
          { index: "archfey_spells_2024", name: "Archfey Spells", desc: "You always have prepared patron spells (Faerie Fire, Sleep, Misty Step, Phantasmal Force, Blink, Plant Growth, etc.)." },
          { index: "steps_of_the_fey_archfey_2024", name: "Steps of the Fey", desc: "When you cast Misty Step, trigger a fey effect (Refreshment, Taunting, Disappearing) CHA mod times per Long Rest." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "misty_escape_archfey_2024", name: "Misty Escape", desc: "When taking damage, use your Reaction to cast Misty Step without expending a spell slot once per Long Rest." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "beguiling_defenses_archfey_2024", name: "Beguiling Defenses", desc: "You are immune to Charmed condition. When a creature tries to charm you, reflect the charm back at it." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "bewitching_vanish_archfey_2024", name: "Bewitching Vanish", desc: "When using Steps of the Fey, become Invisible until the start of your next turn." }
        ]
      }
    ]
  },
  {
    index: "celestial_2024",
    name: "Celestial Patron",
    classKey: "warlock",
    desc: ["You struck a pact with a celestial power of the Upper Planes, channeling radiant light, healing flames, and divine protection."],
    levels: [
      {
        level: 3,
        features: [
          { index: "celestial_spells_2024", name: "Celestial Spells", desc: "You always have prepared patron spells (Cure Wounds, Guiding Bolt, Aid, Flaming Sphere, Daylight, Revivify, etc.)." },
          { index: "healing_light_celestial_2024", name: "Healing Light", desc: "Pool of d6 dice equal to 1 + Warlock level. As a Bonus Action, spend dice to heal a creature within 60 feet." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "radiant_soul_celestial_2024", name: "Radiant Soul", desc: "Gain resistance to Radiant damage. Add CHA mod to damage when casting Radiant or Fire damage spells." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "celestial_resilience_celestial_2024", name: "Celestial Resilience", desc: "Whenever you finish a Short or Long Rest, gain Temp HP equal to Warlock level + CHA mod, and give Temp HP to up to 5 allies." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "searing_vengeance_celestial_2024", name: "Searing Vengeance", desc: "When making a death save, burst with holy light to revive with half max HP, deal 2d8 Radiant damage, and blind foes." }
        ]
      }
    ]
  },
  {
    index: "fiend_2024",
    name: "Fiend Patron",
    classKey: "warlock",
    desc: ["You bound your soul to a fiend from the Lower Planes, wielding hellfire, dark luck, and infernal resilience."],
    levels: [
      {
        level: 3,
        features: [
          { index: "fiend_spells_2024", name: "Fiend Spells", desc: "You always have prepared patron spells (Burning Hands, Command, Scorching Ray, Fireball, Stinking Cloud, Wall of Fire, etc.)." },
          { index: "dark_ones_blessing_fiend_2024", name: "Dark One's Blessing", desc: "When you reduce a enemy to 0 HP, gain Temp HP equal to CHA mod + Warlock level." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "dark_ones_own_luck_fiend_2024", name: "Dark One's Own Luck", desc: "When you make an ability check or saving throw, add a d10 to the roll CHA mod times per Long Rest." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "fiendish_resilience_fiend_2024", name: "Fiendish Resilience", desc: "Choose one damage type on Short or Long Rest to gain resistance against (except Force/Psychic)." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "hurl_through_hell_fiend_2024", name: "Hurl Through Hell", desc: "When you hit a target with an attack, hurl it through nightmare lower planes dealing 10d10 Psychic damage on return." }
        ]
      }
    ]
  },
  {
    index: "great_old_one_2024",
    name: "Great Old One Patron",
    classKey: "warlock",
    desc: ["Your patron is an alien entity from the Far Realm, granting eldritch mind blast powers, telepathic speech, and enthralling mental dominance."],
    levels: [
      {
        level: 3,
        features: [
          { index: "great_old_one_spells_2024", name: "Great Old One Spells", desc: "You always have prepared patron spells (Dissonant Whispers, Tasha's Hideous Laughter, Detect Thoughts, Phantasmal Force, Clairvoyance, etc.)." },
          { index: "awakened_mind_great_old_one_2024", name: "Awakened Mind", desc: "Establish two-way telepathic communication with any creature within 30 feet that understands at least one language." },
          { index: "psychic_spells_great_old_one_2024", name: "Psychic Spells", desc: "You can change spell damage types to Psychic damage." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "entropic_ward_great_old_one_2024", name: "Entropic Ward", desc: "As a Reaction when hit by an attack, impose Disadvantage on the attacker and gain Advantage on your next attack roll against it." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "thought_shield_great_old_one_2024", name: "Thought Shield", desc: "Your thoughts cannot be read, gain resistance to Psychic damage, and reflect Psychic damage back at attackers." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "create_thrall_great_old_one_2024", name: "Create Thrall", desc: "Target an Incapacitated humanoid to mentally touch it, placing it under Charmed telepathic thrall until dispelled." }
        ]
      }
    ]
  },

  // --- WIZARD ---
  {
    index: "abjurer_2024",
    name: "Abjurer",
    classKey: "wizard",
    desc: ["Abjurers specialize in protective magic, weaving arcane barriers that ward off elemental fury, curses, and magical attacks."],
    levels: [
      {
        level: 3,
        features: [
          { index: "abjuration_savant_abjurer_2024", name: "Abjuration Savant", desc: "Gold and time required to copy Abjuration spells into your spellbook is halved, and you gain two free Abjuration spells in your spellbook." },
          { index: "arcane_ward_abjurer_2024", name: "Arcane Ward", desc: "When you cast an Abjuration spell of 1st level or higher, create a protective ward with HP equal to 2x Wizard level + INT mod that absorbs damage." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "projected_ward_abjurer_2024", name: "Projected Ward", desc: "When a creature within 30 feet takes damage, use your Reaction to cause your Arcane Ward to absorb the damage." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "spell_breaker_abjurer_2024", name: "Spell Breaker", desc: "You always have Counterspell and Dispel Magic prepared, and add your Proficiency Bonus to ability checks made as part of casting them." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "spell_resistance_abjurer_2024", name: "Spell Resistance", desc: "You have Advantage on saving throws against spells, and resistance to damage dealt by spells." }
        ]
      }
    ]
  },
  {
    index: "diviner_2024",
    name: "Diviner",
    classKey: "wizard",
    desc: ["Diviners pierce the veil of time and space, foreseeing future rolls, discerning secrets, and gaining uncanny foresight."],
    levels: [
      {
        level: 3,
        features: [
          { index: "divination_savant_diviner_2024", name: "Divination Savant", desc: "Gold and time to copy Divination spells is halved, and you gain two free Divination spells in your spellbook." },
          { index: "portent_diviner_2024", name: "Portent", desc: "Roll two d20s on finishing a Long Rest and record the numbers. Replace any d20 roll made by you or a creature you can see with one of these foretold rolls." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "expert_divination_diviner_2024", name: "Expert Divination", desc: "When you cast a Divination spell of 2nd level or higher, regain an expended spell slot of lower level than the spell cast." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "the_third_eye_diviner_2024", name: "The Third Eye", desc: "As a Bonus Action, gain Darkvision 60ft, See Invisibility, or comprehend languages until short or long rest." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "greater_portent_diviner_2024", name: "Greater Portent", desc: "You roll three d20s for Portent instead of two." }
        ]
      }
    ]
  },
  {
    index: "illusionist_2024",
    name: "Illusionist",
    classKey: "wizard",
    desc: ["Illusionists master phantasms and deceptions, weaving light, shadows, and mental trickery into solid realities."],
    levels: [
      {
        level: 3,
        features: [
          { index: "illusion_savant_illusionist_2024", name: "Illusion Savant", desc: "Gold and time to copy Illusion spells is halved, and you gain two free Illusion spells in your spellbook." },
          { index: "improved_phantasms_illusionist_2024", name: "Improved Phantasms", desc: "Cast Minor Illusion as a Bonus Action, combining sound and image in a single casting, with casting range doubled to 60 feet." }
        ]
      },
      {
        level: 6,
        features: [
          { index: "malleable_illusions_illusionist_2024", name: "Malleable Illusions", desc: "When you cast an Illusion spell with a duration of 1 minute or longer, use an Action to change the nature of the illusion." }
        ]
      },
      {
        level: 10,
        features: [
          { index: "illusory_self_illusionist_2024", name: "Illusory Self", desc: "As a Reaction when hit by an attack roll, create an illusory duplicate that causes the attack to automatically miss once per Short or Long Rest." }
        ]
      },
      {
        level: 14,
        features: [
          { index: "illusory_reality_illusionist_2024", name: "Illusory Reality", desc: "As a Bonus Action when casting an Illusion spell, choose one inanimate nonmagical object in the illusion and make it real for 1 minute." }
        ]
      }
    ]
  }
];

let createdSubclasses = 0;
let createdFeatures = 0;

newSubclassesData.forEach(sub => {
  const clsRef = classRefs[sub.classKey];
  if (!clsRef) throw new Error(`Unknown class key: ${sub.classKey}`);

  const subclassLevels = sub.levels.map(lvlGroup => {
    const featureRefs = lvlGroup.features.map(feat => {
      const featObject = {
        index: feat.index,
        name: feat.name,
        class: clsRef,
        subclass: {
          index: sub.index,
          name: sub.name,
          url: `/assets/atlas/subclasses/json/24/${sub.index}.json`
        },
        level: lvlGroup.level,
        desc: [feat.desc],
        url: `/assets/atlas/features/json/${feat.index}.json`
      };

      const featFilePath = path.join(FEATURES_DIR, `${feat.index}.json`);
      fs.writeFileSync(featFilePath, JSON.stringify(featObject, null, 2));
      createdFeatures++;

      return {
        index: feat.index,
        name: feat.name,
        url: `/assets/atlas/features/json/${feat.index}.json`
      };
    });

    return {
      level: lvlGroup.level,
      features: featureRefs
    };
  });

  const subclassRecord = {
    index: sub.index,
    name: sub.name,
    class: clsRef,
    desc: sub.desc,
    subclass_levels: subclassLevels,
    url: `/assets/atlas/subclasses/json/24/${sub.index}.json`,
    rulesetContext: "2024"
  };

  const subFilePath = path.join(SUBCLASSES_DIR, `${sub.index}.json`);
  fs.writeFileSync(subFilePath, JSON.stringify(subclassRecord, null, 2));
  createdSubclasses++;
});

console.log(`Successfully created ${createdSubclasses} 2024 subclass records and ${createdFeatures} subclass feature definitions.`);
