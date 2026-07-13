/**
 * tools/generateCoreIndexes.cjs
 *
 * Compiles index files for Classes, Subclasses, Class Features, and Active Effects
 * to support instant, dynamic, decoupled runtime loading inside the game client.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

const CONFIGS = [
  {
    name: 'Classes',
    dir: path.join(PUBLIC_DIR, 'assets/atlas/class/json'),
    output: path.join(PUBLIC_DIR, 'assets/atlas/class/index.json'),
    mapper: (data, relativePath) => ({
      index: data.index,
      name: data.name,
      hit_die: data.hit_die,
      json_path: relativePath,
      image: data.image
    })
  },
  {
    name: 'Subclasses',
    dir: path.join(PUBLIC_DIR, 'assets/atlas/subclasses/json'),
    output: path.join(PUBLIC_DIR, 'assets/atlas/subclasses/index.json'),
    mapper: (data, relativePath) => ({
      index: data.index,
      name: data.name,
      class: data.class?.index || 'fighter',
      json_path: relativePath,
      image: data.image
    })
  },
  {
    name: 'Class Features',
    dir: path.join(PUBLIC_DIR, 'assets/atlas/features/json'),
    output: path.join(PUBLIC_DIR, 'assets/atlas/features/index.json'),
    mapper: (data, relativePath) => ({
      index: data.index,
      name: data.name,
      class: data.class?.index || 'fighter',
      level: data.level || 1,
      json_path: relativePath,
      image: data.image
    })
  },
  {
    name: 'Active Effects',
    dir: path.join(PUBLIC_DIR, 'assets/atlas/effects/json'),
    output: path.join(PUBLIC_DIR, 'assets/atlas/effects/index.json'),
    mapper: (data, relativePath) => ({
      index: data.index,
      name: data.name,
      type: data.type || 'base',
      disabled: data.disabled === true,
      json_path: relativePath,
      image: data.image
    })
  }
];

function getJsonFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getJsonFilesRecursively(fullPath));
    } else if (file.endsWith('.json')) {
      results.push(fullPath);
    }
  });
  return results;
}

function generate() {
  console.log('--- Generating Core Indexes (Classes, Subclasses, Features, Effects) ---');

  CONFIGS.forEach(cfg => {
    if (!fs.existsSync(cfg.dir)) {
      console.warn(`Directory not found: ${cfg.dir}. Skipping index generation.`);
      return;
    }

    const index = [];
    const files = getJsonFilesRecursively(cfg.dir);

    files.forEach(filePath => {
      // Avoid indexing the output file itself if it resides in the directory
      if (filePath === cfg.output) return;

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);

        const relativePath = '/' + path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
        index.push(cfg.mapper(parsed, relativePath));
      } catch (e) {
        console.error(`Error indexing file ${filePath}:`, e.message);
      }
    });

    const outputDir = path.dirname(cfg.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(cfg.output, JSON.stringify(index, null, 2) + '\n', 'utf8');
    console.log(`Successfully generated index with ${index.length} entries for [${cfg.name}] at: ${cfg.output}`);
  });

  console.log('--- Index Generation Completed ---');
}

generate();
