const fs = require('fs');
const path = require('path');

const ENEMIES_JSON_DIR = path.join(__dirname, '../public/assets/atlas/enemies/json');
const CATEGORIES_DIR = path.join(__dirname, '../public/assets/atlas/enemies_categories');

function formatCategoryName(cat) {
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
}

function reconcileCategoriesForVersion(versionFolder) {
  const versionPath = path.join(ENEMIES_JSON_DIR, versionFolder);
  const targetJsonDir = path.join(CATEGORIES_DIR, `json/${versionFolder}`);

  if (!fs.existsSync(versionPath)) return [];
  if (!fs.existsSync(targetJsonDir)) {
    fs.mkdirSync(targetJsonDir, { recursive: true });
  }

  const categoryIndex = [];
  const categories = fs.readdirSync(versionPath).filter(c => {
    if (c.startsWith('.') || c.startsWith('_folder')) return false;
    const p = path.join(versionPath, c);
    return fs.statSync(p).isDirectory();
  }).sort();

  categories.forEach(cat => {
    const catPath = path.join(versionPath, cat);
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.json') && !f.startsWith('.') && !f.startsWith('_folder')).sort();

    const monsters = [];
    files.forEach(file => {
      try {
        const filePath = path.join(catPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        monsters.push({
          name: data.name || path.basename(file, '.json').replace(/_/g, ' '),
          index: data.index || path.basename(file, '.json'),
          size: data.size || 'Medium',
          type: data.type || cat,
          alignment: data.alignment || 'any alignment',
          xp: data.xp || 0,
          challenge_rating: data.challenge_rating || 0,
          json_path: `/assets/atlas/enemies/json/${versionFolder}/${cat}/${file}`,
          image_url: data.imageUrl || data.image || null
        });
      } catch (e) {
        console.error(`Error reading ${file} in ${versionFolder}/${cat}:`, e.message);
      }
    });

    monsters.sort((a, b) => a.index.localeCompare(b.index));

    const categoryObj = {
      name: formatCategoryName(cat),
      index: cat,
      monsters
    };

    const catOutputFile = path.join(targetJsonDir, `${cat}.json`);
    fs.writeFileSync(catOutputFile, JSON.stringify(categoryObj, null, 2), 'utf8');

    categoryIndex.push({ index: cat });
  });

  const indexFilePath = path.join(CATEGORIES_DIR, `index_${versionFolder}.json`);
  fs.writeFileSync(indexFilePath, JSON.stringify(categoryIndex, null, 2), 'utf8');

  return categoryIndex;
}

function reconcileAll() {
  console.log('Reconciling enemy categories for 2014 and 2024...');

  const cat14 = reconcileCategoriesForVersion('14');
  console.log(`Reconciled 2014 enemy categories (${cat14.length} categories)`);

  const cat24 = reconcileCategoriesForVersion('24');
  console.log(`Reconciled 2024 enemy categories (${cat24.length} categories)`);

  const unifiedSet = new Set([...cat14.map(c => c.index), ...cat24.map(c => c.index)]);
  const unifiedIndex = Array.from(unifiedSet).sort().map(cat => ({ index: cat }));

  fs.writeFileSync(path.join(CATEGORIES_DIR, 'index.json'), JSON.stringify(unifiedIndex, null, 2), 'utf8');
  console.log(`Updated unified categories index at ${path.join(CATEGORIES_DIR, 'index.json')}`);
}

if (require.main === module) {
  reconcileAll();
}

module.exports = { reconcileCategoriesForVersion, reconcileAll };
