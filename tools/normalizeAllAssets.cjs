const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../public/assets/atlas');

const EQUIPMENT_SLOT_MAP = {
  'weapon': ['main_hand', 'off_hand'],
  'armor': ['chest'],
  'shield': ['off_hand'],
  'focus': ['focus', 'main_hand', 'off_hand'],
  'tool': ['tool_1', 'tool_2', 'tool_3'],
  'ring': ['ring_1', 'ring_2'],
  'neck': ['neck'],
  'head': ['head'],
  'hands': ['hands'],
  'feet': ['feet'],
  'back': ['back'],
  'belt': ['belt'],
  'clothes': ['clothes']
};

function deriveItemKind(item) {
  const idx = item.index?.toLowerCase() || '';
  const name = item.name?.toLowerCase() || '';
  const category = item.equipment_category?.index || item.equipment_category?.name?.toLowerCase() || '';
  const gearCategory = item.gear_category?.index || item.gear_category?.name?.toLowerCase() || '';
  const armorCat = item.armor_category?.toLowerCase() || '';
  const weaponCat = item.weapon_category?.toLowerCase() || '';

  // Prioritize clear consumables
  if (idx.includes('potion') || idx.includes('vial') || idx.includes('flask') || 
      idx.includes('ration') || idx.includes('antitoxin') || 
      category.includes('consumable') || gearCategory.includes('consumable')) {
    return 'consumable';
  }

  // Packs
  if (idx.includes('pack') || item.contents?.length > 0 || category.includes('pack')) return 'equipment_pack';

  // Core mechanical types
  if (weaponCat || idx.includes('weapon') || category === 'weapon') return 'weapon';
  if (armorCat === 'shield' || idx === 'shield' || category === 'shield') return 'shield';
  if (armorCat || category === 'armor') return 'armor';
  if (idx.includes('focus') || idx.includes('holy_symbol') || idx === 'spellbook' || category.includes('focus')) return 'focus';
  
  // Tools
  if (idx.includes('tool') || category.includes('tool') || category.includes('kits') || category.includes('supplies')) return 'tool';
  
  // Jewelry/Accessories (be careful with 'ring' as it might match 'bearing')
  if ((idx.startsWith('ring_') || idx === 'ring') || category === 'ring') return 'ring';
  if (idx.includes('amulet') || idx.includes('necklace') || category.includes('neck')) return 'neck';
  
  // Misc
  if (idx.includes('trinket')) return 'trinket';
  if (idx.includes('gp') || idx.includes('gold') || idx.includes('coin') || category.includes('currency')) return 'currency';
  if (idx.includes('book') || idx.includes('tome') || idx.includes('manual')) return 'book';
  
  // Default to existing kind if it's sane, otherwise adventuring_gear
  if (item.kind && item.kind !== 'unknown' && item.kind !== 'ring') return item.kind;
  
  return 'adventuring_gear';
}

function normalizePath(val) {
  if (typeof val !== 'string') return val;
  
  // 0. Strip massive base64 data URLs (replace with null or a placeholder)
  if (val.startsWith('data:image/') && val.length > 1000) {
    return null; // The app generator will handle missing images
  }

  let decodedVal = val;
  try {
    if (val.includes('%')) decodedVal = decodeURIComponent(val);
  } catch (e) {}

  // 1. Remove GitHub raw wrappers
  if (decodedVal.includes('raw.githubusercontent.com')) {
    const match = decodedVal.match(/\/public\/assets\/(.*?)(\?|$)/);
    if (match) return '/assets/' + match[1];
    
    const mainMatch = decodedVal.match(/\/main\/(.*?)(\?|$)/);
    if (mainMatch) return '/' + mainMatch[1].replace('public/', '');
  }

  // 2. Fix legacy path prefixes and absolute vs relative
  let newVal = decodedVal
    .replace(/public\/assets\/atlas\//g, '/assets/atlas/')
    .replace(/^\/?artificer-main\/codex\/assets\//, '/assets/atlas/')
    .replace(/\/artificer-main\/codex\/assets\//g, '/assets/atlas/')
    .replace(/^\/?codex\/assets\//, '/assets/atlas/')
    .replace(/\/codex\/assets\//g, '/assets/atlas/')
    .replace(/^assets\/atlas\//, '/assets/atlas/');

  // Ensure leading slash for assets
  if ((newVal.includes('assets/atlas/') || newVal.includes('assets/images/')) && !newVal.startsWith('/')) {
    newVal = '/' + newVal;
  }

  // 3. Fix directory name mismatches and missing json/ subfolder
  newVal = newVal
    .replace(/\/assets\/atlas\/world\/toril\/(?!json\/)/g, '/assets/atlas/world/toril/json/')
    .replace(/\/assets\/atlas\/world\/world_wiki\/(?!json\/)/g, '/assets/atlas/world/world_wiki/json/')
    .replace(/\/assets\/atlas\/spells\//g, '/assets/atlas/spell/json/')
    .replace(/\/assets\/atlas\/proficiencies\/skill_/g, '/assets/atlas/skills/json/')
    .replace(/\/assets\/atlas\/proficiencies\/(?!json\/)/g, '/assets/atlas/proficiencies/json/')
    .replace(/\/assets\/atlas\/ability_scores\/(?!json\/)/g, '/assets/atlas/ability_scores/json/')
    .replace(/\/assets\/atlas\/damage_types\/(?!json\/)/g, '/assets/atlas/damage_types/json/')
    .replace(/\/assets\/atlas\/spell\/(?!json\/)/g, '/assets/atlas/spell/json/')
    .replace(/\/assets\/atlas\/skills\/(?!json\/)/g, '/assets/atlas/skills/json/')
    .replace(/\/assets\/atlas\/equipment_categories\/(?!json\/)/g, '/assets/atlas/equipment_categories/json/')
    .replace(/\/assets\/atlas\/backgrounds\/(?!json\/)/g, '/assets/atlas/backgrounds/json/')
    .replace(/\/assets\/atlas\/species\/(?!json\/)/g, '/assets/atlas/species/json/')
    .replace(/\/assets\/atlas\/subraces\/(?!json\/)/g, '/assets/atlas/subraces/json/')
    .replace(/\/assets\/atlas\/traits\/(?!json\/)/g, '/assets/atlas/traits/json/')
    .replace(/\/assets\/atlas\/languages\/(?!json\/)/g, '/assets/atlas/languages/json/')
    .replace(/\/assets\/atlas\/weapon_properties\/(?!json\/)/g, '/assets/atlas/weapon_properties/json/');

  // 4. Ensure .json extension for JSON references (excluding images/audio)
  if (newVal.includes('/json/') && !newVal.match(/\.(json|webp|png|mp3|wav|jpg|jpeg|gif)$/i)) {
    newVal += '.json';
  }

  // 5. Special fix for images (missing folder segments)
  if (newVal.startsWith('/assets/atlas/equipment/') && !newVal.includes('/json/') && !newVal.includes('/images/') && newVal.match(/\.(webp|png|jpg)$/)) {
    newVal = newVal.replace('/assets/atlas/equipment/', '/assets/atlas/equipment/images/');
  }
  if (newVal.startsWith('/assets/atlas/species/') && !newVal.includes('/json/') && !newVal.includes('/wiki_image/') && newVal.match(/\.(webp|png|jpg)$/)) {
    newVal = newVal.replace('/assets/atlas/species/', '/assets/atlas/species/wiki_image/');
  }
  if (newVal.startsWith('/assets/atlas/class/') && !newVal.includes('/json/') && !newVal.includes('/wiki_image/') && newVal.match(/\.(webp|png|jpg)$/)) {
    newVal = newVal.replace('/assets/atlas/class/', '/assets/atlas/class/wiki_image/');
  }
  if (newVal.startsWith('/assets/atlas/backgrounds/') && !newVal.includes('/json/') && !newVal.includes('/wiki_image/') && newVal.match(/\.(webp|png|jpg)$/)) {
    newVal = newVal.replace('/assets/atlas/backgrounds/', '/assets/atlas/backgrounds/wiki_image/');
  }

  // Final cleanup: don't double inject /json/ if it was accidentally added to a webp path
  newVal = newVal.replace(/\/json\/(.*)\.webp$/, '/wiki_image/$1.webp');
  if (newVal.includes('/equipment/') && newVal.endsWith('.webp')) {
      newVal = newVal.replace('/json/', '/images/');
  }

  return newVal;
}

function sanitizeJsonString(str) {
  if (!str.trim()) return '{}';
  // Remove trailing commas in arrays and objects
  return str.replace(/,\s*([\]}])/g, '$1');
}

function processJson(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = sanitizeJsonString(content);
    
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.warn(`[REPAIR] Attempting to fix JSON in ${filePath}`);
      // If simple regex didn't work, maybe it's just very broken
      if (content.includes(']')) {
         // Final desperate attempt for things like toril.json
         content = content.replace(/,\s*\]/g, ']');
         data = JSON.parse(content);
      } else {
         throw e;
      }
    }
    
    let changed = false;

    // Fix typo from TODO
    const contentStr = JSON.stringify(data);
    if (contentStr.includes('strengthing_10_feet')) {
       const fixedStr = contentStr.replace(/strengthing_10_feet/g, 'string_10_feet');
       data = JSON.parse(fixedStr);
       changed = true;
    }

    // Recursive path normalization
    const walkObj = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (typeof obj[key] === 'string' && (key === 'url' || key === 'imageUrl' || key === 'image' || key === 'sprite_sheet')) {
          const original = obj[key];
          obj[key] = normalizePath(original);
          if (obj[key] !== original) changed = true;
        } else if (typeof obj[key] === 'object') {
          walkObj(obj[key]);
        }
      }
    };
    walkObj(data);

    // Equipment specific logic
    if (filePath.includes(path.join('equipment', 'json'))) {
      const originalKind = data.kind;
      // ALWAYS derive kind to fix the incorrect "ring" values
      data.kind = deriveItemKind(data);
      if (data.kind !== originalKind) changed = true;

      // Ensure imageUrl is present if image is
      if (data.image && (data.imageUrl === null || data.imageUrl === undefined || data.imageUrl === '')) {
        data.imageUrl = data.image;
        changed = true;
      }

      // Add equipSlots if missing OR if kind changed (re-derive slots)
      if (!data.equipSlots || data.kind !== originalKind) {
        if (EQUIPMENT_SLOT_MAP[data.kind]) {
          data.equipSlots = EQUIPMENT_SLOT_MAP[data.kind];
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.json') && !file.endsWith('index.json')) {
      processJson(fullPath);
    }
  });
}

console.log('Starting System-Wide Normalization...');
if (fs.existsSync(BASE_DIR)) {
  walk(BASE_DIR);
  console.log('Normalization complete.');
} else {
  console.error(`Base directory not found: ${BASE_DIR}`);
}
