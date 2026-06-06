const fs = require('fs');
const path = require('path');
const { Validator } = require('jsonschema');

const PROJECT_ROOT = path.join(__dirname, '..');
const BASE_DIR = path.join(PROJECT_ROOT, 'public/assets/atlas');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const SCHEMA_DIR = path.join(BASE_DIR, 'schemas');

const errors = [];
const warnings = [];
const validator = new Validator();
const schemas = {};

// Preload schemas
if (fs.existsSync(SCHEMA_DIR)) {
    fs.readdirSync(SCHEMA_DIR).forEach(file => {
        if (file.endsWith('.schema.json')) {
            const schemaName = file.replace('.schema.json', '');
            try {
                schemas[schemaName] = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'));
            } catch (e) {
                console.error(`Failed to load schema ${file}: ${e.message}`);
            }
        }
    });
}

function logError(file, message) {
  errors.push({ file, message });
  console.error(`[ERROR] ${file}: ${message}`);
}

function logWarning(file, message) {
  warnings.push({ file, message });
  console.warn(`[WARN] ${file}: ${message}`);
}

/**
 * Checks if a path exists and adheres to project standards.
 */
function checkPath(filePath, refPath, sourceFile) {
  if (!refPath || typeof refPath !== 'string') return;
  
  // Ignore external URLs (except if they are specifically banned GitHub raw URLs or proxies)
  if (refPath.startsWith('http') || refPath.includes('api/raw')) {
      if (refPath.includes('raw.githubusercontent.com') || refPath.includes('api/raw')) {
          logError(sourceFile, `GitHub raw/proxy URL detected in property: ${refPath}`);
      }
      return;
  }

  if (refPath.startsWith('data:')) return;

  // Normalize path
  let absolutePath;
  if (refPath.startsWith('public/assets/')) {
    // Resolve from project root
    absolutePath = path.join(PROJECT_ROOT, refPath);
  } else if (refPath.startsWith('/assets/')) {
    // Resolve from public/ (standard browser path)
    absolutePath = path.join(PUBLIC_DIR, refPath);
  } else if (refPath.startsWith('/')) {
    // Absolute-looking paths are treated relative to public/
    absolutePath = path.join(PUBLIC_DIR, refPath);
  } else {
    // Relative to the JSON file
    absolutePath = path.resolve(path.dirname(filePath), refPath);
  }

  // Check existence
  if (!fs.existsSync(absolutePath)) {
    logError(sourceFile, `Broken reference: ${refPath} (Resolved to: ${path.relative(PROJECT_ROOT, absolutePath)})`);
  }

  // Check for equipment image location specific rule
  // If we are in equipment/json/ and reference an image, it should probably be in equipment/images/
  if (sourceFile.includes('equipment/json/') && (refPath.endsWith('.webp') || refPath.endsWith('.png'))) {
      if (!absolutePath.includes('equipment/images/')) {
          logWarning(sourceFile, `Equipment image reference "${refPath}" is not in equipment/images/`);
      }
  }
}

function validateJson(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) {
        logError(relativePath, 'Empty JSON file');
        return;
    }
    const data = JSON.parse(content);
    
    // 1. Check index matches filename
    const fileName = path.basename(filePath, '.json');
    if (data.index && data.index !== fileName) {
      logWarning(relativePath, `Index mismatch: found "index": "${data.index}", expected "${fileName}"`);
    }

    // 2. Check for legacy paths and raw URLs in the whole content
    if (content.includes('artificer-main') || content.includes('codex/assets')) {
      logError(relativePath, `Contains legacy paths (artificer-main or codex/assets)`);
    }

    // 3. Check images and URLs recursively
    const checkNested = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        const val = obj[key];
        if (['image', 'imageUrl', 'url', 'sprite_sheet', 'image_path', 'json_path'].includes(key)) {
          checkPath(filePath, val, relativePath);
        } else if (typeof val === 'object') {
          checkNested(val);
        }
      }
    };
    checkNested(data);

    // 4. Specific typo checks
    if (content.includes('strengthing_10_feet')) {
      logError(relativePath, `Contains typo "strengthing_10_feet" (should be "string_10_feet")`);
    }

    // 5. Schema validation
    let schemaType = null;
    if (filePath.includes('enemies/json')) schemaType = 'enemy';
    else if (filePath.includes('spell/json')) schemaType = 'spell';
    else if (filePath.includes('equipment/json')) {
        if (data.kind === 'weapon') schemaType = 'weapon';
        else if (data.kind === 'armor') schemaType = 'armor';
        else if (data.kind === 'tool') schemaType = 'tool';
        else if (data.kind === 'focus') schemaType = 'focus';
        else if (data.kind === 'equipment_pack') schemaType = 'equipment_pack';
        else schemaType = 'equipment';
    }
    else if (filePath.includes('magic_items/json')) schemaType = 'magic_item';
    else if (filePath.includes('transport/json')) schemaType = 'transport';
    else if (filePath.includes('alignments/json')) schemaType = 'alignment';
    else if (filePath.includes('backgrounds/json')) schemaType = 'background';
    else if (filePath.includes('proficiencies/json')) schemaType = 'proficiency';
    else if (filePath.includes('sub_regions')) schemaType = 'sub_region';
    else if (filePath.includes('cities') || filePath.includes('towns_settlements') || filePath.includes('fortresses_keeps')) {
        if (!filePath.includes('sublocations')) schemaType = 'city';
    }

    if (schemaType && schemas[schemaType]) {
        // Schema validation is currently informative due to high legacy debt
        const result = validator.validate(data, schemas[schemaType]);
        if (!result.valid) {
            result.errors.forEach(err => {
                logWarning(relativePath, `Schema violation (${schemaType}): ${err.stack}`);
            });
        }
    }

  } catch (e) {
    logError(relativePath, `JSON Parse Error: ${e.message}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.json') && !file.endsWith('index.json') && !file.endsWith('schema.json')) {
      validateJson(fullPath);
    }
  });
}

console.log('Starting Asset Validation with Schema Checks...');
if (fs.existsSync(BASE_DIR)) {
  walk(BASE_DIR);
} else {
  console.error(`Base directory not found: ${BASE_DIR}`);
}

console.log('\n--- Validation Summary ---');
console.log(`Total Errors: ${errors.length}`);
console.log(`Total Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.error('\nValidation failed with errors.');
  process.exit(1);
} else {
  console.log('\nValidation successful!');
}
