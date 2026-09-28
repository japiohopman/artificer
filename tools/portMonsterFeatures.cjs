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
const { execSync } = require('child_process');

const PINNED_RELEASE_TAG = 'release-6.0.4';
const FOUNDRY_TMP_DIR = '/tmp/f5e_audit_pinned/packs/_source';

function ensureFoundrySource() {
  if (process.env.FOUNDRY_SOURCE_DIR && fs.existsSync(process.env.FOUNDRY_SOURCE_DIR)) {
    return process.env.FOUNDRY_SOURCE_DIR;
  }
  if (fs.existsSync(FOUNDRY_TMP_DIR)) {
    return FOUNDRY_TMP_DIR;
  }
  console.log(`Downloading pinned Foundry release (${PINNED_RELEASE_TAG}) source tree to /tmp/f5e_audit_pinned...`);
  fs.mkdirSync('/tmp/f5e_audit_pinned', { recursive: true });
  try {
    execSync(`curl -sL https://github.com/foundryvtt/dnd5e/archive/refs/tags/${PINNED_RELEASE_TAG}.tar.gz | tar -xz --strip-components=1 -C /tmp/f5e_audit_pinned "dnd5e-${PINNED_RELEASE_TAG}/packs/_source"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to download Foundry source archive:', e.message);
  }
  return FOUNDRY_TMP_DIR;
}

const FOUNDRY_ROOT = ensureFoundrySource();
const TARGET_DIR_14 = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/json/14');
const TARGET_DIR_24 = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/json/24');
const INDEX_PATH_14 = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/index_14.json');
const INDEX_PATH_24 = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/index_24.json');
const UNIFIED_INDEX_PATH = path.join(__dirname, '../public/assets/atlas/enemies/monsterfeatures/index.json');

// Clean HTML to paragraphs securely
function cleanHtmlToParagraphs(html) {
  if (!html) return [];

  let cleaned = String(html);
  cleaned = cleaned.replace(/<\/?p\b[^>]*>/gi, '\n')
                   .replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
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

  // Check 4: If no damage found, try extracting a dice notation from description
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
    usage.type = 'per_day';
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

function mapFeature(sourceData, ruleset, category) {
  const name = sourceData.name || 'Unnamed Feature';
  const index = sourceData._id ? sourceData._id.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const system = sourceData.system || {};

  const cleanDesc = cleanHtmlToParagraphs(system.description?.value).join('\n');
  const damage = extractDamage(sourceData);
  const dc = extractDc(sourceData);
  const usage = extractUsage(sourceData);
  const range = extractRange(sourceData);

  const versionFolder = ruleset === '2024' ? '24' : '14';
  const urlPath = category
    ? `/assets/atlas/enemies/monsterfeatures/json/${versionFolder}/${category}/${index}.json`
    : `/assets/atlas/enemies/monsterfeatures/json/${versionFolder}/${index}.json`;

  return {
    index,
    name: name.toLowerCase(),
    ruleset,
    category: category || null,
    type: sourceData.type || 'feat',
    desc: cleanDesc,
    damage,
    dc,
    usage,
    range,
    image: sourceData.img || '/assets/atlas/features/images/default.webp',
    url: urlPath,
    updated_at: '2026-09-27T00:00:00.000Z'
  };
}

function port2014Features() {
  const sourceDir = path.join(FOUNDRY_ROOT, 'monsterfeatures');
  if (!fs.existsSync(sourceDir)) {
    console.warn(`2014 monsterfeatures directory not found: ${sourceDir}`);
    return [];
  }
  if (!fs.existsSync(TARGET_DIR_14)) {
    fs.mkdirSync(TARGET_DIR_14, { recursive: true });
  }

  const indexList = [];
  let count = 0;
  const files = fs.readdirSync(sourceDir).filter(f => (f.endsWith('.yml') || f.endsWith('.yaml')) && !f.startsWith('_folder') && !f.startsWith('.'));

  files.forEach(f => {
    try {
      const content = fs.readFileSync(path.join(sourceDir, f), 'utf8');
      const parsed = yaml.load(content);
      if (parsed) {
        const mapped = mapFeature(parsed, '2014');
        const targetPath = path.join(TARGET_DIR_14, `${mapped.index}.json`);
        if (fs.existsSync(targetPath)) {
          try {
            const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
            if (existing.updated_at) mapped.updated_at = existing.updated_at;
          } catch (e) {}
        }
        fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2), 'utf8');
        count++;

        indexList.push({
          index: mapped.index,
          name: mapped.name,
          ruleset: '2014',
          type: mapped.type,
          url: mapped.url,
          image: mapped.image
        });
      }
    } catch (err) {
      console.error(`Failed to port 2014 feature ${f}:`, err.message);
    }
  });

  indexList.sort((a, b) => a.index.localeCompare(b.index));
  fs.writeFileSync(INDEX_PATH_14, JSON.stringify(indexList, null, 2), 'utf8');
  console.log(`Ported ${count} 2014 monster features into ${TARGET_DIR_14}`);
  return indexList;
}

function port2024Features() {
  const sourceDir = path.join(FOUNDRY_ROOT, 'monsterfeatures24');
  if (!fs.existsSync(sourceDir)) {
    console.warn(`2024 monsterfeatures24 directory not found: ${sourceDir}`);
    return [];
  }
  if (!fs.existsSync(TARGET_DIR_24)) {
    fs.mkdirSync(TARGET_DIR_24, { recursive: true });
  }

  const indexList = [];
  let count = 0;
  const categories = fs.readdirSync(sourceDir).filter(c => !c.startsWith('_folder') && !c.startsWith('.'));

  categories.forEach(cat => {
    const catSourceDir = path.join(sourceDir, cat);
    if (!fs.statSync(catSourceDir).isDirectory()) return;

    const catTargetDir = path.join(TARGET_DIR_24, cat);
    if (!fs.existsSync(catTargetDir)) {
      fs.mkdirSync(catTargetDir, { recursive: true });
    }

    const files = fs.readdirSync(catSourceDir).filter(f => (f.endsWith('.yml') || f.endsWith('.yaml')) && !f.startsWith('_folder') && !f.startsWith('.'));
    files.forEach(f => {
      try {
        const content = fs.readFileSync(path.join(catSourceDir, f), 'utf8');
        const parsed = yaml.load(content);
        if (parsed) {
          const mapped = mapFeature(parsed, '2024', cat);
          const targetPath = path.join(catTargetDir, `${mapped.index}.json`);
          if (fs.existsSync(targetPath)) {
            try {
              const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
              if (existing.updated_at) mapped.updated_at = existing.updated_at;
            } catch (e) {}
          }
          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2), 'utf8');
          count++;

          indexList.push({
            index: mapped.index,
            name: mapped.name,
            ruleset: '2024',
            category: cat,
            type: mapped.type,
            url: mapped.url,
            image: mapped.image
          });
        }
      } catch (err) {
        console.error(`Failed to port 2024 feature ${f}:`, err.message);
      }
    });
  });

  indexList.sort((a, b) => a.index.localeCompare(b.index));
  fs.writeFileSync(INDEX_PATH_24, JSON.stringify(indexList, null, 2), 'utf8');
  console.log(`Ported ${count} 2024 monster features into ${TARGET_DIR_24}`);
  return indexList;
}

function portAll() {
  console.log('Starting migration of ruleset-aware monster features...');
  const list14 = port2014Features();
  const list24 = port2024Features();

  const unifiedList = [...list14, ...list24];
  fs.writeFileSync(UNIFIED_INDEX_PATH, JSON.stringify(unifiedList, null, 2), 'utf8');
  console.log(`Successfully migrated ${unifiedList.length} total monster features and wrote index files!`);
}

portAll();
