const fs = require('fs');
const path = require('path');

const EQUIPMENT_DIR = path.join(__dirname, '../public/assets/atlas/equipment/json');
const CATEGORIES_DIR = path.join(__dirname, '../public/assets/atlas/equipment_categories/json');

// Helper to recursively walk a directory
function walkSync(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkSync(filePath));
    } else if (file.endsWith('.json') && !file.startsWith('_') && file !== 'index.json') {
      results.push(filePath);
    }
  });
  return results;
}

function run() {
  console.log('Starting equipment category regeneration...');

  // 1. Scan all equipment JSON files under 14 and 24 to build a directory map
  const equipmentFiles = walkSync(EQUIPMENT_DIR);
  console.log(`Found ${equipmentFiles.length} equipment JSON files.`);

  // Mapping from normalized index (hyphen-based) to best path info
  // { normalizedKey: { path14, path24, anyPath, name } }
  const mappingDb = {};

  equipmentFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      const relativePath = '/' + path.relative(path.join(__dirname, '../public'), filePath).replace(/\\/g, '/');
      const fileNameWithoutExt = path.basename(filePath, '.json');
      const itemIndex = data.index || fileNameWithoutExt;

      // Normalized key: replace all underscores with hyphens
      const normalizedKey = itemIndex.toLowerCase().replace(/_/g, '-');

      const is14 = relativePath.includes('/14/');
      const is24 = relativePath.includes('/24/');
      const isPack = relativePath.includes('/equipment-packs/');

      if (!mappingDb[normalizedKey]) {
        mappingDb[normalizedKey] = {
          path14: null,
          path24: null,
          anyPath: relativePath,
          name: data.name || itemIndex.replace(/[-_]/g, ' ')
        };
      }

      const entry = mappingDb[normalizedKey];

      if (isPack) {
        // Only map if no other path has been mapped
        if (!entry.path14 && !entry.path24 && entry.anyPath === relativePath) {
          if (is14) entry.path14 = relativePath;
          if (is24) entry.path24 = relativePath;
        }
      } else {
        // Non-pack path: prioritizes this!
        if (is14) {
          if (!entry.path14 || entry.path14.includes('/equipment-packs/')) {
            entry.path14 = relativePath;
          }
        }
        if (is24) {
          if (!entry.path24 || entry.path24.includes('/equipment-packs/')) {
            entry.path24 = relativePath;
          }
        }
        // Fallback anyPath should also be non-pack if possible
        if (entry.anyPath.includes('/equipment-packs/') || entry.anyPath === relativePath) {
          entry.anyPath = relativePath;
        }
      }
    } catch (e) {
      console.error(`Error processing equipment file ${filePath}:`, e.message);
    }
  });

  // 2. Read and update all categories
  if (!fs.existsSync(CATEGORIES_DIR)) {
    console.error(`Categories directory ${CATEGORIES_DIR} does not exist!`);
    return;
  }

  const categoryFiles = fs.readdirSync(CATEGORIES_DIR).filter(file => file.endsWith('.json'));
  console.log(`Found ${categoryFiles.length} category JSON files.`);

  let totalUpdatedItems = 0;
  let totalMissingItems = 0;

  categoryFiles.forEach(file => {
    const filePath = path.join(CATEGORIES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const categoryData = JSON.parse(content);

      if (categoryData && Array.isArray(categoryData.equipment)) {
        categoryData.equipment = categoryData.equipment.map(item => {
          const originalIndex = item.index;
          // Normalize key
          const normalizedKey = originalIndex.toLowerCase().replace(/_/g, '-');

          const entry = mappingDb[normalizedKey];
          if (entry) {
            // Choose path14 as preferred, fallback to path24, then anyPath
            const bestPath = entry.path14 || entry.path24 || entry.anyPath;
            totalUpdatedItems++;
            return {
              index: normalizedKey, // Convert index to standard hyphen-based format
              name: item.name || entry.name,
              url: bestPath
            };
          } else {
            console.warn(`[WARN] No matching file found for category item "${originalIndex}" in category "${categoryData.index}"`);
            totalMissingItems++;
            // Keep item but normalize its URL if we can guess, or keep as is
            return item;
          }
        });

        // Set category file's own URL path to match public prefix
        const catRelativePath = '/' + path.relative(path.join(__dirname, '../public'), filePath).replace(/\\/g, '/');
        categoryData.url = catRelativePath;
        categoryData.updated_at = new Date().toISOString();

        fs.writeFileSync(filePath, JSON.stringify(categoryData, null, 2) + '\n');
      }
    } catch (e) {
      console.error(`Error processing category file ${filePath}:`, e.message);
    }
  });

  console.log(`\nCategory regeneration completed.`);
  console.log(`Successfully mapped and updated ${totalUpdatedItems} equipment references in categories.`);
  if (totalMissingItems > 0) {
    console.log(`Could not find standard files for ${totalMissingItems} category items (logged above).`);
  }
}

run();
