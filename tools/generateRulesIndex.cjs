/**
 * tools/generateRulesIndex.cjs
 *
 * Compiles index files for both 2014 (5e) and 2024 (5.5e) rules to support instant,
 * dynamic, decoupled runtime loading inside the game client and DevKit.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const RULES_DIR = path.join(PUBLIC_DIR, 'assets/atlas/rules');
const OUTPUT_INDEX_FILE = path.join(RULES_DIR, 'index.json');

function getJsonFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getJsonFilesRecursively(fullPath));
    } else if (file.endsWith('.json') && file !== 'index.json') {
      results.push(fullPath);
    }
  });
  return results;
}

function parseRules(dir) {
  const list = [];
  const files = getJsonFilesRecursively(dir);

  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);

      const relativePath = '/' + path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
      const folderRelativePath = path.relative(dir, filePath).replace(/\\/g, '/');

      // Extract brief page list for searching/navigating
      const pages = (parsed.pages || []).map(p => ({
        index: p.index,
        id: p.id,
        name: p.name,
        type: p.type
      }));

      list.push({
        index: parsed.index,
        id: parsed.id,
        name: parsed.name,
        json_path: relativePath,
        relative_path: folderRelativePath,
        pages: pages
      });
    } catch (e) {
      console.error(`[Rules Index] Error parsing file ${filePath}:`, e.message);
    }
  });

  // Sort by name or relative path
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function generate() {
  console.log('--- Generating Central Rules Indexes ---');

  const rules14Dir = path.join(RULES_DIR, '14/json');
  const rules24Dir = path.join(RULES_DIR, '24/json');

  const rules14 = parseRules(rules14Dir);
  const rules24 = parseRules(rules24Dir);

  const indexData = {
    rules14,
    rules24,
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(OUTPUT_INDEX_FILE, JSON.stringify(indexData, null, 2) + '\n', 'utf8');
  console.log(`Successfully compiled Rules Index with ${rules14.length} (2014) and ${rules24.length} (2024) chapters at: ${OUTPUT_INDEX_FILE}`);
}

generate();
