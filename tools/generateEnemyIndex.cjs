const fs = require('fs');
const path = require('path');

const ENEMY_JSON_DIR = path.join(__dirname, '../public/assets/atlas/enemies/json');
const INDEX_14_FILE = path.join(__dirname, '../public/assets/atlas/enemies/index_14.json');
const INDEX_24_FILE = path.join(__dirname, '../public/assets/atlas/enemies/index_24.json');
const UNIFIED_INDEX_FILE = path.join(__dirname, '../public/assets/atlas/enemies/index.json');

function scanEnemyVersionDir(versionFolder) {
  const versionPath = path.join(ENEMY_JSON_DIR, versionFolder);
  if (!fs.existsSync(versionPath)) return [];

  const index = [];
  const categories = fs.readdirSync(versionPath).filter(c => !c.startsWith('.') && !c.startsWith('_folder')).sort();

  categories.forEach(cat => {
    const catPath = path.join(versionPath, cat);
    if (!fs.statSync(catPath).isDirectory()) return;

    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.json') && !f.startsWith('.') && !f.startsWith('_folder')).sort();
    files.forEach(file => {
      try {
        const filePath = path.join(catPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        index.push({
          index: data.index || path.basename(file, '.json'),
          name: data.name || 'Unknown Enemy',
          ruleset: data.ruleset || (versionFolder === '24' ? '2024' : '2014'),
          category: cat,
          type: data.type || 'Unknown Type',
          alignment: data.alignment || 'Unknown Alignment',
          challenge_rating: data.challenge_rating,
          hit_points: data.hit_points,
          armor_class: Array.isArray(data.armor_class) ? data.armor_class[0]?.value : data.armor_class,
          image: data.image || null,
          imageUrl: data.imageUrl || null,
          json_path: `/assets/atlas/enemies/json/${versionFolder}/${cat}/${file}`
        });
      } catch (e) {
        console.error(`Error parsing ${file} in ${versionFolder}/${cat}:`, e.message);
      }
    });
  });

  index.sort((a, b) => a.index.localeCompare(b.index));
  return index;
}

function generateIndex() {
  console.log('Generating ruleset-aware enemy indexes...');

  const index14 = scanEnemyVersionDir('14');
  fs.writeFileSync(INDEX_14_FILE, JSON.stringify(index14, null, 2), 'utf8');
  console.log(`Generated 2014 index with ${index14.length} entries at ${INDEX_14_FILE}`);

  const index24 = scanEnemyVersionDir('24');
  fs.writeFileSync(INDEX_24_FILE, JSON.stringify(index24, null, 2), 'utf8');
  console.log(`Generated 2024 index with ${index24.length} entries at ${INDEX_24_FILE}`);

  const unifiedIndex = [...index14, ...index24];
  fs.writeFileSync(UNIFIED_INDEX_FILE, JSON.stringify(unifiedIndex, null, 2), 'utf8');
  console.log(`Generated unified index with ${unifiedIndex.length} entries at ${UNIFIED_INDEX_FILE}`);
}

generateIndex();
