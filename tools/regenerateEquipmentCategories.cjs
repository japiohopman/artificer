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
  console.log('Starting equipment category regeneration with tiered expansions...');

  const equipmentFiles = walkSync(EQUIPMENT_DIR);
  console.log(`Found ${equipmentFiles.length} equipment JSON files.`);

  // Mapping from normalized index (hyphen-based) to best path info
  const mappingDb = {};
  // Files grouped by directory
  const filesByFolder = {};

  equipmentFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      const relativePath = '/' + path.relative(path.join(__dirname, '../public'), filePath).replace(/\\/g, '/');
      const fileNameWithoutExt = path.basename(filePath, '.json');
      const itemIndex = data.index || fileNameWithoutExt;

      const normalizedKey = itemIndex.toLowerCase().replace(/_/g, '-');
      const folderPath = path.dirname(filePath);

      const is14 = relativePath.includes('/14/');
      const is24 = relativePath.includes('/24/');
      const isPack = relativePath.includes('/equipment-packs/');

      const itemEntry = {
        normalizedIndex: normalizedKey,
        path: relativePath,
        name: data.name || itemIndex.replace(/[-_]/g, ' '),
        is14,
        is24,
        isPack
      };

      // Add to folder-based files
      if (!filesByFolder[folderPath]) {
        filesByFolder[folderPath] = [];
      }
      filesByFolder[folderPath].push(itemEntry);

      // Build database of best paths
      if (!mappingDb[normalizedKey]) {
        mappingDb[normalizedKey] = {
          path14: null,
          path24: null,
          anyPath: relativePath,
          name: itemEntry.name,
          folderPath: folderPath
        };
      }

      const entry = mappingDb[normalizedKey];

      if (isPack) {
        if (!entry.path14 && !entry.path24 && entry.anyPath === relativePath) {
          if (is14) entry.path14 = relativePath;
          if (is24) entry.path24 = relativePath;
        }
      } else {
        if (is14) {
          if (!entry.path14 || entry.path14.includes('/equipment-packs/')) {
            entry.path14 = relativePath;
            entry.folderPath = folderPath; // Prefer 14 directory for expansion folder
          }
        }
        if (is24) {
          if (!entry.path24 || entry.path24.includes('/equipment-packs/')) {
            entry.path24 = relativePath;
            if (!entry.path14) entry.folderPath = folderPath;
          }
        }
        if (entry.anyPath.includes('/equipment-packs/') || entry.anyPath === relativePath) {
          entry.anyPath = relativePath;
        }
      }
    } catch (e) {
      console.error(`Error processing equipment file ${filePath}:`, e.message);
    }
  });

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
        const newEquipmentList = [];
        const addedIndices = new Set();

        categoryData.equipment.forEach(item => {
          const originalIndex = item.index;
          const normalizedKey = originalIndex.toLowerCase().replace(/_/g, '-');

          const entry = mappingDb[normalizedKey];
          if (entry) {
            const bestPath = entry.path14 || entry.path24 || entry.anyPath;
            
            // Add base item if not already added
            if (!addedIndices.has(normalizedKey)) {
              newEquipmentList.push({
                index: normalizedKey,
                name: item.name || entry.name,
                url: bestPath
              });
              addedIndices.add(normalizedKey);
              totalUpdatedItems++;
            }

            // Find and append variants (+1, +2, +3, etc.) located in the same folder
            if (entry.folderPath && filesByFolder[entry.folderPath]) {
              const folderItems = filesByFolder[entry.folderPath];
              folderItems.forEach(folderItem => {
                const varIndex = folderItem.normalizedIndex;
                if (varIndex.startsWith(normalizedKey + '-') && !addedIndices.has(varIndex)) {
                  newEquipmentList.push({
                    index: varIndex,
                    name: folderItem.name,
                    url: folderItem.path
                  });
                  addedIndices.add(varIndex);
                  totalUpdatedItems++;
                }
              });
            }
          } else {
            // Check if this is a known placeholder to filter out
            const isGenericPlaceholder = ['ammunition', 'armor', 'weapon', 'shield', 'ring', 'scroll', 'potion', 'rod', 'staff', 'wand'].some(placeholder => 
              normalizedKey === placeholder || 
              normalizedKey.startsWith(placeholder + '-') || 
              normalizedKey.startsWith(placeholder + '_')
            );

            if (isGenericPlaceholder) {
              console.log(`Filtering out old generic placeholder: "${originalIndex}" in category "${categoryData.index}"`);
            } else {
              // Keep unresolvable custom items to be safe, but log warning
              console.warn(`[WARN] No matching file found for custom category item "${originalIndex}" in category "${categoryData.index}"`);
              newEquipmentList.push(item);
              totalMissingItems++;
            }
          }
        });

        // Set category metadata
        categoryData.equipment = newEquipmentList;
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
  console.log(`Successfully mapped and updated/expanded ${totalUpdatedItems} equipment references in categories.`);
  if (totalMissingItems > 0) {
    console.log(`Could not find files for ${totalMissingItems} custom category items.`);
  }
}

run();
