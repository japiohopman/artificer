/**
 * portMonsterFeatures.cjs
 *
 * Automation utility to parse, map, and import standard monster features
 * from Foundry VTT dnd5e (v6.0.x) unpacked YAML files to Artificer-compliant JSON assets.
 *
 * Usage:
 *   node tools/portMonsterFeatures.cjs
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths definitions
const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_DIR = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/json');
const INDEX_PATH = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/index.json');

const SOURCES = [
  {
    path: path.join(FOUNDRY_ROOT, 'packs/_source/monsterfeatures'),
    flat: true
  },
  {
    path: path.join(FOUNDRY_ROOT, 'packs/_source/monsterfeatures24'),
    flat: false
  }
];

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

function extractDamage(sourceData) {
  const damage = [];
  const system = sourceData.system || {};

  // Check 1: system.damage.parts (older standard)
  if (system.damage && Array.isArray(system.damage.parts)) {
    system.damage.parts.forEach(part => {
      if (Array.isArray(part) && part.length >= 2) {
        damage.push({
          damage_dice: part[0],
          damage_type: {
            index: part[1],
            name: part[1],
            url: `/assets/atlas/damage_types/json/${part[1]}.json`
          }
        });
      } else if (part.formula) {
        damage.push({
          damage_dice: part.formula,
          damage_type: {
            index: part.types?.[0] || 'bludgeoning',
            name: part.types?.[0] || 'bludgeoning',
            url: `/assets/atlas/damage_types/json/${part.types?.[0] || 'bludgeoning'}.json`
          }
        });
      }
    });
  }

  // Check 2: system.damage.base (newer standard)
  if (system.damage && system.damage.base && system.damage.base.denomination) {
    const num = system.damage.base.number || 1;
    const denom = system.damage.base.denomination;
    const dmgType = system.damage.base.types?.[0] || 'bludgeoning';
    const bonus = system.damage.base.bonus ? `+${system.damage.base.bonus}` : '';
    damage.push({
      damage_dice: `${num}d${denom}${bonus}`,
      damage_type: {
        index: dmgType,
        name: dmgType,
        url: `/assets/atlas/damage_types/json/${dmgType}.json`
      }
    });
  }

  // Check 3: Parse activities
  if (system.activities) {
    Object.values(system.activities).forEach(activity => {
      if (activity.damage && Array.isArray(activity.damage.parts)) {
        activity.damage.parts.forEach(part => {
          if (part.formula) {
            const types = part.types || [];
            damage.push({
              damage_dice: part.formula,
              damage_type: {
                index: types[0] || 'bludgeoning',
                name: types[0] || 'bludgeoning',
                url: `/assets/atlas/damage_types/json/${types[0] || 'bludgeoning'}.json`
              }
            });
          }
        });
      }
    });
  }

  // Check 4: If no damage found, try extracting a dice notation from description (as a last resort fallback)
  if (damage.length === 0 && system.description?.value) {
    const desc = system.description.value;
    const diceRegex = /(\d+d\d+)(?:\s*[\+-]\s*(\d+))?\s*(?:<em>)?([a-z]+)?\s*(?:damage)?/gi;
    const match = diceRegex.exec(desc);
    if (match) {
      const dice = match[1] + (match[2] ? `+${match[2]}` : '');
      const type = (match[3] || 'bludgeoning').toLowerCase();
      damage.push({
        damage_dice: dice,
        damage_type: {
          index: type,
          name: type,
          url: `/assets/atlas/damage_types/json/${type}.json`
        }
      });
    }
  }

  return damage;
}

function extractDc(sourceData) {
  const system = sourceData.system || {};
  if (system.activities) {
    for (const activity of Object.values(system.activities)) {
      if (activity.type === 'save' && activity.save) {
        const ability = activity.save.ability || 'dex';
        const formula = activity.save.dc?.formula || '';
        const dcValue = parseInt(formula) || undefined;
        return {
          dc_ability: ability,
          dc_value: dcValue,
          success_type: activity.damage?.onSave || 'half'
        };
      }
    }
  }
  return null;
}

function extractUsage(sourceData) {
  const system = sourceData.system || {};
  const uses = system.uses || {};
  const usage = {};

  if (uses.max) {
    usage.times = parseInt(uses.max) || 1;
    usage.type = 'per_day'; // default fallback
  }

  if (uses.recovery && Array.isArray(uses.recovery)) {
    const rec = uses.recovery[0];
    if (rec && rec.period === 'recharge') {
      usage.type = 'recharge';
      usage.recharge_formula = rec.formula || '6';
    } else if (rec && rec.period === 'lr') {
      usage.type = 'long_rest';
    } else if (rec && rec.period === 'sr') {
      usage.type = 'short_rest';
    }
  } else if (uses.recovery && typeof uses.recovery === 'object') {
    const rec = uses.recovery;
    if (rec.period === 'recharge') {
      usage.type = 'recharge';
      usage.recharge_formula = rec.formula || '6';
    }
  }

  return Object.keys(usage).length > 0 ? usage : null;
}

function extractRange(sourceData) {
  const system = sourceData.system || {};
  let rangeStr = '';

  if (system.activities) {
    for (const activity of Object.values(system.activities)) {
      if (activity.target && activity.target.template) {
        const temp = activity.target.template;
        if (temp.type && temp.size) {
          rangeStr = `${temp.size}-foot ${temp.type}`;
          if (temp.width) {
            rangeStr += ` (width ${temp.width} ft.)`;
          }
          break;
        }
      }
      if (activity.range && activity.range.value) {
        rangeStr = `${activity.range.value} ${activity.range.units || 'ft.'}`;
        break;
      }
    }
  }

  if (!rangeStr && system.range && system.range.value) {
    rangeStr = `${system.range.value} ${system.range.units || 'ft.'}`;
  }

  return rangeStr || null;
}

function mapFeature(sourceData) {
  const name = sourceData.name || 'Unnamed Feature';
  const index = sourceData._id ? sourceData._id.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const system = sourceData.system || {};

  const cleanDesc = cleanHtmlToParagraphs(system.description?.value).join('\n');
  const damage = extractDamage(sourceData);
  const dc = extractDc(sourceData);
  const usage = extractUsage(sourceData);
  const range = extractRange(sourceData);

  return {
    index,
    name: name.toLowerCase(),
    type: sourceData.type || 'feat',
    desc: cleanDesc,
    damage,
    dc,
    usage,
    range,
    image: sourceData.img || '/assets/atlas/features/images/default.webp',
    url: `/assets/atlas/enemies/monsterfeatures/json/${index}.json`,
    updated_at: new Date().toISOString()
  };
}

function processDir(dir, filesArray) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath, filesArray);
    } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      filesArray.push(fullPath);
    }
  });
}

function portAll() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log(`Starting porting of monster features to ${TARGET_DIR}...`);

  const filesArray = [];
  SOURCES.forEach(source => {
    if (fs.existsSync(source.path)) {
      processDir(source.path, filesArray);
    } else {
      console.warn(`Source folder does not exist: ${source.path}`);
    }
  });

  const indexList = [];
  let count = 0;
  filesArray.forEach(filePath => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(fileContent);

      if (parsed) {
        const mapped = mapFeature(parsed);
        const targetPath = path.join(TARGET_DIR, `${mapped.index}.json`);
        fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2), 'utf8');
        count++;

        // Add item to indexList
        indexList.push({
          index: mapped.index,
          name: mapped.name,
          type: mapped.type,
          url: mapped.url,
          image: mapped.image
        });
      }
    } catch (err) {
      console.error(`Failed to port feature file ${filePath}:`, err.message);
    }
  });

  // Write index file
  const indexDir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexList, null, 2), 'utf8');

  console.log(`Successfully migrated ${count} monster features and wrote index!`);
}

portAll();
