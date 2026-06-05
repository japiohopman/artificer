const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../public/assets/atlas');
const PUBLIC_DIR = path.join(__dirname, '../public');

const errors = [];
const warnings = [];

function logError(file, message) {
  errors.push({ file, message });
  console.error(`[ERROR] ${file}: ${message}`);
}

function logWarning(file, message) {
  warnings.push({ file, message });
  console.warn(`[WARN] ${file}: ${message}`);
}

function checkPath(filePath, refPath, sourceFile) {
  if (!refPath || typeof refPath !== 'string') return;
  
  // Ignore external URLs
  if (refPath.startsWith('http') || refPath.startsWith('data:')) return;

  // Normalize path
  let absolutePath;
  if (refPath.startsWith('/')) {
    absolutePath = path.join(PUBLIC_DIR, refPath);
  } else {
    absolutePath = path.resolve(path.dirname(filePath), refPath);
  }

  if (!fs.existsSync(absolutePath)) {
    logError(sourceFile, `Broken reference: ${refPath} (Resolved to: ${absolutePath})`);
  }
}

function validateJson(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 1. Check index matches filename
    const fileName = path.basename(filePath, '.json');
    if (data.index && data.index !== fileName) {
      logWarning(relativePath, `Index mismatch: found "${data.index}", expected "${fileName}"`);
    }

    // 2. Check for legacy paths
    const contentStr = JSON.stringify(data);
    if (contentStr.includes('artificer-main') || contentStr.includes('codex/assets')) {
      logError(relativePath, `Contains legacy paths (artificer-main or codex/assets)`);
    }
    if (contentStr.includes('github.com') && contentStr.includes('/raw/')) {
      logError(relativePath, `Contains GitHub raw URLs`);
    }

    // 3. Check images and URLs
    const checkNested = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        const val = obj[key];
        if (['image', 'imageUrl', 'url', 'sprite_sheet'].includes(key)) {
          checkPath(filePath, val, relativePath);
        } else if (typeof val === 'object') {
          checkNested(val);
        }
      }
    };
    checkNested(data);

    // 4. Specific typo check from TODO
    if (contentStr.includes('strengthing_10_feet')) {
      logError(relativePath, `Contains typo "strengthing_10_feet" (should be "string_10_feet")`);
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
    } else if (file.endsWith('.json') && !file.endsWith('index.json')) {
      validateJson(fullPath);
    }
  });
}

console.log('Starting Asset Validation...');
if (fs.existsSync(BASE_DIR)) {
  walk(BASE_DIR);
} else {
  console.error(`Base directory not found: ${BASE_DIR}`);
}

console.log('\n--- Validation Summary ---');
console.log(`Total Errors: ${errors.length}`);
console.log(`Total Warnings: ${warnings.length}`);

if (errors.length > 0) {
  process.exit(1);
} else {
  console.log('All clear! (mostly)');
}
