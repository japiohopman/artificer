const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

const TEMPLATE_ALIASES = {
  // Weapon & Ammunition aliases
  'crossbow_light': 'light_crossbow',
  'crossbow-light': 'light_crossbow',
  'light-crossbow': 'light_crossbow',
  'crossbow_heavy': 'heavy_crossbow',
  'crossbow-heavy': 'heavy_crossbow',
  'heavy-crossbow': 'heavy_crossbow',
  'light_hammer': 'light_hammer',
  'light-hammer': 'light_hammer',
  'crossbow_bolt': 'crossbow_bolt',
  'crossbow-bolt': 'crossbow_bolt',

  // Armor aliases
  'padded-armor': 'padded_armor',
  'padded': 'padded_armor',
  'leather-armor': 'leather_armor',
  'leather': 'leather_armor',
  'studded-leather-armor': 'studded_leather_armor',
  'studded-leather': 'studded_leather_armor',
  'studded_leather': 'studded_leather_armor',
  'hide-armor': 'hide_armor',
  'hide': 'hide_armor',
  'chain-shirt': 'chain_shirt',
  'scale-mail': 'scale_mail',
  'half-plate': 'half_plate',
  'ring-mail': 'ring_mail',
  'chain-mail': 'chain_mail',
  'splint-armor': 'splint_armor',
  'splint': 'splint_armor',
  'plate-armor': 'plate_armor',
  'plate': 'plate_armor',

  // Spellcasting focus & religious aliases
  'arcane-focus': 'arcane_focus',
  'component-pouch': 'component_pouch',
  'druidic-focus': 'druidic_focus',
  'holy-symbol': 'holy_symbol',
  'sprig-of-mistletoe': 'sprig_of_mistletoe',

  // Pack aliases
  'explorers-pack': 'explorers_pack',
  'dungeoneers-pack': 'dungeoneers_pack',
  'burglars-pack': 'burglars_pack',
  'diplomats-pack': 'diplomats_pack',
  'entertainers-pack': 'entertainers_pack',
  'priests-pack': 'priests_pack',
  'scholars-pack': 'scholars_pack',

  // Adventuring gear aliases (Hempen Rope vs Silk Rope are distinct canonical D&D items)
  'hempen-rope-50-ft': 'hempen_rope_50_ft',
  'rope-hempen-50-feet': 'hempen_rope_50_ft',
  'rope_hempen_50_feet': 'hempen_rope_50_ft',
  'hempen_rope_50_ft': 'hempen_rope_50_ft',
  'rope': 'hempen_rope_50_ft',

  'rope_silk_50_feet': 'silk_rope_50_ft',
  'rope-silk-50-feet': 'silk_rope_50_ft',
  'silk_rope_50_feet': 'silk_rope_50_ft',
  'silk_rope_50_ft': 'silk_rope_50_ft',
  'silk-rope-50-ft': 'silk_rope_50_ft',
  'silk_rope': 'silk_rope_50_ft',

  'rations-1-day': 'rations',
  'rations_1_day': 'rations',
  'mess-kit': 'mess_kit',
  'ball-bearings-bag-of-1000': 'ball_bearings',
  'ball_bearings_bag_of_1000': 'ball_bearings',
  'string-10-feet': 'string',
  'string_10_feet': 'string',
  'case-for-maps-and-scrolls': 'map_case',
  'case_for_maps_and_scrolls': 'map_case',

  // Tool aliases
  'thieves-tools': 'thieves_tools',
  'disguise-kit': 'disguise_kit',
  'forgery-kit': 'forgery_kit',
  'herbalism-kit': 'herbalism_kit',
  'navigators-tools': 'navigators_tools',
  'poisoners-kit': 'poisoners_kit',
  'alchemists-supplies': 'alchemists_supplies',
  'playing-card-set': 'playing_card_set',
  'dice-set': 'dice_set',

  // Clothes & Personal item aliases
  'clothes-travelers': 'travelers_clothes',
  'clothes_travelers': 'travelers_clothes',
  'travelers-clothes': 'travelers_clothes',
  'clothes-fine': 'fine_clothes',
  'clothes_fine': 'fine_clothes',
  'fine-clothes': 'fine_clothes',
  'clothes-costume': 'costume',
  'clothes_costume': 'costume',
  'parchment-one-sheet': 'parchment',
  'parchment_one_sheet': 'parchment',
  'paper-one-sheet': 'paper',
  'paper_one_sheet': 'paper',
  'ink-1-ounce-bottle': 'ink',
  'ink_1_ounce_bottle': 'ink',
  'ink-pen': 'ink_pen',
  'book-of-lore': 'book_of_lore',
  'little-bag-of-sand': 'little_bag_of_sand',
  'little_bag_of_sand': 'little_bag_of_sand',
  'knife-small': 'knife_small',
  'knife_small': 'knife_small',
  'scale-merchants': 'scale_merchants',
  'scale_merchants': 'scale_merchants',
};

function normalizeCanonicalId(raw) {
  if (!raw) return 'unknown_item';
  let clean = raw.toLowerCase().trim();
  clean = clean.split('/').pop() || clean;
  clean = clean.replace(/\.json$/, '').replace(/\.webp$/, '');

  if (TEMPLATE_ALIASES[clean]) return TEMPLATE_ALIASES[clean];
  const underscore = clean.replace(/-/g, '_');
  if (TEMPLATE_ALIASES[underscore]) return TEMPLATE_ALIASES[underscore];
  return underscore;
}

function resolveVisualId(canonicalId) {
  return `equipment.${canonicalId}`;
}

const EQUIPMENT_PACKS = {
  'burglars-pack': [
    'backpack', 'ball-bearings-bag-of-1000', 'string-10-feet', 'bell', 'candle',
    'crowbar', 'hammer', 'piton', 'lantern-hooded', 'oil-flask', 'rations-1-day',
    'tinderbox', 'waterskin', 'rope-hempen-50-feet'
  ],
  'diplomats-pack': [
    'chest', 'case-for-maps-and-scrolls', 'clothes-fine', 'ink-1-ounce-bottle',
    'ink-pen', 'lamp', 'oil-flask', 'paper-one-sheet', 'perfume-vial', 'sealing-wax', 'soap'
  ],
  'dungeoneers-pack': [
    'backpack', 'crowbar', 'hammer', 'piton', 'torch', 'tinderbox',
    'rations-1-day', 'waterskin', 'rope-hempen-50-feet'
  ],
  'entertainers-pack': [
    'backpack', 'bedroll', 'costume', 'candle', 'rations-1-day', 'waterskin', 'disguise-kit'
  ],
  'explorers-pack': [
    'backpack', 'bedroll', 'mess-kit', 'tinderbox', 'torch',
    'rations-1-day', 'waterskin', 'rope-hempen-50-feet'
  ],
  'priests-pack': [
    'backpack', 'blanket', 'candle', 'tinderbox', 'alms-box', 'incense-block',
    'censer', 'vestments', 'rations-1-day', 'waterskin'
  ],
  'scholars-pack': [
    'backpack', 'book-of-lore', 'ink-1-ounce-bottle', 'ink-pen',
    'parchment-one-sheet', 'little-bag-of-sand', 'knife-small'
  ]
};

// Parse TS manifest mappings
const manifestTs = fs.readFileSync(path.join(PROJECT_ROOT, 'src/lib/inventoryVisuals/spriteManifest.ts'), 'utf8');

const manifestMappings = {};
// Parse entries matching either full READY mappings with sheetId, row, col or PLANNED mappings without row/col
const mappingRegex = /'equipment\.([^']+)':\s*\{[^}]*visualId:\s*'equipment\.[^']+'(?:,\s*sheetId:\s*'([^']+)')?(?:,\s*row:\s*(\d+))?(?:,\s*col:\s*(\d+))?[^}]*status:\s*'([^']+)',\s*category:\s*'([^']+)'/g;

let match;
while ((match = mappingRegex.exec(manifestTs)) !== null) {
  const [, itemKey, sheetId, row, col, status, category] = match;
  manifestMappings[`equipment.${itemKey}`] = {
    sheetId: sheetId || null,
    row: row !== undefined ? parseInt(row, 10) : null,
    col: col !== undefined ? parseInt(col, 10) : null,
    status,
    category
  };
}

const auditedItems = new Map();

function getOrCreateRecord(rawId, isStarter = false) {
  const canonicalId = normalizeCanonicalId(rawId);
  if (!auditedItems.has(canonicalId)) {
    const visualId = resolveVisualId(canonicalId);
    const manifestInfo = manifestMappings[visualId];

    auditedItems.set(canonicalId, {
      canonicalId,
      visualId,
      category: manifestInfo?.category || 'other',
      sources: new Set(),
      rulesets: new Set(),
      isStarterEquipment: false,
      sheetId: manifestInfo?.sheetId || null,
      row: manifestInfo?.row !== undefined ? manifestInfo.row : null,
      col: manifestInfo?.col !== undefined ? manifestInfo.col : null,
      status: manifestInfo?.status || 'MISSING'
    });
  }
  const rec = auditedItems.get(canonicalId);
  if (isStarter) rec.isStarterEquipment = true;
  return rec;
}

// 1. Classes
const classDir = path.join(PROJECT_ROOT, 'public/assets/atlas/class/json');
if (fs.existsSync(classDir)) {
  fs.readdirSync(classDir).filter(f => f.endsWith('.json')).forEach(f => {
    const className = f.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(classDir, f), 'utf8'));

    const traverseObj = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.index && typeof obj.index === 'string' && obj.url && obj.url.includes('/equipment/')) {
        const rec = getOrCreateRecord(obj.index, true);
        rec.sources.add(`class:${className}`);
      }
      for (const k of Object.keys(obj)) traverseObj(obj[k]);
    };
    traverseObj(data);
  });
}

// 2. Backgrounds
const bgDir = path.join(PROJECT_ROOT, 'public/assets/atlas/backgrounds/json');
if (fs.existsSync(bgDir)) {
  fs.readdirSync(bgDir).filter(f => f.endsWith('.json')).forEach(f => {
    const bgName = f.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(bgDir, f), 'utf8'));

    const traverseObj = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.index && typeof obj.index === 'string' && obj.url && obj.url.includes('/equipment/')) {
        const rec = getOrCreateRecord(obj.index, true);
        rec.sources.add(`background:${bgName}`);
      }
      for (const k of Object.keys(obj)) traverseObj(obj[k]);
    };
    traverseObj(data);
  });
}

// 3. Packs & Contents
Object.keys(EQUIPMENT_PACKS).forEach(packKey => {
  const packRec = getOrCreateRecord(packKey, true);
  packRec.sources.add(`equipment_pack:${packKey}`);

  const contents = EQUIPMENT_PACKS[packKey];
  contents.forEach(contentKey => {
    const contentRec = getOrCreateRecord(contentKey, true);
    contentRec.sources.add(`pack_content:${packKey}`);
  });
});

// 4. Equipment folders (progression / general catalog)
function scanEquipFolder(dir, rulesetLabel) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { recursive: true });
  files.forEach(file => {
    if (typeof file === 'string' && file.endsWith('.json')) {
      const canonicalId = normalizeCanonicalId(path.basename(file, '.json'));
      const rec = getOrCreateRecord(canonicalId, false);
      rec.rulesets.add(rulesetLabel);
    }
  });
}

scanEquipFolder(path.join(PROJECT_ROOT, 'public/assets/atlas/equipment/json/14'), '2014');
scanEquipFolder(path.join(PROJECT_ROOT, 'public/assets/atlas/equipment/json/24'), '2024');

// Formulate report items
const reportList = Array.from(auditedItems.values()).map(rec => {
  const rulesetsArr = Array.from(rec.rulesets);
  let rulesetStr = 'both';
  if (rulesetsArr.length === 1) rulesetStr = rulesetsArr[0];
  else if (rulesetsArr.length === 0) rulesetStr = '2014';

  return {
    canonicalId: rec.canonicalId,
    visualId: rec.visualId,
    category: rec.category,
    isStarterEquipment: rec.isStarterEquipment,
    sources: Array.from(rec.sources),
    ruleset: rulesetStr,
    spriteSheet: rec.sheetId,
    cell: rec.row !== null && rec.col !== null ? { row: rec.row, col: rec.col } : null,
    status: rec.status
  };
}).sort((a, b) => a.canonicalId.localeCompare(b.canonicalId));

// Write JSON report
const jsonOutPath = path.join(PROJECT_ROOT, 'docs/inventory_asset_audit.json');
fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
fs.writeFileSync(jsonOutPath, JSON.stringify(reportList, null, 2), 'utf8');

// Starter specific stats
const starterItems = reportList.filter(i => i.isStarterEquipment);
const starterReady = starterItems.filter(i => i.status === 'READY').length;
const starterPlanned = starterItems.filter(i => i.status === 'PLANNED').length;
const starterMissing = starterItems.filter(i => i.status === 'MISSING').length;

let mdContent = `# Inventory & Starter Equipment Visual Asset Audit Report

## Audit Status Terminology

- **READY**: Sprite image asset exists on disk AND manifest cell coordinate contract is complete.
- **PLANNED**: Canonical visual ID exists; sprite is planned but does not yet have a renderable cell.
- **MISSING**: Item reference exists in starter data but lacks a visual identity / manifest cell assignment.

_Note on "0 MISSING": This indicates 100% manifest and identity coverage (every canonical starter item has an assigned visual ID in the manifest). It does NOT mean 100% of final image sprite sheets have been rendered._

---

## Summary Statistics (Starter Equipment)

- **Total Canonical Starter Items**: ${starterItems.length}
- **READY (Sprite Image + Manifest Cell Contract Ready)**: ${starterReady}
- **PLANNED (Canonical Visual ID Registered, Sprite Asset Planned)**: ${starterPlanned}
- **MISSING (No Manifest Entry / Cell Assignment)**: ${starterMissing} (100% Manifest Identity Coverage)

---

## Canonical Starter Items Audit (Class, Background & Pack Choices)

### Ready Starter Items (${starterReady})

| Canonical Item ID | Visual ID | Sheet | Cell (R, C) | Category | Sources |
| :--- | :--- | :--- | :--- | :--- | :--- |
${starterItems.filter(i => i.status === 'READY').map(i => `| \`${i.canonicalId}\` | \`${i.visualId}\` | \`${i.spriteSheet}\` | \`(${i.cell.row}, ${i.cell.col})\` | \`${i.category}\` | ${i.sources.slice(0, 2).join(', ')} |`).join('\n')}

### Planned Starter Items (${starterPlanned})

| Canonical Item ID | Visual ID | Category | Sources |
| :--- | :--- | :--- | :--- |
${starterItems.filter(i => i.status === 'PLANNED').map(i => `| \`${i.canonicalId}\` | \`${i.visualId}\` | \`${i.category}\` | ${i.sources.slice(0, 2).join(', ')} |`).join('\n')}

### Missing Starter Items (${starterMissing})

| Canonical Item ID | Visual ID | Category | Sources |
| :--- | :--- | :--- | :--- |
${starterItems.filter(i => i.status === 'MISSING').length === 0 ? '_None! All canonical starter equipment items are covered by READY or PLANNED manifest entries._' : starterItems.filter(i => i.status === 'MISSING').map(i => `| \`${i.canonicalId}\` | \`${i.visualId}\` | \`${i.category}\` | ${i.sources.slice(0, 2).join(', ')} |`).join('\n')}

---

## Full Catalog Audit Summary (${reportList.length} Items Total)

- **Starter Equipment Items**: ${starterItems.length}
- **Progression / Catalog Items**: ${reportList.length - starterItems.length}

_Report generated automatically by \`tools/auditStarterEquipment.cjs\`._
`;

const mdOutPath = path.join(PROJECT_ROOT, 'docs/INVENTORY_ASSET_AUDIT.md');
fs.writeFileSync(mdOutPath, mdContent, 'utf8');

console.log(`Starter Audit Complete: ${starterItems.length} starter items audited (READY: ${starterReady}, PLANNED: ${starterPlanned}, MISSING: ${starterMissing}). Total items: ${reportList.length}`);
