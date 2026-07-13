/**
 * tools/portFeats.cjs
 *
 * Automates the migration of 2014 feats (moving flat files to json/14/)
 * and recursive importing of 2024 feats from Foundry YAML packs to json/24/.
 * Includes HTML paragraph cleaning, icon path normalization, and Smart Merge.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_FEATS_DIR = path.join(__dirname, '../public/assets/atlas/feats/json');

const SOURCES = {
  feats24: path.join(FOUNDRY_ROOT, 'packs/_source/feats24')
};

function normalizeIconPath(img) {
  if (!img) return null;

  let clean = img.trim();

  if (clean.startsWith('systems/dnd5e/icons/svg/')) {
    clean = clean.replace('systems/dnd5e/icons/svg/', 'assets/icons/svg/');
  }

  if (clean.startsWith('icons/svg/')) {
    clean = clean.replace('icons/svg/', 'assets/icons/svg/');
  }

  if (clean.includes('burrow.svg')) {
    clean = clean.replace('burrow.svg', 'statuses/burrowing.svg');
  } else if (clean.includes('whale.svg')) {
    clean = clean.replace('whale.svg', 'statuses/unconscious.svg');
  } else if (clean.includes('mountain.svg')) {
    clean = clean.replace('mountain.svg', 'world_atlas/mountains.svg');
  } else if (clean.includes('wing.svg')) {
    clean = clean.replace('wing.svg', 'statuses/flying.svg');
  } else if (clean.includes('climb.svg')) {
    clean = clean.replace('climb.svg', 'statuses/flying.svg');
  }

  if (clean.startsWith('assets/')) {
    clean = '/' + clean;
  }

  return clean.replace(/\/\/+/g, '/');
}

function cleanHtmlToParagraphs(html) {
  if (!html) return [];

  // Remove script tags and their content securely
  let cleaned = html.replace(/<script[\s\S]*?<\/script\s*>/gi, '');

  // Convert paragraph end tags to linebreaks
  cleaned = cleaned.replace(/<\/p\s*>/gi, '\n');

  // Strip all other HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Explicitly remove all angle brackets to prevent any HTML injection
  cleaned = cleaned.replace(/[<>]/g, '');

  // Sanitize entities to plain text without restoring angle brackets
  cleaned = cleaned
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  return cleaned.split('\n').map(p => p.trim()).filter(p => p.length > 0);
}

function getPreservedData(targetPath) {
  if (fs.existsSync(targetPath)) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.warn(`Could not parse existing asset at ${targetPath} for smart merge: ${e.message}`);
    }
  }
  return null;
}

function migrateExisting14Feats() {
  console.log('--- Migrating Existing 2014 Feats to json/14/ ---');
  const target14Dir = path.join(TARGET_FEATS_DIR, '14');
  if (!fs.existsSync(target14Dir)) {
    fs.mkdirSync(target14Dir, { recursive: true });
  }

  const files = fs.readdirSync(TARGET_FEATS_DIR);
  let count = 0;

  files.forEach(file => {
    const fullPath = path.join(TARGET_FEATS_DIR, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && file.endsWith('.json')) {
      const targetPath = path.join(target14Dir, file);

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(content);

        parsed.url = `/assets/atlas/feats/json/14/${file}`;

        fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
        fs.unlinkSync(fullPath);
        count++;
      } catch (e) {
        console.error(`Error migrating 2014 feat ${file}:`, e.message);
      }
    }
  });

  console.log(`Successfully migrated ${count} existing feats to json/14/!`);
}

function port24Feats() {
  const dir = SOURCES.feats24;
  if (!fs.existsSync(dir)) {
    console.warn(`Source directory for 2024 feats does not exist at: ${dir}`);
    return;
  }

  console.log(`--- Porting 2024 Feats from ${dir} ---`);
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
          const system = parsed.system || {};

          const index = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]/g, '_');

          const relativeSub = path.relative(dir, currentDir).toLowerCase().replace(/\\/g, '/');
          const targetSubdir = path.join(TARGET_FEATS_DIR, '24', relativeSub);

          if (!fs.existsSync(targetSubdir)) {
            fs.mkdirSync(targetSubdir, { recursive: true });
          }

          const targetPath = path.join(targetSubdir, `${index}.json`);
          const preserved = getPreservedData(targetPath) || {};

          const prerequisites = [];
          if (system.requirements) {
            prerequisites.push(system.requirements);
          }

          const mapped = {
            index,
            name: (parsed.name || index).toLowerCase(),
            prerequisites,
            desc: cleanHtmlToParagraphs(system.description?.value || ''),
            feature_specific: preserved.feature_specific || {},
            url: `/assets/atlas/feats/json/24/${relativeSub}/${index}.json`.replace('//', '/'),
            image: preserved.image || (normalizeIconPath(parsed.img) || `/assets/atlas/feats/images/${index}.webp`),
            updated_at: new Date().toISOString()
          };

          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
          count++;
        } catch (e) {
          console.error(`Error porting 2024 feat ${file}:`, e.message);
        }
      }
    });
  }

  traverse(dir);
  console.log(`Successfully ported ${count} 2024 feats!`);
}

function main() {
  migrateExisting14Feats();
  port24Feats();
}

main();
