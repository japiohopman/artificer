const fs = require('fs');
const path = require('path');

const faerunDir = path.join(__dirname, 'public', 'assets', 'atlas', 'world', 'toril', 'faerun');
const loreDir = path.join(__dirname, 'public', 'assets', 'atlas', 'lore', 'locations');

// Get all .md files (without the .md extension)
const loreFiles = fs.readdirSync(loreDir)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''));

const loreSet = new Set(loreFiles);
let modifiedCount = 0;

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    let json;
    try {
      json = JSON.parse(data);
    } catch (e) {
      return; // Skip invalid JSON
    }

    let modified = false;

    // Check if it's an array
    if (Array.isArray(json)) {
      for (const item of json) {
        if (item && item.id && loreSet.has(item.id)) {
          if (item.lore !== `/assets/atlas/lore/locations/${item.id}.md`) {
            item.lore = `/assets/atlas/lore/locations/${item.id}.md`;
            modified = true;
          }
        }
      }
    } else if (json && json.id && loreSet.has(json.id)) {
      if (json.lore !== `/assets/atlas/lore/locations/${json.id}.md`) {
        json.lore = `/assets/atlas/lore/locations/${json.id}.md`;
        modified = true;
      }
    } else if (json && json.locations && Array.isArray(json.locations)) {
       // Check if it has a locations array
       for (const item of json.locations) {
        if (item && item.id && loreSet.has(item.id)) {
          if (item.lore !== `/assets/atlas/lore/locations/${item.id}.md`) {
            item.lore = `/assets/atlas/lore/locations/${item.id}.md`;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      modifiedCount++;
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

console.log(`Found ${loreSet.size} lore locations. Processing JSON files...`);
processDirectory(faerunDir);
console.log(`Done. Modified ${modifiedCount} JSON files.`);
