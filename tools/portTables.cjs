/**
 * tools/portTables.cjs
 *
 * Dedicated utility to port roll tables from both 2014 (5e) and 2024 rules
 * into a clean, structured JSON format with backward compatible smart merge.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_TABLES_DIR = path.join(__dirname, '../public/assets/atlas/tables/json');

const SOURCES = {
  rules14: {
    dir: path.join(FOUNDRY_ROOT, 'packs/_source/tables'),
    rulesVersion: '14'
  },
  rules24: {
    dir: path.join(FOUNDRY_ROOT, 'packs/_source/tables24'),
    rulesVersion: '24'
  }
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

function mapTable(parsedYaml, rulesVersion, subfolder, indexName) {
  const name = parsedYaml.name || indexName.replace(/[-_]/g, ' ');
  const description = parsedYaml.description ? cleanHtmlToParagraphs(parsedYaml.description) : [];

  const results = [];
  if (Array.isArray(parsedYaml.results)) {
    parsedYaml.results.forEach(res => {
      const resText = cleanHtmlToParagraphs(res.description || res.text || '').join(' ') || res.name || '';
      results.push({
        range: res.range || [1, 1],
        weight: res.weight !== undefined ? res.weight : 1,
        text: resText,
        img: normalizeIconPath(res.img) || '/assets/icons/svg/d20-black.svg',
        type: res.type || 'text',
        documentCollection: res.documentCollection || undefined,
        documentId: res.documentId || undefined
      });
    });
  }

  return {
    index: indexName,
    name: name.toLowerCase(),
    img: normalizeIconPath(parsedYaml.img) || '/assets/icons/svg/d20-black.svg',
    description,
    results,
    url: `/assets/atlas/tables/json/${rulesVersion}/${subfolder}/${indexName}.json`.replace('//', '/'),
    updated_at: new Date().toISOString()
  };
}

function portDirectory(sourceConfig) {
  const { dir, rulesVersion } = sourceConfig;
  if (!fs.existsSync(dir)) {
    console.warn(`Source directory not found: ${dir}. Skipping.`);
    return;
  }

  console.log(`Porting tables from ${dir} (Rules: ${rulesVersion})...`);
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

          const rel = path.relative(dir, currentDir);
          const relativeSub = rel ? rel.replace(/\\/g, '/').toLowerCase() : 'other';

          const indexName = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]/g, '_');

          const targetSubdir = path.join(TARGET_TABLES_DIR, rulesVersion, relativeSub);
          if (!fs.existsSync(targetSubdir)) {
            fs.mkdirSync(targetSubdir, { recursive: true });
          }

          const targetPath = path.join(targetSubdir, `${indexName}.json`);
          const mapped = mapTable(parsed, rulesVersion, relativeSub, indexName);

          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
          count++;
        } catch (e) {
          console.error(`Error porting table ${file}:`, e.message);
        }
      }
    });
  }

  traverse(dir);
  console.log(`Ported ${count} tables successfully for Rules: ${rulesVersion}!`);
}

function main() {
  console.log('--- Starting Tables Porting ---');
  portDirectory(SOURCES.rules14);
  portDirectory(SOURCES.rules24);
  console.log('--- Tables Porting Completed Successfully ---');
}

main();
