const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');
const MAGIC_ITEMS_DIR = path.join(__dirname, '../public/assets/atlas/magic_items/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/equipment/index.json');

function generateIndex() {
  console.log('Generating equipment and magic items index...');
  
  const index = [];
  const dirs = [
    { path: EQUIPMENT_DIR, prefix: '/assets/atlas/equipment/json/' },
    { path: MAGIC_ITEMS_DIR, prefix: '/assets/atlas/magic_items/json/' }
  ];

  dirs.forEach(dirInfo => {
    if (!fs.existsSync(dirInfo.path)) {
      console.warn(`Directory not found: ${dirInfo.path}`);
      return;
    }

    const files = fs.readdirSync(dirInfo.path).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dirInfo.path, file), 'utf8');
        const data = JSON.parse(content);

        index.push({
          index: data.index || path.basename(file, '.json'),
          name: data.name || 'Unknown Item',
          kind: data.kind || 'unknown',
          equipment_category: data.equipment_category?.name || data.equipment_category || 'Other',
          rarity: data.rarity || 'Common',
          cost: data.cost,
          weight: data.weight,
          imageUrl: data.imageUrl || data.image || null,
          json_path: `${dirInfo.prefix}${file}`
        });
      } catch (e) {
        console.error(`Error parsing ${file} in ${dirInfo.path}:`, e.message);
      }
    });
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Successfully generated index with ${index.length} items at ${OUTPUT_FILE}`);
}

generateIndex();
