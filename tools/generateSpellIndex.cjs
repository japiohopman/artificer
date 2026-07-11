const fs = require('fs');
const path = require('path');

const SPELL_DIR = path.join(__dirname, '../public/assets/atlas/spell/json');
const OUTPUT_FILE = path.join(__dirname, '../public/assets/atlas/spell/index.json');

function generateIndex() {
  console.log('Generating spell index...');
  
  if (!fs.existsSync(SPELL_DIR)) {
    console.error(`Directory not found: ${SPELL_DIR}`);
    return;
  }

  function getAllJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllJsonFiles(filePath, fileList);
      } else if (file.endsWith('.json')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const files = getAllJsonFiles(SPELL_DIR);
  const index = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      const relativePath = path.relative(SPELL_DIR, file).replace(/\\/g, '/');
      
      index.push({
        index: data.index || path.basename(file, '.json'),
        name: data.name || 'Unknown Spell',
        level: data.level,
        school: data.school?.name || data.school || 'Unknown School',
        classes: data.classes ? data.classes.map(c => c.name || c) : [],
        casting_time: data.casting_time,
        range: data.range,
        duration: data.duration,
        json_path: `/assets/atlas/spell/json/${relativePath}`
      });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Successfully generated spell index with ${index.length} spells at ${OUTPUT_FILE}`);
}

generateIndex();
