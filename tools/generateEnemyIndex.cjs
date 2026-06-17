const fs = require('fs');
const path = require('path');

const ENEMY_DIR = path.join(__dirname, '../public/assets/atlas/enemies/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/enemies/index.json');

function generateIndex() {
  console.log('Generating enemy index...');
  
  if (!fs.existsSync(ENEMY_DIR)) {
    console.error(`Directory not found: ${ENEMY_DIR}`);
    return;
  }

  const files = fs.readdirSync(ENEMY_DIR).filter(f => f.endsWith('.json'));
  const index = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(ENEMY_DIR, file), 'utf8');
      const data = JSON.parse(content);
      
      index.push({
        index: data.index || path.basename(file, '.json'),
        name: data.name || 'Unknown Enemy',
        type: data.type || 'Unknown Type',
        alignment: data.alignment || 'Unknown Alignment',
        challenge_rating: data.challenge_rating,
        hit_points: data.hit_points,
        armor_class: Array.isArray(data.armor_class) ? data.armor_class[0]?.value : data.armor_class,
        imageUrl: data.imageUrl || data.image || null,
        json_path: `/assets/atlas/enemies/json/${file}`
      });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Successfully generated enemy index with ${index.length} enemies at ${OUTPUT_FILE}`);
}

generateIndex();
