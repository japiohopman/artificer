/**
 * portFoundryAssets.cjs
 *
 * Automation utility to parse, map, and import standard game data (Actors, Items, Spells)
 * from Foundry VTT dnd5e (v6.0.x) unpacked YAML files to Artificer-compliant JSON assets.
 *
 * Includes an advanced Smart Merge and Image/Sprite Preservation system to prevent
 * overwriting manually-curated image, sprite sheets, and grid coordinates.
 *
 * Usage:
 *   node tools/portFoundryAssets.cjs --actors
 *   node tools/portFoundryAssets.cjs --items
 *   node tools/portFoundryAssets.cjs --spells
 *   node tools/portFoundryAssets.cjs --all
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths definitions
const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_ROOT = path.join(__dirname, '../public/assets/atlas');

const PATHS = {
  actors: {
    source: path.join(FOUNDRY_ROOT, 'packs/_source/monsters'),
    target: path.join(TARGET_ROOT, 'enemies/json')
  },
  items: {
    source: path.join(FOUNDRY_ROOT, 'packs/_source/items'),
    target: path.join(TARGET_ROOT, 'equipment/json')
  },
  spells: {
    source: path.join(FOUNDRY_ROOT, 'packs/_source/spells'),
    target: path.join(TARGET_ROOT, 'spell/json')
  }
};

// Size mapping lookup
const SIZE_MAP = {
  tiny: 'Tiny',
  sm: 'Small',
  med: 'Medium',
  lg: 'Large',
  huge: 'Huge',
  grg: 'Gargantuan'
};

// School mapping lookup
const SCHOOL_MAP = {
  abj: { index: 'abjuration', name: 'Abjuration', url: '/assets/atlas/magic_schools/json/abjuration.json' },
  con: { index: 'conjuration', name: 'Conjuration', url: '/assets/atlas/magic_schools/json/conjuration.json' },
  div: { index: 'divination', name: 'Divination', url: '/assets/atlas/magic_schools/json/divination.json' },
  enc: { index: 'enchantment', name: 'Enchantment', url: '/assets/atlas/magic_schools/json/enchantment.json' },
  evo: { index: 'evocation', name: 'Evocation', url: '/assets/atlas/magic_schools/json/evocation.json' },
  ill: { index: 'illusion', name: 'Illusion', url: '/assets/atlas/magic_schools/json/illusion.json' },
  nec: { index: 'necromancy', name: 'Necromancy', url: '/assets/atlas/magic_schools/json/necromancy.json' },
  tra: { index: 'transmutation', name: 'Transmutation', url: '/assets/atlas/magic_schools/json/transmutation.json' }
};

// Clean HTML to paragraphs securely, protecting against HTML element injection (CodeQL)
function cleanHtmlToParagraphs(html) {
  if (!html) return [];

  // 1. Explicitly remove script tags and their inner content to prevent script execution
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Explicitly remove any remaining partial or dangling <script tag patterns
  cleaned = cleaned.replace(/<script/gi, '');

  // 3. Convert paragraph markers to linebreaks
  cleaned = cleaned.replace(/<\/p>/gi, '\n').replace(/<p>/gi, '');

  // 4. Safely strip all other HTML tag patterns using a secure pattern
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // 5. Sanitize HTML entity references to prevent raw markup injection
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  return cleaned.split('\n').map(p => p.trim()).filter(p => p.length > 0);
}

// Convert CR string/float
function parseChallengeRating(crVal) {
  if (crVal === null || crVal === undefined) return 0;
  const num = parseFloat(crVal);
  if (isNaN(num)) return 0;
  return num;
}

// Calculate D&D 5e XP based on CR
function getXpByCR(cr) {
  const xpTable = {
    0: 10, '0': 10,
    0.125: 25, '1/8': 25,
    0.25: 50, '1/4': 50,
    0.5: 100, '1/2': 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000
  };
  return xpTable[cr] || Math.max(0, Math.floor(cr * 1000));
}

// Calculate D&D 5e Proficiency Bonus based on CR
function getProficiencyBonusByCR(cr) {
  if (cr < 5) return 2;
  if (cr < 9) return 3;
  if (cr < 13) return 4;
  if (cr < 17) return 5;
  if (cr < 21) return 6;
  if (cr < 25) return 7;
  if (cr < 29) return 8;
  return 9;
}

// Load and preserve existing data for smart merge
function getPreservedData(targetPath) {
  if (fs.existsSync(targetPath)) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      const parsed = JSON.parse(content);
      return {
        image: parsed.image,
        imageUrl: parsed.imageUrl,
        sprite_sheet: parsed.sprite_sheet,
        sprite_index: parsed.sprite_index,
        item_drops: parsed.item_drops,
        background_type: parsed.background_type,
        forms: parsed.forms,
        wikiData: parsed.wikiData,
        last_updated: parsed.last_updated
      };
    } catch (e) {
      console.warn(`Could not parse existing asset at ${targetPath} for smart merge: ${e.message}`);
    }
  }
  return null;
}

// Recursive search for token image
function findTokenImage(baseDir, filenameNoExt) {
  if (!fs.existsSync(baseDir)) return null;
  const files = fs.readdirSync(baseDir);
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = findTokenImage(fullPath, filenameNoExt);
      if (found) return found;
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) {
        const name = path.basename(file, ext).toLowerCase();
        if (name === filenameNoExt.toLowerCase()) {
          // Return relative path for web
          const relative = path.relative(path.join(__dirname, '../public'), fullPath);
          return '/' + relative.replace(/\\/g, '/');
        }
      }
    }
  }
  return null;
}

// Map a single actor/monster to Artificer enemy JSON
function mapActor(sourceData, targetPath) {
  const system = sourceData.system || {};
  const name = sourceData.name || 'Unnamed NPC';
  const index = sourceData._id ? sourceData._id.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const abilities = system.abilities || {};
  const stats = {
    str: abilities.str?.value || 10,
    dex: abilities.dex?.value || 10,
    con: abilities.con?.value || 10,
    int: abilities.int?.value || 10,
    wis: abilities.wis?.value || 10,
    cha: abilities.cha?.value || 10
  };

  const hp = system.attributes?.hp || {};
  const ac = system.attributes?.ac || {};

  const size = SIZE_MAP[system.traits?.size] || 'Medium';
  const type = system.details?.type?.value || 'humanoid';
  const subtype = system.details?.type?.subtype || 'any race';
  const alignment = system.details?.alignment || 'any alignment';

  const cr = parseChallengeRating(system.details?.cr);
  const proficiencyBonus = getProficiencyBonusByCR(cr);

  // Map embedded items to actions & special abilities
  const actions = [];
  const special_abilities = [];

  if (Array.isArray(sourceData.items)) {
    sourceData.items.forEach(item => {
      const isWeapon = item.type === 'weapon';
      const isFeat = item.type === 'feat';
      const itemSystem = item.system || {};
      const itemDesc = cleanHtmlToParagraphs(itemSystem.description?.value).join(' ');

      if (isWeapon || (isFeat && itemSystem.activities)) {
        // Calculate attack bonus
        let attackBonus = 0;
        const abilityKey = itemSystem.ability || (isWeapon ? 'str' : 'int');
        const abilityMod = Math.floor(((stats[abilityKey] || 10) - 10) / 2);
        attackBonus = abilityMod + proficiencyBonus + (parseInt(itemSystem.attackBonus) || 0) + (itemSystem.magicalBonus || 0);

        actions.push({
          name: item.name.toLowerCase(),
          desc: itemDesc || `${name} attacks with its ${item.name}.`,
          attack_bonus: attackBonus,
          damage: itemSystem.damage?.base ? [
            {
              damage_type: {
                index: itemSystem.damage.base.types?.[0] || 'bludgeoning',
                name: itemSystem.damage.base.types?.[0] || 'bludgeoning',
                url: `/assets/atlas/damage_types/json/${itemSystem.damage.base.types?.[0] || 'bludgeoning'}.json`
              },
              damage_dice: `${itemSystem.damage.base.number || 1}d${itemSystem.damage.base.denomination || 4}${abilityMod !== 0 ? (abilityMod > 0 ? '+' + abilityMod : abilityMod) : ''}`
            }
          ] : [],
          actions: []
        });
      } else if (isFeat) {
        special_abilities.push({
          name: item.name.toLowerCase(),
          desc: itemDesc || 'Special feature details.',
          damage: []
        });
      }
    });
  }

  // Load existing data for image and custom content preservation
  const preserved = getPreservedData(targetPath) || {};

  // Check for dynamic token image in public/assets/atlas/enemies/tokens/
  let enemyImage = preserved.image;
  if (!enemyImage) {
    const tokensDir = path.join(__dirname, '../public/assets/atlas/enemies/tokens');
    // Try by name first, then by index
    enemyImage = findTokenImage(tokensDir, name.replace(/\s+/g, '')) || findTokenImage(tokensDir, index);
  }
  
  if (!enemyImage) {
    enemyImage = `/assets/atlas/enemies/${index}.webp`;
  }

  // Improved AC calculation
  let finalAc = ac.value || (10 + Math.floor((stats.dex - 10) / 2));
  if (ac.flat) finalAc = ac.flat;
  
  return {
    index,
    name: name.toLowerCase(),
    desc: cleanHtmlToParagraphs(system.details?.biography?.value).join('\n') || `${name} is a CR ${cr} ${type}.`,
    size,
    type,
    subtype,
    alignment,
    armor_class: [
      {
        type: ac.calc || (ac.flat ? 'flat' : 'dex'),
        value: finalAc
      }
    ],
    hit_points: hp.value || hp.max || 10,
    hit_dice: hp.formula ? hp.formula.split('+')[0].trim() : '1d8',
    hit_points_roll: hp.formula || '1d8',
    speed: {
      walk: `${system.attributes?.movement?.walk || 30} ft.`
    },
    strength: stats.str,
    dexterity: stats.dex,
    constitution: stats.con,
    intelligence: stats.int,
    wisdom: stats.wis,
    charisma: stats.cha,
    stats,
    proficiencies: [],
    damage_vulnerabilities: system.traits?.dv?.value || [],
    damage_resistances: system.traits?.dr?.value || [],
    damage_immunities: system.traits?.di?.value || [],
    condition_immunities: system.traits?.ci?.value || [],
    senses: {
      passive_perception: 10 + Math.floor((stats.wis - 10) / 2)
    },
    languages: system.traits?.languages?.custom || 'any one language (usually Common)',
    challenge_rating: cr,
    proficiency_bonus: getProficiencyBonusByCR(cr),
    xp: getXpByCR(cr),
    special_abilities,
    actions,
    legendary_actions: [],
    reactions: [],
    image: enemyImage,
    url: `/assets/atlas/enemies/json/${index}.json`,
    updated_at: new Date().toISOString(),
    sprite_index: preserved.sprite_index !== undefined ? preserved.sprite_index : 0,
    sprite_sheet: preserved.sprite_sheet || '/assets/atlas/enemies/sprites/enemies_sheet1.webp',
    background_type: preserved.background_type || 'generic',
    item_drops: preserved.item_drops || [],
    forms: preserved.forms || [],
    wikiData: preserved.wikiData || null,
    last_updated: preserved.last_updated || new Date().toLocaleDateString()
  };
}

// Map a single spell to Artificer spell JSON
function mapSpell(sourceData, targetPath) {
  const system = sourceData.system || {};
  const name = sourceData.name || 'Unnamed Spell';
  const index = sourceData._id ? sourceData._id.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const schoolCode = system.school || 'evo';
  const school = SCHOOL_MAP[schoolCode] || SCHOOL_MAP.evo;

  const properties = system.properties || [];
  const components = [];
  if (properties.includes('vocal')) components.push('V');
  if (properties.includes('somatic')) components.push('S');
  if (properties.includes('material')) components.push('M');

  const preserved = getPreservedData(targetPath) || {};

  return {
    index,
    name: name.toLowerCase(),
    desc: cleanHtmlToParagraphs(system.description?.value),
    range: `${system.range?.value || 'Self'} ${system.range?.units || ''}`.trim(),
    components: components.length > 0 ? components : ['V', 'S'],
    material: system.materials?.value || '',
    ritual: properties.includes('rit'),
    duration: `${system.duration?.value || 'Instantaneous'} ${system.duration?.units || ''}`.trim(),
    concentration: properties.includes('con'),
    casting_time: `${system.activation?.value || 1} ${system.activation?.type || 'action'}`.trim(),
    level: system.level || 0,
    school,
    classes: [],
    subclasses: [],
    url: `/assets/atlas/spell/json/${index}.json`,
    image: preserved.image || `/assets/atlas/spell/images/${index}.webp`,
    updated_at: new Date().toISOString(),
    sprite_index: preserved.sprite_index !== undefined ? preserved.sprite_index : 0,
    sprite_sheet: preserved.sprite_sheet || ''
  };
}

// Map a single item to Artificer equipment JSON
function mapItem(sourceData, targetPath) {
  const system = sourceData.system || {};
  const name = sourceData.name || 'Unnamed Item';
  const index = sourceData._id ? sourceData._id.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  let kind = 'adventuring_gear';
  if (sourceData.type === 'weapon') kind = 'weapon';
  else if (sourceData.type === 'equipment') {
    kind = system.type?.value === 'shield' ? 'shield' : 'armor';
  } else if (sourceData.type === 'consumable') kind = 'consumable';
  else if (sourceData.type === 'container') kind = 'container';

  const preserved = getPreservedData(targetPath) || {};

  return {
    index,
    name: name.toLowerCase(),
    kind,
    cost: {
      quantity: system.price?.value || 0,
      unit: system.price?.denomination || 'gp'
    },
    weight: system.weight || 0,
    desc: cleanHtmlToParagraphs(system.description?.value),
    url: `/assets/atlas/equipment/json/${index}.json`,
    imageUrl: preserved.imageUrl || `/assets/atlas/equipment/images/${index}.webp`,
    image: preserved.image || undefined,
    updated_at: new Date().toISOString(),
    equipSlots: kind === 'weapon' ? ['main_hand'] : kind === 'armor' ? ['chest'] : ['none'],
    sprite_index: preserved.sprite_index !== undefined ? preserved.sprite_index : undefined,
    sprite_sheet: preserved.sprite_sheet || undefined
  };
}

// Main runner for a category
function portCategory(type) {
  const config = PATHS[type];
  if (!config) {
    console.error(`Unknown porting category: ${type}`);
    return;
  }

  if (!fs.existsSync(config.source)) {
    console.warn(`Source folder does not exist: ${config.source}. Skipping.`);
    return;
  }

  if (!fs.existsSync(config.target)) {
    fs.mkdirSync(config.target, { recursive: true });
  }

  console.log(`Starting migration of [${type}] from ${config.source} to ${config.target}...`);

  let count = 0;
  function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        processDir(fullPath);
      } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const parsed = yaml.load(fileContent);

          const indexName = parsed._id ? parsed._id.toLowerCase() : parsed.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const targetPath = path.join(config.target, `${indexName}.json`);

          let output = null;
          if (type === 'actors') output = mapActor(parsed, targetPath);
          else if (type === 'spells') output = mapSpell(parsed, targetPath);
          else if (type === 'items') output = mapItem(parsed, targetPath);

          if (output) {
            fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf8');
            count++;
          }
        } catch (err) {
          console.error(`Failed to port file ${fullPath}:`, err.message);
        }
      }
    });
  }

  processDir(config.source);
  console.log(`Successfully migrated ${count} files to ${config.target}!`);
}

// Command CLI parsing
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log(`
🤖 Foundry to Artificer Asset Porting Tool (Smart Merge Version)
================================================================
Options:
  --actors   Migrate NPCs/Monsters from packs/monsters/ to enemies/json/ (preserves custom sprites/item drops)
  --items    Migrate Weapons & Gear from packs/items/ to equipment/json/ (preserves manual images)
  --spells   Migrate Spells from packs/spells/ to spell/json/ (preserves customized entries)
  --all      Migrate all categories
  `);
  process.exit(0);
}

if (args.includes('--actors') || args.includes('--all')) {
  portCategory('actors');
}
if (args.includes('--items') || args.includes('--all')) {
  portCategory('items');
}
if (args.includes('--spells') || args.includes('--all')) {
  portCategory('spells');
}
console.log('Migration step completed!');
