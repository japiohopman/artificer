/**
 * tools/portRules.cjs
 *
 * Dedicated utility to port D&D 5e Rules (2014 & 2024 versions) from Foundry VTT unpacked YAML sources
 * to Artificer-compliant structured JSON.
 *
 * 2014 Source:  dnd5e-6.0.x/packs/_source/rules/
 * 2014 Target:  public/assets/atlas/rules/14/json/
 *
 * 2024 Source:  dnd5e-6.0.x/packs/_source/content24/
 * 2024 Target:  public/assets/atlas/rules/24/json/ (recursive directory structure preserved)
 *
 * Usage:
 *   node tools/portRules.cjs
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Root paths
const FOUNDRY_ROOT = path.join(__dirname, '../dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x');
const TARGET_ROOT = path.join(__dirname, '../public/assets/atlas/rules');

const SOURCES = {
  rules14: path.join(FOUNDRY_ROOT, 'packs/_source/rules'),
  rules24: path.join(FOUNDRY_ROOT, 'packs/_source/content24')
};

const TARGETS = {
  rules14: path.join(TARGET_ROOT, '14/json'),
  rules24: path.join(TARGET_ROOT, '24/json')
};

// Clean HTML into simple paragraph strings (strip code, tags safely, decode entities)
function cleanHtmlToParagraphs(html) {
  if (!html) return [];

  // Remove script tags and contents
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<script/gi, '');

  // Convert paragraph markers to linebreaks
  cleaned = cleaned.replace(/<\/p>/gi, '\n').replace(/<p>/gi, '');

  // Strip all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode standard HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  return cleaned
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// Convert a filename or ID into a clean slug
function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse a single yml file and save to targetPath
function portYamlFile(sourceFilePath, targetFilePath, webUrlRoot) {
  try {
    const fileContent = fs.readFileSync(sourceFilePath, 'utf8');
    const parsed = yaml.load(fileContent);

    if (!parsed) {
      console.warn(`[Rules Port] Skipping empty file: ${sourceFilePath}`);
      return false;
    }

    const filenameNoExt = path.basename(sourceFilePath, path.extname(sourceFilePath));
    const index = slugify(filenameNoExt);
    const id = parsed._id || filenameNoExt;
    const name = parsed.name || filenameNoExt;

    // Convert pages
    const pages = [];
    if (Array.isArray(parsed.pages)) {
      parsed.pages.forEach(p => {
        const pageId = p._id || slugify(p.name);
        const pageIndex = slugify(p.name) || slugify(pageId);
        const htmlContent = p.text?.content || '';
        const paragraphs = cleanHtmlToParagraphs(htmlContent);

        pages.push({
          index: pageIndex,
          id: pageId,
          name: p.name || '',
          type: p.type || 'text',
          sort: p.sort || 0,
          paragraphs: paragraphs,
          content_html: htmlContent
        });
      });
    }

    // Standardized rules JSON structure
    const output = {
      index,
      id,
      name: name,
      pages: pages,
      url: webUrlRoot + '/' + path.basename(targetFilePath),
      updated_at: new Date().toISOString()
    };

    // Ensure parent folder exists
    const parentDir = path.dirname(targetFilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2) + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error(`[Rules Port] Error processing file ${sourceFilePath}:`, err.message);
    return false;
  }
}

// Port flat directory (for 2014 rules)
function portRules14() {
  const srcDir = SOURCES.rules14;
  const targetDir = TARGETS.rules14;

  if (!fs.existsSync(srcDir)) {
    console.warn(`[Rules Port] 2014 Source directory not found: ${srcDir}`);
    return;
  }

  console.log(`[Rules Port] Porting 2014 Rules from ${srcDir}...`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  let count = 0;

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if ((ext === '.yml' || ext === '.yaml') && file !== '_folder.yml' && file !== '_folder.yaml') {
      const srcPath = path.join(srcDir, file);
      const indexName = slugify(path.basename(file, ext));
      const targetPath = path.join(targetDir, `${indexName}.json`);
      const webUrlRoot = '/assets/atlas/rules/14/json';

      if (portYamlFile(srcPath, targetPath, webUrlRoot)) {
        count++;
      }
    }
  });

  console.log(`[Rules Port] Successfully ported ${count} rules files for 2014!`);
}

// Port nested directory recursively (for 2024 rules/content)
function portRules24() {
  const srcDir = SOURCES.rules24;
  const targetDir = TARGETS.rules24;

  if (!fs.existsSync(srcDir)) {
    console.warn(`[Rules Port] 2024 Source directory not found: ${srcDir}`);
    return;
  }

  console.log(`[Rules Port] Porting 2024 Rules from ${srcDir}...`);
  let count = 0;

  function traverse(currentSrcDir, currentTargetDir, relativeSubPath) {
    const files = fs.readdirSync(currentSrcDir);

    files.forEach(file => {
      const fullSrcPath = path.join(currentSrcDir, file);
      const stat = fs.statSync(fullSrcPath);

      if (stat.isDirectory()) {
        const nextRelativeSub = relativeSubPath ? `${relativeSubPath}/${file}` : file;
        traverse(fullSrcPath, path.join(currentTargetDir, file), nextRelativeSub);
      } else {
        const ext = path.extname(file).toLowerCase();
        if ((ext === '.yml' || ext === '.yaml') && file !== '_folder.yml' && file !== '_folder.yaml') {
          const indexName = slugify(path.basename(file, ext));
          const targetPath = path.join(currentTargetDir, `${indexName}.json`);

          // Formulate accurate web URL representing recursive folder structure
          const relativeSubUrl = relativeSubPath ? `/${relativeSubPath}` : '';
          const webUrlRoot = `/assets/atlas/rules/24/json${relativeSubUrl}`;

          if (portYamlFile(fullSrcPath, targetPath, webUrlRoot)) {
            count++;
          }
        }
      }
    });
  }

  traverse(srcDir, targetDir, '');
  console.log(`[Rules Port] Successfully ported ${count} rules files/folders for 2024!`);
}

function main() {
  console.log('🏁 Starting Rules Porting Pipeline...');
  portRules14();
  portRules24();
  console.log('✅ Rules Porting Pipeline Completed!');
}

main();
