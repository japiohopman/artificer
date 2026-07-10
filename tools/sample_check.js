const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x/packs/_source');

let output = '';

['classfeatures', 'feats24'].forEach(dir => {
  const p = path.join(base, dir);
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    output += `--- ${dir} files (total: ${files.length}) ---\n`;
    const slice = files.slice(0, 5);
    output += JSON.stringify(slice, null, 2) + '\n\n';
    
    if (slice.length > 0) {
      const firstFile = path.join(p, slice[0]);
      output += `=== Sample: ${slice[0]} ===\n`;
      output += fs.readFileSync(firstFile, 'utf8') + '\n\n';
    }
  } else {
    output += `${dir} folder does not exist at ${p}\n\n`;
  }
});

const targetPath = path.join(__dirname, '../sample_check.txt');
fs.writeFileSync(targetPath, output, 'utf8');
console.log('Sample check written to ' + targetPath);
