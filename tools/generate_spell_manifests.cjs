const fs = require('fs');
const path = require('path');

const spellsDir = path.resolve(__dirname, '../public/assets/atlas/spell/json');
const outputDir = path.resolve(__dirname, '../public/assets/atlas/spell/sprites');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all JSON files in public/assets/atlas/spell/json
const files = fs.readdirSync(spellsDir).filter(f => f.endsWith('.json'));

const spellsByLevel = {};

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(spellsDir, file), 'utf8');
    const data = JSON.parse(raw);
    if (!data || !data.index || data.level === undefined) continue;

    const level = Number(data.level);
    if (!spellsByLevel[level]) {
      spellsByLevel[level] = [];
    }

    const schoolName = typeof data.school === 'string' ? data.school : (data.school?.name || 'Arcane');
    const classList = Array.isArray(data.classes)
      ? data.classes.map(c => typeof c === 'string' ? c : c.index || c.name || '').filter(Boolean).join(', ')
      : '';

    spellsByLevel[level].push({
      index: data.index,
      name: data.name || data.index,
      school: schoolName,
      classes: classList,
      level
    });
  } catch (err) {}
}

const masterIndexLines = [
  '# Spell Sprite Sheets Master Manifest & Layout Specifications',
  '',
  'This directory contains complete visual 4×4 grid sprite layout specifications for ALL spell levels (Cantrips to 9th-Level).',
  '',
  '## Grid Specifications',
  '- **Grid Layout**: 4 columns × 4 rows (16 cells per spritesheet)',
  '- **Cell Size**: 512 × 512 pixels',
  '- **Recommended Canvas Size**: 2048 × 2048 pixels',
  '- **File Format**: Transparent WebP or PNG with alpha channel',
  '- **Formula**: `Row = Math.floor(cell_index / 4)`, `Col = cell_index % 4`',
  '',
  '## Spritesheet Layout Files',
  ''
];

const generatedManifests = [];

// Sort levels 0 to 9
const levels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);

for (const lvl of levels) {
  const list = spellsByLevel[lvl];
  // Sort alphabetically by name
  list.sort((a, b) => a.name.localeCompare(b.name));

  const chunkSize = 16;
  const levelPrefix = lvl === 0 ? 'cantrips_sheet' : `spells_level${lvl}_sheet`;
  const levelLabel = lvl === 0 ? 'Cantrips (Level 0)' : `Level ${lvl} Spells`;

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const sheetNum = String(Math.floor(i / chunkSize) + 1).padStart(2, '0');
    const sheetId = `${levelPrefix}_${sheetNum}`;
    const mdFilename = `${sheetId}.md`;
    const webpFilename = `${sheetId}.webp`;

    const mdLines = [
      `# Spritesheet Layout: ${webpFilename}`,
      '',
      `- **File**: \`public/assets/atlas/spell/sprites/${webpFilename}\``,
      `- **Category**: ${levelLabel}`,
      `- **Grid**: 4 × 4 (16 cells)`,
      `- **Cell Size**: 512px × 512px`,
      `- **Total Spells in Sheet**: ${chunk.length} / 16`,
      '',
      '| Cell | Row | Col | Spell Canonical Index | Spell Name | School | Classes | Recommended Visual Concept |',
      '|------|-----|-----|----------------------|------------|--------|---------|---------------------------|'
    ];

    chunk.forEach((spell, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const visualConcept = `${spell.name} spell icon (${spell.school})`;
      mdLines.push(`| ${idx} | ${row} | ${col} | \`${spell.index}\` | ${spell.name} | ${spell.school} | ${spell.classes || 'Arcane'} | ${visualConcept} |`);
    });

    // If chunk is less than 16, pad empty reserved slots
    if (chunk.length < chunkSize) {
      for (let idx = chunk.length; idx < chunkSize; idx++) {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        mdLines.push(`| ${idx} | ${row} | ${col} | \`reserved_slot_${idx}\` | Reserved Slot | Utility | Universal | Reserved for future spell variants |`);
      }
    }

    fs.writeFileSync(path.join(outputDir, mdFilename), mdLines.join('\n'), 'utf8');
    generatedManifests.push({ sheetId, mdFilename, webpFilename, levelLabel, count: chunk.length });

    masterIndexLines.push(`- [${mdFilename}](./${mdFilename}) — ${levelLabel} (Sheet ${sheetNum}, ${chunk.length} spells)`);
  }
}

fs.writeFileSync(path.join(outputDir, 'INDEX.md'), masterIndexLines.join('\n'), 'utf8');

console.log(`Generated ${generatedManifests.length} sprite manifest layout files in ${outputDir}`);
