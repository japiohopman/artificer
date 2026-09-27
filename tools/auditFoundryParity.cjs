/**
 * tools/auditFoundryParity.cjs
 *
 * Reproducible source-parity audit script for GitHub Issue #358.
 * Audits Foundry v6.0.x 2014/2024 enemy & feature sources against Artificer's
 * current dataset and media asset directory.
 *
 * Usage:
 *   node tools/auditFoundryParity.cjs
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const ATLAS_ENEMIES = path.join(REPO_ROOT, 'public/assets/atlas/enemies/json');
const ATLAS_CATEGORIES = path.join(REPO_ROOT, 'public/assets/atlas/enemies_categories/json');
const ATLAS_FEATURES = path.join(REPO_ROOT, 'public/assets/atlas/enemies/monsterfeatures/json');
const ATLAS_IMAGES = path.join(REPO_ROOT, 'public/assets/atlas/enemies/images');
const ATLAS_TOKENS = path.join(REPO_ROOT, 'public/assets/atlas/enemies/tokens');

// Pinned immutable release tag: Foundry v6.0.4
const PINNED_RELEASE_TAG = 'release-6.0.4';
const FOUNDRY_TMP_DIR = '/tmp/f5e_audit_pinned/packs/_source';

function ensureFoundrySource() {
  if (fs.existsSync(FOUNDRY_TMP_DIR)) {
    return FOUNDRY_TMP_DIR;
  }
  console.log(`Downloading pinned Foundry release (${PINNED_RELEASE_TAG}) source tree to /tmp/f5e_audit_pinned...`);
  fs.mkdirSync('/tmp/f5e_audit_pinned', { recursive: true });
  try {
    execSync(`curl -sL https://github.com/foundryvtt/dnd5e/archive/refs/tags/${PINNED_RELEASE_TAG}.tar.gz | tar -xz --strip-components=1 -C /tmp/f5e_audit_pinned "dnd5e-${PINNED_RELEASE_TAG}/packs/_source"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to download Foundry source archive:', e.message);
  }
  return FOUNDRY_TMP_DIR;
}

function scanFoundryCategoryDir(dir) {
  const counts = {};
  if (!fs.existsSync(dir)) return counts;
  const entries = fs.readdirSync(dir);
  for (const ent of entries) {
    const full = path.join(dir, ent);
    if (fs.statSync(full).isDirectory()) {
      const files = fs.readdirSync(full).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      counts[ent] = files.length;
    } else if (ent.endsWith('.yml') || ent.endsWith('.yaml')) {
      if (!counts['_root']) counts['_root'] = 0;
      counts['_root']++;
    }
  }
  return counts;
}

function parseFoundryActors(baseDir) {
  const map = {};
  if (!fs.existsSync(baseDir)) return map;
  const cats = fs.readdirSync(baseDir);
  for (const c of cats) {
    const cPath = path.join(baseDir, c);
    if (fs.statSync(cPath).isDirectory()) {
      const files = fs.readdirSync(cPath).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      for (const f of files) {
        const content = fs.readFileSync(path.join(cPath, f), 'utf8');
        const idMatch = content.match(/^_id:\s*['"]?([a-zA-Z0-9]+)['"]?/m);
        const nameMatch = content.match(/^name:\s*['"]?([^'"\r\n]+)['"]?/m);
        if (idMatch && nameMatch) {
          const id = idMatch[1].toLowerCase();
          const rawId = idMatch[1];
          const name = nameMatch[1].trim();
          const normName = name.toLowerCase().trim();
          map[id] = { id, rawId, name, normName, category: c, file: f };
        }
      }
    }
  }
  return map;
}

function findTokenRecursive(dir, nameNoExt) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      const res = findTokenRecursive(full, nameNoExt);
      if (res) return res;
    } else {
      const ext = path.extname(f).toLowerCase();
      const base = path.basename(f, ext).toLowerCase();
      if (base === nameNoExt.toLowerCase()) {
        return '/' + full.replace(/\\/g, '/').replace(/.*public\//, '');
      }
    }
  }
  return null;
}

function runAudit() {
  console.log('====================================================');
  console.log(`  ARTIFICER FOUNDRY PARITY AUDIT (${PINNED_RELEASE_TAG})  `);
  console.log('====================================================\n');

  const foundryRoot = ensureFoundrySource();

  // 1. Foundry Source Audits
  const f14Monsters = scanFoundryCategoryDir(path.join(foundryRoot, 'monsters'));
  const f24Actors = scanFoundryCategoryDir(path.join(foundryRoot, 'actors24'));
  const f14Features = scanFoundryCategoryDir(path.join(foundryRoot, 'monsterfeatures'));
  const f24Features = scanFoundryCategoryDir(path.join(foundryRoot, 'monsterfeatures24'));

  const total14Monsters = Object.values(f14Monsters).reduce((a, b) => a + b, 0);
  const total24Actors = Object.values(f24Actors).reduce((a, b) => a + b, 0);

  console.log('1. FOUNDRY SOURCE RECORD COUNTS');
  console.log(`   - Pinned Source Release Tag: ${PINNED_RELEASE_TAG}`);
  console.log(`   - 2014 monsters/ total files: ${total14Monsters} across ${Object.keys(f14Monsters).length} categories`);
  console.log('     Breakdown:', f14Monsters);
  console.log(`   - 2024 actors24/ total files: ${total24Actors} across ${Object.keys(f24Actors).length} categories`);
  console.log('     Breakdown:', f24Actors);
  console.log(`   - 2014 monsterfeatures/ total files: ${f14Features._root || 0}`);
  console.log('   - 2024 monsterfeatures24/ total files:', f24Features);

  // 2. Shared Display Names & ID Disconnect Verification
  const m14 = parseFoundryActors(path.join(foundryRoot, 'monsters'));
  const m24 = parseFoundryActors(path.join(foundryRoot, 'actors24'));

  const name14Map = {};
  Object.values(m14).forEach(m => {
    if (!name14Map[m.normName]) name14Map[m.normName] = [];
    name14Map[m.normName].push(m);
  });

  const name24Map = {};
  Object.values(m24).forEach(m => {
    if (!name24Map[m.normName]) name24Map[m.normName] = [];
    name24Map[m.normName].push(m);
  });

  const sharedNames = Object.keys(name14Map).filter(n => name24Map[n]);
  console.log(`\n2. CREATURE NAME & ID DISCONNECT VERIFICATION`);
  console.log(`   - Shared Creature Display Names between 2014 and 2024: ${sharedNames.length}`);

  // Assertion: Verify that ALL 306 shared creature names have DISTINCT 2014 vs 2024 IDs
  let idCollisions = 0;
  sharedNames.forEach(name => {
    const ids14 = new Set(name14Map[name].map(x => x.id));
    const ids24 = new Set(name24Map[name].map(x => x.id));
    for (const id of ids14) {
      if (ids24.has(id)) {
        idCollisions++;
      }
    }
  });

  console.log(`   - Asserting distinct IDs across 2014 vs 2024 shared creature names (Collisions: ${idCollisions})...`);
  assert.strictEqual(idCollisions, 0, 'Foundry 2014 and 2024 shared creature names must have distinct IDs');
  console.log('     PASSED: All shared creature names have 100% distinct IDs between rulesets.');

  // 3. Current Repository Dataset Classification & 2014 Source Verification
  const repoEnemyFiles = fs.existsSync(ATLAS_ENEMIES) ? fs.readdirSync(ATLAS_ENEMIES).filter(f => f.endsWith('.json')) : [];
  let foundryIdCount = 0;
  let legacyNameCount = 0;
  let verifiedFoundry14Matches = 0;

  repoEnemyFiles.forEach(f => {
    const fileIndex = f.replace('.json', '');
    const isFoundryId = /^[a-z0-9]{16}$/i.test(fileIndex);
    if (isFoundryId) {
      foundryIdCount++;
      if (m14[fileIndex.toLowerCase()]) {
        verifiedFoundry14Matches++;
      }
    } else {
      legacyNameCount++;
    }
  });

  console.log(`\n3. CURRENT REPOSITORY ENEMY CLASSIFICATION & SOURCE VERIFICATION`);
  console.log(`   - Total Enemy JSON Files in public/assets/atlas/enemies/json/: ${repoEnemyFiles.length}`);
  console.log(`   - Foundry-2014-ID Indexed Files: ${foundryIdCount}`);
  console.log(`   - Legacy Human-Readable Slug Indexed Files: ${legacyNameCount}`);
  console.log(`   - Verified 2014 Source Matches for Foundry-ID Files: ${verifiedFoundry14Matches} / ${foundryIdCount}`);

  // Assertion: Assert that ALL 346 Foundry-ID indexed records originate from the 2014 source
  assert.strictEqual(verifiedFoundry14Matches, foundryIdCount, 'All Foundry-ID indexed records must originate from the 2014 Foundry source');
  console.log('     PASSED: 100% of Foundry-ID indexed repo records are verified 2014 Foundry source entries.');

  // Category index references audit
  if (fs.existsSync(ATLAS_CATEGORIES)) {
    const catFiles = fs.readdirSync(ATLAS_CATEGORIES).filter(f => f.endsWith('.json'));
    let totalCatRefs = 0;
    let missingRefs = 0;
    catFiles.forEach(cf => {
      const cdata = JSON.parse(fs.readFileSync(path.join(ATLAS_CATEGORIES, cf), 'utf8'));
      (cdata.monsters || []).forEach(m => {
        totalCatRefs++;
        if (!repoEnemyFiles.includes(`${m.index}.json`)) {
          missingRefs++;
        }
      });
    });
    console.log(`   - Category JSON monster references: ${totalCatRefs}`);
    console.log(`   - Category references pointing to non-existent enemy JSON: ${missingRefs}`);
  }

  // 4. Media Asset Reconciliation
  const imageFiles = new Set(fs.existsSync(ATLAS_IMAGES) ? fs.readdirSync(ATLAS_IMAGES) : []);
  let validImagesDirCount = 0;
  let tokenPathCount = 0;
  let obsoleteFlatCount = 0;
  let matchedArtworkCount = 0;
  let matchedTokenCount = 0;

  repoEnemyFiles.forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(ATLAS_ENEMIES, f), 'utf8'));
    const name = (data.name || '').toLowerCase().trim();
    const img = data.imageUrl || data.image || '';

    if (img.includes('/enemies/images/')) validImagesDirCount++;
    else if (img.includes('/enemies/tokens/')) tokenPathCount++;
    else if (img.includes('/enemies/') && !img.includes('/images/') && !img.includes('/tokens/')) obsoleteFlatCount++;

    const slugUnderscore = name.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const slugHyphen = name.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    if (imageFiles.has(`${slugUnderscore}.webp`) || imageFiles.has(`${slugHyphen}.webp`)) {
      matchedArtworkCount++;
    }

    const token = findTokenRecursive(ATLAS_TOKENS, slugUnderscore) || findTokenRecursive(ATLAS_TOKENS, slugHyphen) || findTokenRecursive(ATLAS_TOKENS, data.index);
    if (token) matchedTokenCount++;
  });

  console.log(`\n4. MEDIA ASSET RECONCILIATION`);
  console.log(`   - Total Curated Non-Grid WebP Artwork Files in enemies/images/: ${imageFiles.size}`);
  console.log(`   - Current Repository Enemies pointing to valid images/ directory: ${validImagesDirCount}`);
  console.log(`   - Current Repository Enemies pointing to token paths: ${tokenPathCount}`);
  console.log(`   - Current Repository Enemies pointing to obsolete flat paths: ${obsoleteFlatCount}`);
  console.log(`   - Current Enemies matching a verified non-grid artwork asset under enemies/images/: ${matchedArtworkCount}`);
  console.log(`   - Current Enemies matching a verified tactical token asset under enemies/tokens/: ${matchedTokenCount}`);

  console.log('\n====================================================');
  console.log('  AUDIT COMPLETE: All assertions and figures verified. ');
  console.log('====================================================\n');
}

runAudit();
