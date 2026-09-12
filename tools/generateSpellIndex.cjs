const fs = require('fs');
const path = require('path');

const SPELL_BASE_DIR = path.join(__dirname, '../public/assets/atlas/spell');

function generateIndexForRuleset(rulesetFolder, outputFilename) {
  const jsonDir = path.join(SPELL_BASE_DIR, 'json', rulesetFolder);
  const outputFile = path.join(SPELL_BASE_DIR, outputFilename);

  console.log(`Generating spell index for ${rulesetFolder} -> ${outputFilename}...`);

  if (!fs.existsSync(jsonDir)) {
    console.error(`Directory not found: ${jsonDir}`);
    return;
  }

  const files = fs.readdirSync(jsonDir)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  const index = [];

  files.forEach(file => {
    try {
      const filePath = path.join(jsonDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      index.push({
        index: data.index || path.basename(file, '.json'),
        name: data.name || 'Unknown Spell',
        level: data.level,
        school: data.school?.name || data.school || 'Unknown School',
        classes: data.classes ? data.classes.map(c => c.name || c) : [],
        casting_time: data.casting_time,
        range: data.range,
        duration: data.duration,
        json_path: `/assets/atlas/spell/json/${rulesetFolder}/${path.basename(file)}`,
        ...(data.sprite ? { sprite: data.sprite } : {})
      });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2) + '\n');
  console.log(`Successfully generated spell index (${index.length} spells) at ${outputFile}`);
}

function generateAllIndices() {
  generateIndexForRuleset('14', 'index_14.json');
  generateIndexForRuleset('24', 'index_24.json');
}

generateAllIndices();
