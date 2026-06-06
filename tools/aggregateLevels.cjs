const fs = require('fs');
const path = require('path');

const CLASSES = [
  'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
  'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
];

const BASE_DIR = path.join(__dirname, '../public/assets/atlas/class/levels');

CLASSES.forEach(cls => {
  const levels = [];
  for (let i = 1; i <= 20; i++) {
    const levelPath = path.join(BASE_DIR, i.toString(), `${cls}_level_${i}.json`);
    if (fs.existsSync(levelPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(levelPath, 'utf8'));
        levels.push(data);
      } catch (e) {
        console.error(`Error reading ${levelPath}: ${e.message}`);
      }
    } else {
      console.warn(`Missing level file: ${levelPath}`);
    }
  }

  if (levels.length > 0) {
    const outputPath = path.join(BASE_DIR, `${cls}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(levels, null, 2) + '\n');
    console.log(`Created ${outputPath}`);
  }
});
