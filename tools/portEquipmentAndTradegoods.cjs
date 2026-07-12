/**
 * tools/portEquipmentAndTradegoods.cjs
 *
 * Dedicated, highly advanced utility to port equipment, weapons, armor,
 * consumables, containers, and trade goods from both 2014 (5e) and 2024 rules
 * into a beautifully nested, clean JSON structure with backward compatible smart merge.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths definitions
const FOUNDRY_ROOT = path.join(__dirname, 'dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_ROOT = path.join(__dirname, 'public/assets/atlas/equipment/json');

const SOURCES = {
  rules14: {
    dir: path.join(FOUNDRY_ROOT, 'packs/_source/items'),
    rulesVersion: '14'
  },
  rules24: {
    dir: path.join(FOUNDRY_ROOT, 'packs/_source/equipment24'),
    rulesVersion: '24'
  },
  tradegoods: {
    dir: path.join(FOUNDRY_ROOT, 'packs/_source/tradegoods'),
    rulesVersion: '14',
    forcedSubfolder: 'tradegoods'
  }
};

const PROP_MAP = {
  ver: { name: 'versatile', index: 'versatile' },
  fin: { name: 'finesse', index: 'finesse' },
  thr: { name: 'thrown', index: 'thrown' },
  two: { name: 'two-handed', index: 'two-handed' },
  rch: { name: 'reach', index: 'reach' },
  lgt: { name: 'light', index: 'light' },
  hvy: { name: 'heavy', index: 'heavy' },
  amm: { name: 'ammunition', index: 'ammunition' },
  lod: { name: 'loading', index: 'loading' }
};

// Clean HTML securely
function cleanHtmlToParagraphs(html) {
  if (!html) return [];
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<script/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '\n').replace(/<p>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  return cleaned.split('\n').map(p => p.trim()).filter(p => p.length > 0);
}

// Smart merge lookup from legacy flat file or already existing new file
function getPreservedData(newPath, legacyFilename) {
  const legacyPath = path.join(TARGET_ROOT, legacyFilename);
  let finalPath = null;

  if (fs.existsSync(newPath)) {
    finalPath = newPath;
  } else if (fs.existsSync(legacyPath)) {
    finalPath = legacyPath;
  }

  if (finalPath) {
    try {
      const content = fs.readFileSync(finalPath, 'utf8');
      const parsed = JSON.parse(content);
      return {
        image: parsed.image,
        imageUrl: parsed.imageUrl,
        sprite_index: parsed.sprite_index,
        sprite_sheet: parsed.sprite_sheet,
        contents: parsed.contents || [],
        equipSlots: parsed.equipSlots,
        background_type: parsed.background_type,
        category: parsed.category,
        slot: parsed.slot
      };
    } catch (e) {
      console.warn(`Could not parse existing asset at ${finalPath} for smart merge: ${e.message}`);
    }
  }
  return null;
}

// Map a single item
function mapItem(parsedYaml, rulesVersion, subfolder, indexName, newPath) {
  const system = parsedYaml.system || {};
  const name = parsedYaml.name || indexName.replace(/[-_]/g, ' ');

  // 1. Determine base kind
  let kind = 'adventuring_gear';
  const typeValue = (system.type?.value || '').toLowerCase();
  
  if (parsedYaml.type === 'weapon') {
    kind = 'weapon';
  } else if (parsedYaml.type === 'equipment') {
    if (typeValue === 'shield' || subfolder === 'shield') {
      kind = 'shield';
    } else if (typeValue === 'armor' || typeValue === 'light' || typeValue === 'medium' || typeValue === 'heavy' || subfolder === 'armor') {
      kind = 'armor';
    } else {
      kind = 'equipment';
    }
  } else if (parsedYaml.type === 'consumable' || subfolder === 'potion' || subfolder === 'consumables') {
    kind = 'consumable';
  } else if (parsedYaml.type === 'container' || subfolder === 'containers' || subfolder === 'container') {
    kind = 'container';
  } else if (parsedYaml.type === 'loot' || subfolder === 'tradegoods' || subfolder === 'loot') {
    kind = 'tradegood';
  }

  // 2. Base fields
  const weight = typeof system.weight === 'object' ? (system.weight?.value || 0) : (system.weight || 0);
  const cost = {
    quantity: system.price?.value || 0,
    unit: system.price?.denomination || 'gp'
  };

  // 3. Load preserved data for smart merge
  const legacyFilename = `${indexName}.json`;
  const preserved = getPreservedData(newPath, legacyFilename) || {};

  // Default equip slots based on kind
  let equipSlots = ['none'];
  if (kind === 'weapon') equipSlots = ['main_hand'];
  else if (kind === 'armor') equipSlots = ['chest'];
  else if (kind === 'shield') equipSlots = ['off_hand'];
  else if (kind === 'container') equipSlots = ['back'];

  const mapped = {
    desc: cleanHtmlToParagraphs(system.description?.value),
    special: [],
    index: indexName,
    name: name.toLowerCase(),
    kind,
    cost,
    weight,
    url: `/assets/atlas/equipment/json/${rulesVersion}/${subfolder}/${indexName}.json`,
    imageUrl: preserved.imageUrl || preserved.image || `/assets/atlas/equipment/images/${indexName}.webp`,
    image: preserved.image || `/assets/atlas/equipment/images/${indexName}.webp`,
    updated_at: new Date().toISOString(),
    contents: preserved.contents || [],
    properties: [],
    equipSlots: preserved.equipSlots || equipSlots,
    last_updated: new Date().toLocaleDateString(),
    background_type: preserved.background_type || 'generic'
  };

  // Preserve specific sprite sheet properties if available
  if (preserved.sprite_index !== undefined) mapped.sprite_index = preserved.sprite_index;
  if (preserved.sprite_sheet) mapped.sprite_sheet = preserved.sprite_sheet;
  if (preserved.category) mapped.category = preserved.category;
  if (preserved.slot) mapped.slot = preserved.slot;

  // 4. Weapon specific mappings
  if (kind === 'weapon') {
    let weapon_category = 'Simple';
    let weapon_range = 'Melee';

    if (typeValue.startsWith('martial')) weapon_category = 'Martial';
    if (typeValue.endsWith('r') || subfolder.includes('range') || subfolder.includes('bow') || subfolder.includes('arrow')) weapon_range = 'Ranged';

    mapped.equipment_category = {
      index: 'weapon',
      name: 'weapon',
      url: '/assets/atlas/equipment_categories/json/weapon.json'
    };
    mapped.weapon_category = weapon_category;
    mapped.weapon_range = weapon_range;
    mapped.category_range = `${weapon_category} ${weapon_range}`;

    // Base damage
    if (system.damage?.base) {
      const db = system.damage.base;
      mapped.damage = {
        damage_dice: `${db.number || 1}d${db.denomination || 4}`,
        damage_type: {
          index: db.types?.[0] || 'slashing',
          name: db.types?.[0] || 'slashing',
          url: `/assets/atlas/damage_types/json/${db.types?.[0] || 'slashing'}.json`
        }
      };
    }

    // Two handed damage (versatile)
    if (system.damage?.versatile && system.damage?.versatile?.denomination) {
      const dv = system.damage.versatile;
      mapped.two_handed_damage = {
        damage_dice: `${dv.number || 1}d${dv.denomination}`,
        damage_type: mapped.damage?.damage_type || {
          index: 'slashing',
          name: 'slashing',
          url: '/assets/atlas/damage_types/json/slashing.json'
        }
      };
    }

    // Range
    mapped.range = {
      normal: system.range?.value || 5,
      long: system.range?.long || null
    };

    // Weapon Properties mapping
    if (Array.isArray(system.properties)) {
      system.properties.forEach(prop => {
        const key = typeof prop === 'string' ? prop : prop.id;
        if (key && PROP_MAP[key]) {
          mapped.properties.push({
            index: PROP_MAP[key].index,
            name: PROP_MAP[key].name,
            url: `/assets/atlas/weapon_properties/json/${PROP_MAP[key].index}.json`
          });
        }
      });
    }
  }

  // 5. Armor specific mappings
  if (kind === 'armor' || kind === 'shield') {
    let armor_category = 'Light';
    if (typeValue === 'medium') armor_category = 'Medium';
    else if (typeValue === 'heavy') armor_category = 'Heavy';
    else if (typeValue === 'shield' || kind === 'shield') armor_category = 'Shield';

    mapped.equipment_category = {
      index: kind === 'shield' ? 'shield' : 'armor',
      name: kind === 'shield' ? 'shield' : 'armor',
      url: `/assets/atlas/equipment_categories/json/${kind === 'shield' ? 'shield' : 'armor'}.json`
    };
    mapped.armor_category = armor_category;

    mapped.armor_class = {
      base: system.armor?.value || 10,
      dex_bonus: typeValue === 'light' || typeValue === 'medium',
      max_bonus: typeValue === 'medium' ? 2 : null
    };

    mapped.str_minimum = system.strength || 0;
    mapped.stealth_disadvantage = system.stealth === true || system.properties?.includes('ste');
  }

  // 6. Container specific mappings
  if (kind === 'container') {
    mapped.equipment_category = {
      index: 'container',
      name: 'container',
      url: '/assets/atlas/equipment_categories/json/container.json'
    };
    mapped.capacity = system.capacity?.value || "1 cubic foot/30 pounds";
    mapped.capacity_weight = system.capacity?.weight || 30;
  }

  return mapped;
}

// Port rules directory recursively
function portDirectory(sourceConfig) {
  const { dir, rulesVersion, forcedSubfolder } = sourceConfig;
  if (!fs.existsSync(dir)) {
    console.warn(`Source directory not found: ${dir}. Skipping.`);
    return;
  }

  console.log(`Porting items from ${dir} (Rules: ${rulesVersion})...`);
  let count = 0;

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const parsed = yaml.load(content);

          // Get clean relative subfolder structure
          let relativeSub = '';
          if (forcedSubfolder) {
            relativeSub = forcedSubfolder;
          } else {
            const rel = path.relative(dir, currentDir);
            relativeSub = rel ? rel.replace(/\\/g, '/').toLowerCase() : 'other';
          }

          const indexName = path.basename(file, path.extname(file)).toLowerCase();
          
          // Target nested path
          const targetSubdir = path.join(TARGET_ROOT, rulesVersion, relativeSub);
          if (!fs.existsSync(targetSubdir)) {
            fs.mkdirSync(targetSubdir, { recursive: true });
          }

          const targetPath = path.join(targetSubdir, `${indexName}.json`);
          const mapped = mapItem(parsed, rulesVersion, relativeSub, indexName, targetPath);

          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
          count++;
        } catch (e) {
          console.error(`Error porting ${file}:`, e.message);
        }
      }
    });
  }

  traverse(dir);
  console.log(`Ported ${count} items successfully for Rules: ${rulesVersion}!`);
}

// Main execution function
function main() {
  console.log('--- Starting Equipment and Tradegoods Porting ---');
  portDirectory(SOURCES.rules14);
  portDirectory(SOURCES.rules24);
  portDirectory(SOURCES.tradegoods);
  console.log('--- Porting Completed Successfully ---');
}

main();
