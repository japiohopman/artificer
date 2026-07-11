/**
 * portRecruitNpcs.cjs
 *
 * Utility script to parse the 12 premade heroes (D&D 5e v6.0.x YAML files)
 * and convert them to Artificer recruit NPC JSON assets inside:
 *   public/assets/atlas/characters/recruit_npc/
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SOURCE_DIR = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x/packs/_source/heroes');
const TARGET_DIR = path.join(__dirname, '../public/assets/atlas/characters/recruit_npc');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Token mapping based on filenames/class-race/weapon combos
const TOKEN_MAPPING = {
  'akra-dragonborn-cleric.yml': '/assets/atlas/enemies/tokens/heroes/ClericDragonborn.webp',
  'aoth-human-druid.yml': '/assets/atlas/enemies/tokens/heroes/DruidStaff.webp',
  'beiro-half-elf-bard.yml': '/assets/atlas/enemies/tokens/heroes/BardLute.webp',
  'krusk-half-orc-paladin.yml': '/assets/atlas/enemies/tokens/heroes/PaladinSword.webp',
  'merric-halfling-barbarian.yml': '/assets/atlas/enemies/tokens/heroes/BarbarianAxe.webp',
  'morthos-tiefling-sorcerer.yml': '/assets/atlas/enemies/tokens/heroes/SorcererTiefling.webp',
  'perrin-halfling-monk.yml': '/assets/atlas/enemies/tokens/heroes/MonkUnarmed.webp',
  'quillathe-elf-ranger.yml': '/assets/atlas/enemies/tokens/heroes/RangerBow.webp',
  'randal-human-fighter.yml': '/assets/atlas/enemies/tokens/heroes/FighterShield.webp',
  'riswynn-dwarf-rogue.yml': '/assets/atlas/enemies/tokens/heroes/RogueHuman.webp',
  'sefris-half-elf-warlock.yml': '/assets/atlas/enemies/tokens/heroes/WarlockSword.webp',
  'zanna-gnome-wizard.yml': '/assets/atlas/enemies/tokens/heroes/WizardTome.webp'
};

const DND_CLASSES_MAP = {
  'barbarian': 'Barbarian', 'bard': 'Bard', 'cleric': 'Cleric', 'druid': 'Druid',
  'fighter': 'Fighter', 'monk': 'Monk', 'paladin': 'Paladin', 'ranger': 'Ranger',
  'rogue': 'Rogue', 'sorcerer': 'Sorcerer', 'warlock': 'Warlock', 'wizard': 'Wizard'
};

const DND_RACES_MAP = {
  'dragonborn': 'Dragonborn', 'dwarf': 'Dwarf', 'elf': 'Elf', 'gnome': 'Gnome',
  'half-elf': 'Half-Elf', 'half-orc': 'Half-Orc', 'halfling': 'Halfling', 'human': 'Human',
  'tiefling': 'Tiefling'
};

// Clean HTML securely using character-by-character parsing without any regular expressions to avoid CodeQL warnings.
function cleanHtml(html) {
  if (!html) return '';
  let result = '';
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === '<') {
      inTag = true;
    } else if (char === '>') {
      inTag = false;
    } else if (!inTag) {
      result += char;
    }
  }

  return result
    .split('&lt;').join('<')
    .split('&gt;').join('>')
    .split('&quot;').join('"')
    .split('&#39;').join("'")
    .split('&amp;').join('&')
    .trim();
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

console.log('Scanning hero YAML files...');
const files = fs.readdirSync(SOURCE_DIR);
const indexList = [];

files.forEach(file => {
  if (!file.endsWith('.yml') && !file.endsWith('.yaml')) return;

  const sourcePath = path.join(SOURCE_DIR, file);
  console.log(`Porting ${file}...`);

  try {
    const rawContent = fs.readFileSync(sourcePath, 'utf8');
    const parsed = yaml.load(rawContent);

    const name = parsed.name || 'Unnamed Hero';
    const id = parsed._id || slugify(name);
    const system = parsed.system || {};

    // Determine stats
    const abilities = system.abilities || {};
    const stats = {
      str: abilities.str?.value || 10,
      dex: abilities.dex?.value || 10,
      con: abilities.con?.value || 10,
      int: abilities.int?.value || 10,
      wis: abilities.wis?.value || 10,
      cha: abilities.cha?.value || 10
    };

    // Determine level from class item
    let level = 1;
    let className = 'Fighter';
    let raceName = 'Human';
    let backgroundName = 'Soldier';

    const items = parsed.items || [];
    items.forEach(it => {
      if (it.type === 'class') {
        level = it.system?.levels || 1;
        className = DND_CLASSES_MAP[it.system?.identifier] || it.name || 'Fighter';
      } else if (it.type === 'race') {
        raceName = DND_RACES_MAP[it.system?.identifier] || it.name || 'Human';
      } else if (it.type === 'background') {
        backgroundName = it.name || 'Soldier';
      }
    });

    const hpData = system.attributes?.hp || {};
    const conMod = Math.floor((stats.con - 10) / 2);
    // Determine class hit die
    let hitDie = 8;
    if (className.toLowerCase() === 'barbarian') hitDie = 12;
    else if (['fighter', 'paladin', 'ranger'].includes(className.toLowerCase())) hitDie = 10;
    else if (['sorcerer', 'wizard'].includes(className.toLowerCase())) hitDie = 6;

    // Calculate HP if missing, else use parsed value
    let maxHp = hpData.value || (hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
    if (maxHp <= 0) maxHp = 10;

    const alignment = system.details?.alignment || 'True Neutral';
    const biography = cleanHtml(system.details?.biography?.value || '');

    // Map equipment, inventory and backpack
    const inventory = {};
    const backpack = [];
    const itemsRegistry = {};
    const containerId = `backpack_${id}`;

    const v2Backpack = {
      id: containerId,
      name: "Backpack",
      type: "backpack",
      slots: Array.from({ length: 120 }, (_, i) => ({ id: `slot_${i}`, itemId: null }))
    };

    const v2Equipment = {
      containerId: `equipment_${id}`,
      slots: [
        { id: 'head', itemId: null },
        { id: 'neck', itemId: null },
        { id: 'chest', itemId: null },
        { id: 'back', itemId: null },
        { id: 'waist', itemId: null },
        { id: 'main_hand', itemId: null },
        { id: 'off_hand', itemId: null },
        { id: 'hands', itemId: null },
        { id: 'legs', itemId: null },
        { id: 'feet', itemId: null },
        { id: 'ring_1', itemId: null },
        { id: 'ring_2', itemId: null },
        { id: 'focus', itemId: null },
        { id: 'tool', itemId: null },
        { id: 'extra', itemId: null },
        { id: 'ammo', itemId: null }
      ]
    };

    const repo = "japiohopman/artificer";
    const branch = "main";
    const githubBase = `https://github.com/${repo}/blob/${branch}/`;

    items.forEach(it => {
      // Exclude races/classes/feats from the raw inventory display
      if (['race', 'class', 'background', 'feat'].includes(it.type)) return;

      const itemSys = it.system || {};
      const itemIndex = itemSys.identifier || slugify(it.name);

      const itemObj = {
        id: `${itemIndex}-${Math.random().toString(36).substr(2, 9)}`,
        name: it.name,
        index: itemIndex,
        _type: 'equipment',
        weight: itemSys.weight?.value || 1,
        quantity: itemSys.quantity || 1,
        dataPath: `${githubBase}public/assets/atlas/equipment/json/${itemIndex}.json`
      };

      const regId = crypto.randomUUID();
      itemsRegistry[regId] = {
        id: regId,
        template: itemIndex,
        quantity: itemSys.quantity || 1,
        addedAt: Date.now()
      };

      const isEquipped = itemSys.equipped || false;
      let slotKey = null;

      if (isEquipped) {
        if (it.type === 'weapon') {
          slotKey = 'main-hand';
        } else if (it.type === 'equipment') {
          if (itemSys.type?.value === 'shield') {
            slotKey = 'off-hand';
          } else {
            slotKey = 'chest';
          }
        }
      }

      if (slotKey) {
        inventory[slotKey] = { ...itemObj, slot: slotKey };
        const v2SlotId = slotKey.replace('-', '_');
        const eqSlot = v2Equipment.slots.find(s => s.id === v2SlotId);
        if (eqSlot) {
          eqSlot.itemId = regId;
        }
      } else {
        backpack.push(itemObj);
        const bagSlot = v2Backpack.slots.find(s => s.itemId === null);
        if (bagSlot) {
          bagSlot.itemId = regId;
        }
      }
    });

    const tokenUrl = TOKEN_MAPPING[file] || '/assets/atlas/enemies/tokens/heroes/FighterShield.webp';

    const npcProfile = {
      id,
      saveVersion: 2,
      name,
      class: className,
      race: raceName,
      gender: file.includes('riswynn') || file.includes('akra') || file.includes('quillathe') || file.includes('sefris') || file.includes('zanna') ? 'Female' : 'Male',
      level,
      xp: 0,
      alignment,
      background: backgroundName,
      stats,
      proficiencies: [],
      traits: [],
      features: [],
      flaws: [],
      ideals: [],
      bonds: [],
      backstory: biography || `A legendary ${raceName} ${className} of renown.`,
      appearance: {
        hairColor: 'Brown',
        hairStyle: 'Short',
        bodyType: 'Medium',
        eyeColor: 'Blue',
        skinColor: '#ffdbac'
      },
      inventory,
      backpack,
      items: itemsRegistry,
      containers: { [v2Backpack.id]: v2Backpack },
      equipment: v2Equipment,
      spells: [],
      choices: {},
      hp: maxHp,
      maxHp: maxHp,
      money: { cp: 0, sp: 0, gp: 50, pp: 0 },
      isNpc: true,
      isRecruitable: true,
      avatarUrl: tokenUrl,
      imageUrl: tokenUrl,
      dataPath: `${githubBase}public/assets/atlas/characters/recruit_npc/${id}.json`
    };

    const targetPath = path.join(TARGET_DIR, `${id}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(npcProfile, null, 2), 'utf8');

    indexList.push({
      name,
      index: id
    });

    console.log(`Ported ${name} to ${targetPath}`);
  } catch (err) {
    console.error(`Failed to parse/port ${file}:`, err);
  }
});

// Write the index.json
const indexPath = path.join(TARGET_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexList, null, 2), 'utf8');
console.log(`Recruit NPC Index written successfully to ${indexPath}!`);
