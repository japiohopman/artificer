const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');
const MAGIC_ITEMS_DIR = path.join(__dirname, '../public/assets/atlas/magic_items/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/equipment/index.json');

function scanDirectoryRecursive(dirPath) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const list = fs.readdirSync(dirPath);
  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectoryRecursive(filePath));
    } else if (file.endsWith('.json') && !file.startsWith('_') && file !== 'index.json') {
      results.push({
        filePath,
        relativePath: path.relative(path.join(__dirname, '../public'), filePath)
      });
    }
  });
  return results;
}

function generateIndex() {
  console.log('Generating recursive equipment and magic items index...');
  
  const index = [];
  const dirs = [EQUIPMENT_DIR, MAGIC_ITEMS_DIR];

  dirs.forEach(baseDir => {
    const scanResults = scanDirectoryRecursive(baseDir);
    scanResults.forEach(result => {
      try {
        const content = fs.readFileSync(result.filePath, 'utf8');
        const data = JSON.parse(content);

        const cleanJsonPath = `/${result.relativePath.replace(/\\/g, '/')}`;

        let imageUrl = data.imageUrl || data.image || null;
        if (imageUrl && imageUrl.includes('/assets/atlas/equipment/images/')) {
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1];
          if (filename.includes('-')) {
            parts[parts.length - 1] = filename.replace(/-/g, '_');
            imageUrl = parts.join('/');
          }
        }

        index.push({
          index: data.index || path.basename(result.filePath, '.json'),
          name: data.name || 'Unknown Item',
          kind: data.kind || 'unknown',
          equipment_category: data.equipment_category?.name || data.equipment_category || 'Other',
          rarity: typeof data.rarity === 'object' ? (data.rarity.name || 'Common') : (data.rarity || 'Common'),
          cost: data.cost,
          weight: data.weight,
          imageUrl: imageUrl,
          json_path: cleanJsonPath
        });
      } catch (e) {
        console.error(`Error parsing ${result.filePath}:`, e.message);
      }
    });
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2) + '\n');
  console.log(`Successfully generated index with ${index.length} items at ${OUTPUT_FILE}`);
}

generateIndex();
