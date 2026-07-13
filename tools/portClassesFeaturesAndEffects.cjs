/**
 * tools/portClassesFeaturesAndEffects.cjs
 *
 * Dedicated, highly advanced utility to port Classes, Subclasses, Class Features,
 * and Active Effects/Conditions from Foundry VTT unpacked YAML sources to Artificer JSON.
 *
 * Includes backward compatible Smart Merge and Icon Path Normalization.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const PUBLIC_ROOT = path.join(__dirname, '../public');

const TARGETS = {
  classes: path.join(PUBLIC_ROOT, 'assets/atlas/class/json'),
  subclasses: path.join(PUBLIC_ROOT, 'assets/atlas/subclasses/json'),
  features: path.join(PUBLIC_ROOT, 'assets/atlas/features/json'),
  effects: path.join(PUBLIC_ROOT, 'assets/atlas/effects/json')
};

const SOURCES = {
  classes: path.join(FOUNDRY_ROOT, 'packs/_source/classes'),
  subclasses: path.join(FOUNDRY_ROOT, 'packs/_source/subclasses'),
  features: path.join(FOUNDRY_ROOT, 'packs/_source/classfeatures'),
  effects: path.join(FOUNDRY_ROOT, 'packs/_source/effects')
};

// Normalize icon paths from systems/dnd5e/ or icons/svg/ to /assets/icons/svg/
function normalizeIconPath(img) {
  if (!img) return null;

  let clean = img.trim();

  // If it starts with systems/dnd5e/icons/svg/, map to assets/icons/svg/
  if (clean.startsWith('systems/dnd5e/icons/svg/')) {
    clean = clean.replace('systems/dnd5e/icons/svg/', 'assets/icons/svg/');
  }

  // If it starts with icons/svg/ or systems/dnd5e/icons/ (legacy), clean it up
  if (clean.startsWith('icons/svg/')) {
    clean = clean.replace('icons/svg/', 'assets/icons/svg/');
  }

  // Special overrides for missing icons
  if (clean.includes('burrow.svg')) {
    clean = clean.replace('burrow.svg', 'statuses/burrowing.svg');
  } else if (clean.includes('whale.svg')) {
    clean = clean.replace('whale.svg', 'statuses/unconscious.svg');
  } else if (clean.includes('mountain.svg')) {
    clean = clean.replace('mountain.svg', 'world_atlas/mountains.svg');
  } else if (clean.includes('wing.svg')) {
    clean = clean.replace('wing.svg', 'statuses/flying.svg');
  } else if (clean.includes('climb.svg')) {
    clean = clean.replace('climb.svg', 'statuses/flying.svg');
  }

  if (clean.startsWith('assets/')) {
    clean = '/' + clean;
  }

  return clean.replace(/\/\/+/g, '/');
}

// Check if a path is legacy/invalid
function isLegacyPath(p) {
  if (!p) return false;
  return p.startsWith('systems/dnd5e/') || p.startsWith('icons/svg/') || p.startsWith('public/systems/dnd5e/') || p.startsWith('public/icons/svg/');
}

// Clean HTML to paragraphs
function cleanHtmlToParagraphs(html) {
  if (!html) return [];
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<script/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '\n').replace(/<p>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  return cleaned.split('\n').map(p => p.trim()).filter(p => p.length > 0);
}

// Smart merge helper
function getPreservedData(targetPath) {
  if (fs.existsSync(targetPath)) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.warn(`Could not parse existing asset at ${targetPath} for smart merge: ${e.message}`);
    }
  }
  return null;
}

// 1. Port Classes
function portClasses() {
  const dir = SOURCES.classes;
  if (!fs.existsSync(dir)) return;

  console.log(`Porting Classes from ${dir}...`);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const parsed = yaml.load(content);
      const system = parsed.system || {};

      const index = path.basename(file, path.extname(file)).toLowerCase();
      const targetPath = path.join(TARGETS.classes, `${index}.json`);
      const preserved = getPreservedData(targetPath) || {};

      const hitDieStr = system.hitDice || 'd8';
      const hitDieVal = parseInt(hitDieStr.replace('d', '')) || 8;

      const mapped = {
        index,
        name: (parsed.name || index).toLowerCase(),
        hit_die: hitDieVal,
        proficiency_choices: preserved.proficiency_choices || [],
        proficiencies: preserved.proficiencies || [],
        saving_throws: preserved.saving_throws || [],
        starting_equipment: preserved.starting_equipment || [],
        starting_equipment_options: preserved.starting_equipment_options || [],
        class_levels: preserved.class_levels || `/assets/atlas/class/levels/${index}.json`,
        multi_classing: preserved.multi_classing || {},
        subclasses: preserved.subclasses || [],
        url: `/assets/atlas/class/json/${index}.json`,
        updated_at: new Date().toISOString(),
        image: (preserved.image && !isLegacyPath(preserved.image)) ? preserved.image : (normalizeIconPath(parsed.img) || `/assets/atlas/ui/official/classes/${index}.webp`)
      };

      if (!fs.existsSync(TARGETS.classes)) fs.mkdirSync(TARGETS.classes, { recursive: true });
      fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.error(`Error porting Class ${file}:`, e.message);
    }
  });
}

// 2. Port Subclasses
function portSubclasses() {
  const dir = SOURCES.subclasses;
  if (!fs.existsSync(dir)) return;

  console.log(`Porting Subclasses from ${dir}...`);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const parsed = yaml.load(content);
      const system = parsed.system || {};

      const index = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]/g, '_');
      const targetPath = path.join(TARGETS.subclasses, `${index}.json`);
      const preserved = getPreservedData(targetPath) || {};

      const mapped = {
        index,
        name: (parsed.name || index).toLowerCase(),
        class: {
          index: (system.classIdentifier || '').toLowerCase(),
          name: (system.classIdentifier || '').toLowerCase(),
          url: `/assets/atlas/class/json/${(system.classIdentifier || '').toLowerCase()}.json`
        },
        desc: cleanHtmlToParagraphs(system.description?.value),
        url: `/assets/atlas/subclasses/json/${index}.json`,
        updated_at: new Date().toISOString(),
        image: (preserved.image && !isLegacyPath(preserved.image)) ? preserved.image : (normalizeIconPath(parsed.img) || `/assets/atlas/subclasses/images/${index}.webp`)
      };

      if (!fs.existsSync(TARGETS.subclasses)) fs.mkdirSync(TARGETS.subclasses, { recursive: true });
      fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.error(`Error porting Subclass ${file}:`, e.message);
    }
  });
}

// 3. Port Class Features (recursively)
function portClassFeatures() {
  const dir = SOURCES.features;
  if (!fs.existsSync(dir)) return;

  console.log(`Porting Class Features from ${dir}...`);
  let count = 0;

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const parsed = yaml.load(content);
          const system = parsed.system || {};

          const index = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]/g, '_');
          const targetPath = path.join(TARGETS.features, `${index}.json`);
          const preserved = getPreservedData(targetPath) || {};

          // Extract level and class from system.requirements (e.g. "Fighter 2" or "Rogue 3")
          const req = system.requirements || '';
          const matchLevel = req.match(/\d+/);
          const level = matchLevel ? parseInt(matchLevel[0]) : 1;

          const matchClass = req.match(/^[a-zA-Z]+/);
          const classIndex = matchClass ? matchClass[0].toLowerCase() : 'fighter';

          const mapped = {
            index,
            class: {
              index: classIndex,
              name: classIndex,
              url: `/assets/atlas/class/json/${classIndex}.json`
            },
            name: (parsed.name || index).toLowerCase(),
            level,
            prerequisites: [],
            desc: cleanHtmlToParagraphs(system.description?.value),
            url: `/assets/atlas/features/json/${index}.json`,
            updated_at: new Date().toISOString(),
            image: (preserved.image && !isLegacyPath(preserved.image)) ? preserved.image : (normalizeIconPath(parsed.img) || `/assets/atlas/features/images/${index}.webp`),
            feature_specific: preserved.feature_specific || {}
          };

          if (!fs.existsSync(TARGETS.features)) fs.mkdirSync(TARGETS.features, { recursive: true });
          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
          count++;
        } catch (e) {
          console.error(`Error porting Feature ${file}:`, e.message);
        }
      }
    });
  }

  traverse(dir);
  console.log(`Ported ${count} Class Features successfully!`);
}

// 4. Port Active Effects & Conditions
function portEffects() {
  const dir = SOURCES.effects;
  if (!fs.existsSync(dir)) return;

  console.log(`Porting Active Effects from ${dir}...`);
  let count = 0;

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const parsed = yaml.load(content);
          const system = parsed.system || {};

          const index = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          // Preserve exact subfolder structure under TARGETS.effects
          const relativeSub = path.relative(dir, currentDir).toLowerCase().replace(/\\/g, '/');
          const targetSubdir = path.join(TARGETS.effects, relativeSub);
          
          if (!fs.existsSync(targetSubdir)) {
            fs.mkdirSync(targetSubdir, { recursive: true });
          }

          const targetPath = path.join(targetSubdir, `${index}.json`);
          const preserved = getPreservedData(targetPath) || {};

          // Extract system modifications / changes
          const changes = [];
          const sourceChanges = system.changes || parsed.changes || [];
          if (Array.isArray(sourceChanges)) {
            sourceChanges.forEach(ch => {
              changes.push({
                key: ch.key,
                value: ch.value,
                mode: ch.mode || ch.type || 'upgrade'
              });
            });
          }

          const mapped = {
            index,
            name: (parsed.name || index).toLowerCase(),
            type: parsed.type || 'base',
            disabled: parsed.disabled === true,
            duration: parsed.duration || { value: null, units: 'seconds' },
            description: cleanHtmlToParagraphs(parsed.description || ''),
            changes,
            statuses: parsed.statuses || [],
            url: `/assets/atlas/effects/json/${relativeSub}/${index}.json`.replace('//', '/'),
            image: (preserved.image && !isLegacyPath(preserved.image)) ? preserved.image : (normalizeIconPath(parsed.img) || `/assets/atlas/effects/images/${index}.webp`),
            updated_at: new Date().toISOString()
          };

          fs.writeFileSync(targetPath, JSON.stringify(mapped, null, 2) + '\n', 'utf8');
          count++;
        } catch (e) {
          console.error(`Error porting Active Effect ${file}:`, e.message);
        }
      }
    });
  }

  traverse(dir);
  console.log(`Ported ${count} Active Effects successfully!`);
}

function main() {
  console.log('--- Starting Porting of Classes, Features, and Effects ---');
  portClasses();
  portSubclasses();
  portClassFeatures();
  portEffects();
  console.log('--- Porting Step Completed Successfully ---');
}

main();
