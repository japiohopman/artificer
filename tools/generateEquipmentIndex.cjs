const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');
const MAGIC_ITEMS_DIR = path.join(__dirname, '../public/assets/atlas/magic_items/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/equipment/index.json');

function getFilesRecursively(dir, rootDir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, rootDir));
    } else {
      if (file.endsWith('.json') && file !== '_folder.json') {
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        results.push({ name: file, fullPath, relativePath });
      }
    }
  });
  return results;
}

function generateIndex() {
  console.log('Generating equipment and magic items index (recursively)...');
  
  const index = [];
  const dirs = [
    { path: EQUIPMENT_DIR, prefix: '/assets/atlas/equipment/json/' },
    { path: MAGIC_ITEMS_DIR, prefix: '/assets/atlas/magic_items/json/' }
  ];

  dirs.forEach(dirInfo => {
    const files = getFilesRecursively(dirInfo.path, dirInfo.path);
    files.forEach(fileInfo => {
      try {
        const content = fs.readFileSync(fileInfo.fullPath, 'utf8');
        const data = JSON.parse(content);

        // Deduplicate: ignore if we already registered an item with the exact same index
        const itemIndex = data.index || path.basename(fileInfo.name, '.json');
        if (index.some(item => item.index === itemIndex)) {
          return;
        }

        index.push({
          index: itemIndex,
          name: data.name || 'Unknown Item',
          kind: data.kind || 'unknown',
          equipment_category: data.equipment_category?.name || data.equipment_category || 'Other',
          rarity: typeof data.rarity === 'object' ? (data.rarity.name || 'Common') : (data.rarity || 'Common'),
          cost: data.cost,
          weight: data.weight,
          imageUrl: data.imageUrl || data.image || null,
          json_path: `${dirInfo.prefix}${fileInfo.relativePath}`
        });
      } catch (e) {
        console.error(`Error parsing ${fileInfo.name} in ${dirInfo.path}:`, e.message);
      }
    });
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2) + '\n');
  console.log(`Successfully generated index recursively with ${index.length} items at ${OUTPUT_FILE}`);
}

generateIndex();
