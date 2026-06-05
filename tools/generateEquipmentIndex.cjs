const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/equipment/index.json');

function generateIndex() {
  console.log('Generating equipment index...');
  
  if (!fs.existsSync(EQUIPMENT_DIR)) {
    console.error(`Directory not found: ${EQUIPMENT_DIR}`);
    return;
  }

  const files = fs.readdirSync(EQUIPMENT_DIR).filter(f => f.endsWith('.json'));
  const index = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(EQUIPMENT_DIR, file), 'utf8');
      const data = JSON.parse(content);
      
      // Extract essential metadata for the index
      index.push({
        index: data.index || path.basename(file, '.json'),
        name: data.name || 'Unknown Item',
        kind: data.kind || 'unknown',
        equipment_category: data.equipment_category?.name || data.equipment_category || 'Other',
        rarity: data.rarity || 'Common',
        cost: data.cost,
        weight: data.weight,
        imageUrl: data.imageUrl || data.image || null,
        path: `/assets/atlas/equipment/json/${file}`
      });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Successfully generated index with ${index.length} items at ${OUTPUT_FILE}`);
}

generateIndex();
