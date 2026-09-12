const fs = require('fs');
const path = require('path');

const spritesDir = path.join(__dirname, '../public/assets/atlas/spell/sprites');
const mdFiles = fs.readdirSync(spritesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');

const spellMap = {};

for (const file of mdFiles) {
  const sheetName = file.replace('.md', '.webp');
  const content = fs.readFileSync(path.join(spritesDir, file), 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('|') && !line.includes('Cell') && !line.includes('---')) {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 5) {
        const cell = parseInt(parts[1], 10);
        const spellIndex = parts[4].replace(/`/g, '').trim();
        if (!isNaN(cell) && spellIndex && !spellIndex.startsWith('reserved_slot')) {
          spellMap[spellIndex.toLowerCase()] = { sheet: sheetName, cell };
        }
      }
    }
  }
}

console.log('Total mapped spells from MD files:', Object.keys(spellMap).length);
console.log('Sample entries:', JSON.stringify(Object.entries(spellMap).slice(0, 10), null, 2));

module.exports = spellMap;
