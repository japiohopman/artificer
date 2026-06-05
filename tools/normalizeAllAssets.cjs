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
  if (item.kind && item.kind !== 'unknown') return item.kind;
  
  const idx = item.index?.toLowerCase() || '';
  const name = item.name?.toLowerCase() || '';
  const category = item.equipment_category?.index || item.equipment_category?.name?.toLowerCase() || '';
  const armorCat = item.armor_category?.toLowerCase() || '';
  const weaponCat = item.weapon_category?.toLowerCase() || '';

  if (weaponCat || idx.includes('weapon') || category === 'weapon') return 'weapon';
  if (armorCat === 'shield' || idx === 'shield' || category === 'shield') return 'shield';
  if (armorCat || category === 'armor') return 'armor';
  if (idx.includes('focus') || idx.includes('holy_symbol') || idx === 'spellbook' || category.includes('focus')) return 'focus';
  if (idx.includes('pack') || item.contents?.length > 0 || category.includes('pack')) return 'equipment_pack';
  if (idx.includes('tool') || category.includes('tool') || category.includes('kits') || category.includes('supplies')) return 'tool';
  if (idx.includes('potion') || idx.includes('scroll') || idx.includes('ration') || category.includes('consumable')) return 'consumable';
  if (idx.includes('ring') || category.includes('ring')) return 'ring';
  if (idx.includes('amulet') || idx.includes('necklace') || category.includes('neck')) return 'neck';
  if (idx.includes('trinket')) return 'trinket';
  if (idx.includes('gp') || idx.includes('gold') || idx.includes('coin') || category.includes('currency')) return 'currency';
  if (idx.includes('book') || idx.includes('tome') || idx.includes('manual')) return 'book';
  
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
  if (newVal.includes('assets/atlas/') && !newVal.startsWith('/')) {
    newVal = '/' + newVal;
  }

  // 3. Fix directory name mismatches and missing json/ subfolder
  newVal = newVal
    .replace(/\/assets\/atlas\/spells\//g, '/assets/atlas/spell/json/')
    .replace(/\/assets\/atlas\/proficiencies\/skill_/g, '/assets/atlas/skills/json/')
    .replace(/\/assets\/atlas\/proficiencies\/(?!json\/)/g, '/assets/atlas/proficiencies/json/')
    .replace(/\/assets\/atlas\/ability_scores\/(?!json\/)/g, '/assets/atlas/ability_scores/json/')
    .replace(/\/assets\/atlas\/damage_types\/(?!json\/)/g, '/assets/atlas/damage_types/json/')
    .replace(/\/assets\/atlas\/spell\/(?!json\/)/g, '/assets/atlas/spell/json/')
    .replace(/\/assets\/atlas\/skills\/(?!json\/)/g, '/assets/atlas/skills/json/');

  // 4. Ensure .json extension for JSON references (excluding images/audio)
  if (newVal.includes('/json/') && !newVal.match(/\.(json|webp|png|mp3|wav|jpg|jpeg|gif)$/i)) {
    newVal += '.json';
  }

  // 5. Special fix for equipment images (missing /images/ subfolder)
  if (newVal.startsWith('/assets/atlas/equipment/') && !newVal.includes('/json/') && !newVal.includes('/images/') && newVal.match(/\.(webp|png|jpg)$/)) {
    newVal = newVal.replace('/assets/atlas/equipment/', '/assets/atlas/equipment/images/');
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
    if (filePath.includes('equipment\\json')) {
      const originalKind = data.kind;
      data.kind = deriveItemKind(data);
      if (data.kind !== originalKind) changed = true;

      // Add equipSlots if missing
      if (!data.equipSlots && EQUIPMENT_SLOT_MAP[data.kind]) {
        data.equipSlots = EQUIPMENT_SLOT_MAP[data.kind];
        changed = true;
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
