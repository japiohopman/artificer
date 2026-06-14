const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'public/assets/atlas');

const MAP = {
  'strength.json': 'str.json',
  'dexterity.json': 'dex.json',
  'constitution.json': 'con.json',
  'intelligence.json': 'int.json',
  'wisdom.json': 'wis.json',
  'charisma.json': 'cha.json'
};

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldName, newName] of Object.entries(MAP)) {
        if (content.includes(oldName)) {
          content = content.split(oldName).join(newName);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  });
}

walk(BASE_DIR);
console.log('Fixed ability score URLs');
