const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');

function normalizeEquipment() {
  console.log('Normalizing equipment JSON files...');
  
  if (!fs.existsSync(EQUIPMENT_DIR)) {
    console.error(`Directory not found: ${EQUIPMENT_DIR}`);
    return;
  }

  const files = fs.readdirSync(EQUIPMENT_DIR).filter(f => f.endsWith('.json'));
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(EQUIPMENT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let data = JSON.parse(content);
      let changed = false;

      // 1. Fix imageUrl and image
      if (data.image && data.image.startsWith('public/')) {
        data.image = data.image.replace('public/', '/');
        changed = true;
      }
      if (data.imageUrl && data.imageUrl.startsWith('public/')) {
        data.imageUrl = data.imageUrl.replace('public/', '/');
        changed = true;
      }

      // 2. Fix nested urls
      const fixUrls = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (key === 'url' && typeof obj[key] === 'string' && obj[key].startsWith('public/')) {
            obj[key] = obj[key].replace('public/', '/');
            changed = true;
          } else if (typeof obj[key] === 'object') {
            fixUrls(obj[key]);
          }
        }
      };
      fixUrls(data);

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        fixedCount++;
      }
    } catch (e) {
      console.error(`Error normalizing ${file}:`, e.message);
    }
  });

  console.log(`Successfully normalized ${fixedCount} equipment files.`);
}

normalizeEquipment();
