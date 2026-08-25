/**
 * tools/auditStarterEquipment.cjs
 *
 * Comprehensive audit script for starting equipment across classes, backgrounds,
 * equipment packs, and versioned ruleset databases (2014 & 2024).
 *
 * Generates:
 * - docs/inventory_asset_audit.json (machine-readable)
 * - docs/INVENTORY_ASSET_AUDIT.md (human-readable report)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const CLASS_DIR = path.join(PROJECT_ROOT, 'public/assets/atlas/class/json');
const BG_DIR = path.join(PROJECT_ROOT, 'public/assets/atlas/backgrounds/json');
const EQUIP_14_DIR = path.join(PROJECT_ROOT, 'public/assets/atlas/equipment/json/14');
const EQUIP_24_DIR = path.join(PROJECT_ROOT, 'public/assets/atlas/equipment/json/24');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// Pack definitions matching src/lib/itemPacks.ts
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
    'backpack', 'bedroll', 'mess-kit', 'tinderbox', 'torch', 'rations-1-day',
    'waterskin', 'rope-hempen-50-feet'
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

// Known visual identity mapping table mirroring src/lib/inventoryVisuals/
const VISUAL_MAPPING = {
  // Starter Weapons 01
  'dagger': { visualId: 'equipment.dagger', sheet: 'starter_weapons_01', cell: 'row 0, col 0', cat: 'weapon' },
  'handaxe': { visualId: 'equipment.handaxe', sheet: 'starter_weapons_01', cell: 'row 0, col 1', cat: 'weapon' },
  'javelin': { visualId: 'equipment.javelin', sheet: 'starter_weapons_01', cell: 'row 0, col 2', cat: 'weapon' },
  'mace': { visualId: 'equipment.mace', sheet: 'starter_weapons_01', cell: 'row 0, col 3', cat: 'weapon' },
  'quarterstaff': { visualId: 'equipment.quarterstaff', sheet: 'starter_weapons_01', cell: 'row 1, col 0', cat: 'weapon' },
  'sickle': { visualId: 'equipment.sickle', sheet: 'starter_weapons_01', cell: 'row 1, col 1', cat: 'weapon' },
  'club': { visualId: 'equipment.club', sheet: 'starter_weapons_01', cell: 'row 1, col 2', cat: 'weapon' },
  'spear': { visualId: 'equipment.spear', sheet: 'starter_weapons_01', cell: 'row 1, col 3', cat: 'weapon' },
  'shortsword': { visualId: 'equipment.shortsword', sheet: 'starter_weapons_01', cell: 'row 2, col 0', cat: 'weapon' },
  'rapier': { visualId: 'equipment.rapier', sheet: 'starter_weapons_01', cell: 'row 2, col 1', cat: 'weapon' },
  'longsword': { visualId: 'equipment.longsword', sheet: 'starter_weapons_01', cell: 'row 2, col 2', cat: 'weapon' },
  'scimitar': { visualId: 'equipment.scimitar', sheet: 'starter_weapons_01', cell: 'row 2, col 3', cat: 'weapon' },
  'greatsword': { visualId: 'equipment.greatsword', sheet: 'starter_weapons_01', cell: 'row 3, col 0', cat: 'weapon' },
  'greataxe': { visualId: 'equipment.greataxe', sheet: 'starter_weapons_01', cell: 'row 3, col 1', cat: 'weapon' },
  'greatclub': { visualId: 'equipment.greatclub', sheet: 'starter_weapons_01', cell: 'row 3, col 2', cat: 'weapon' },
  'light-hammer': { visualId: 'equipment.light_hammer', sheet: 'starter_weapons_01', cell: 'row 3, col 3', cat: 'weapon' },

  // Starter Weapons 02
  'shortbow': { visualId: 'equipment.shortbow', sheet: 'starter_weapons_02', cell: 'row 0, col 0', cat: 'weapon' },
  'longbow': { visualId: 'equipment.longbow', sheet: 'starter_weapons_02', cell: 'row 0, col 1', cat: 'weapon' },
  'light-crossbow': { visualId: 'equipment.light_crossbow', sheet: 'starter_weapons_02', cell: 'row 0, col 2', cat: 'weapon' },
  'heavy-crossbow': { visualId: 'equipment.heavy_crossbow', sheet: 'starter_weapons_02', cell: 'row 0, col 3', cat: 'weapon' },
  'sling': { visualId: 'equipment.sling', sheet: 'starter_weapons_02', cell: 'row 1, col 0', cat: 'weapon' },
  'dart': { visualId: 'equipment.dart', sheet: 'starter_weapons_02', cell: 'row 1, col 1', cat: 'weapon' },
  'blowgun': { visualId: 'equipment.blowgun', sheet: 'starter_weapons_02', cell: 'row 1, col 2', cat: 'weapon' },
  'trident': { visualId: 'equipment.trident', sheet: 'starter_weapons_02', cell: 'row 1, col 3', cat: 'weapon' },
  'warhammer': { visualId: 'equipment.warhammer', sheet: 'starter_weapons_02', cell: 'row 2, col 0', cat: 'weapon' },
  'battleaxe': { visualId: 'equipment.battleaxe', sheet: 'starter_weapons_02', cell: 'row 2, col 1', cat: 'weapon' },
  'flail': { visualId: 'equipment.flail', sheet: 'starter_weapons_02', cell: 'row 2, col 2', cat: 'weapon' },
  'maul': { visualId: 'equipment.maul', sheet: 'starter_weapons_02', cell: 'row 2, col 3', cat: 'weapon' },
  'morningstar': { visualId: 'equipment.morningstar', sheet: 'starter_weapons_02', cell: 'row 3, col 0', cat: 'weapon' },
  'pike': { visualId: 'equipment.pike', sheet: 'starter_weapons_02', cell: 'row 3, col 1', cat: 'weapon' },
  'halberd': { visualId: 'equipment.halberd', sheet: 'starter_weapons_02', cell: 'row 3, col 2', cat: 'weapon' },
  'glaive': { visualId: 'equipment.glaive', sheet: 'starter_weapons_02', cell: 'row 3, col 3', cat: 'weapon' },

  // Starter Armor 01
  'padded-armor': { visualId: 'equipment.padded_armor', sheet: 'starter_armor_01', cell: 'row 0, col 0', cat: 'armor' },
  'leather-armor': { visualId: 'equipment.leather_armor', sheet: 'starter_armor_01', cell: 'row 0, col 1', cat: 'armor' },
  'studded-leather-armor': { visualId: 'equipment.studded_leather_armor', sheet: 'starter_armor_01', cell: 'row 0, col 2', cat: 'armor' },
  'hide-armor': { visualId: 'equipment.hide_armor', sheet: 'starter_armor_01', cell: 'row 0, col 3', cat: 'armor' },
  'chain-shirt': { visualId: 'equipment.chain_shirt', sheet: 'starter_armor_01', cell: 'row 1, col 0', cat: 'armor' },
  'scale-mail': { visualId: 'equipment.scale_mail', sheet: 'starter_armor_01', cell: 'row 1, col 1', cat: 'armor' },
  'breastplate': { visualId: 'equipment.breastplate', sheet: 'starter_armor_01', cell: 'row 1, col 2', cat: 'armor' },
  'half-plate': { visualId: 'equipment.half_plate', sheet: 'starter_armor_01', cell: 'row 1, col 3', cat: 'armor' },
  'ring-mail': { visualId: 'equipment.ring_mail', sheet: 'starter_armor_01', cell: 'row 2, col 0', cat: 'armor' },
  'chain-mail': { visualId: 'equipment.chain_mail', sheet: 'starter_armor_01', cell: 'row 2, col 1', cat: 'armor' },
  'splint-armor': { visualId: 'equipment.splint_armor', sheet: 'starter_armor_01', cell: 'row 2, col 2', cat: 'armor' },
  'plate-armor': { visualId: 'equipment.plate_armor', sheet: 'starter_armor_01', cell: 'row 2, col 3', cat: 'armor' },
  'shield': { visualId: 'equipment.shield', sheet: 'starter_armor_01', cell: 'row 3, col 0', cat: 'armor' },

  // Starter Adventuring 01
  'explorers-pack': { visualId: 'equipment.explorers_pack', sheet: 'starter_adventuring_01', cell: 'row 0, col 0', cat: 'pack' },
  'dungeoneers-pack': { visualId: 'equipment.dungeoneers_pack', sheet: 'starter_adventuring_01', cell: 'row 0, col 1', cat: 'pack' },
  'burglars-pack': { visualId: 'equipment.burglars_pack', sheet: 'starter_adventuring_01', cell: 'row 0, col 2', cat: 'pack' },
  'diplomats-pack': { visualId: 'equipment.diplomats_pack', sheet: 'starter_adventuring_01', cell: 'row 0, col 3', cat: 'pack' },
  'entertainers-pack': { visualId: 'equipment.entertainers_pack', sheet: 'starter_adventuring_01', cell: 'row 1, col 0', cat: 'pack' },
  'priests-pack': { visualId: 'equipment.priests_pack', sheet: 'starter_adventuring_01', cell: 'row 1, col 1', cat: 'pack' },
  'scholars-pack': { visualId: 'equipment.scholars_pack', sheet: 'starter_adventuring_01', cell: 'row 1, col 2', cat: 'pack' },
  'backpack': { visualId: 'equipment.backpack', sheet: 'starter_adventuring_01', cell: 'row 2, col 0', cat: 'container' },
  'bedroll': { visualId: 'equipment.bedroll', sheet: 'starter_adventuring_01', cell: 'row 2, col 1', cat: 'adventuring_gear' },
  'rope-hempen-50-feet': { visualId: 'equipment.rope_hempen_50', sheet: 'starter_adventuring_01', cell: 'row 2, col 2', cat: 'adventuring_gear' },
  'rations-1-day': { visualId: 'equipment.rations', sheet: 'starter_adventuring_01', cell: 'row 2, col 3', cat: 'adventuring_gear' },
  'torch': { visualId: 'equipment.torch', sheet: 'starter_adventuring_01', cell: 'row 3, col 0', cat: 'adventuring_gear' },
  'tinderbox': { visualId: 'equipment.tinderbox', sheet: 'starter_adventuring_01', cell: 'row 3, col 1', cat: 'adventuring_gear' },
  'waterskin': { visualId: 'equipment.waterskin', sheet: 'starter_adventuring_01', cell: 'row 3, col 2', cat: 'adventuring_gear' },
  'mess-kit': { visualId: 'equipment.mess_kit', sheet: 'starter_adventuring_01', cell: 'row 3, col 3', cat: 'adventuring_gear' },

  // Starter Tools 01
  'thieves-tools': { visualId: 'equipment.thieves_tools', sheet: 'starter_tools_01', cell: 'row 0, col 0', cat: 'tool' },
  'disguise-kit': { visualId: 'equipment.disguise_kit', sheet: 'starter_tools_01', cell: 'row 0, col 1', cat: 'tool' },
  'herbalism-kit': { visualId: 'equipment.herbalism_kit', sheet: 'starter_tools_01', cell: 'row 0, col 2', cat: 'tool' },
  'artisans-tools': { visualId: 'equipment.artisans_tools', sheet: 'starter_tools_01', cell: 'row 0, col 3', cat: 'tool' },
  'alchemists-supplies': { visualId: 'equipment.alchemists_supplies', sheet: 'starter_tools_01', cell: 'row 1, col 0', cat: 'tool' },
  'brewers-supplies': { visualId: 'equipment.brewers_supplies', sheet: 'starter_tools_01', cell: 'row 1, col 1', cat: 'tool' },
  'calligraphers-supplies': { visualId: 'equipment.calligraphers_supplies', sheet: 'starter_tools_01', cell: 'row 1, col 2', cat: 'tool' },
  'carpenters-tools': { visualId: 'equipment.carpenters_tools', sheet: 'starter_tools_01', cell: 'row 1, col 3', cat: 'tool' },
  'cartographers-tools': { visualId: 'equipment.cartographers_tools', sheet: 'starter_tools_01', cell: 'row 2, col 0', cat: 'tool' },
  'cooks-utensils': { visualId: 'equipment.cooks_utensils', sheet: 'starter_tools_01', cell: 'row 2, col 1', cat: 'tool' },
  'smiths-tools': { visualId: 'equipment.smiths_tools', sheet: 'starter_tools_01', cell: 'row 2, col 2', cat: 'tool' },
  'tinkers-tools': { visualId: 'equipment.tinkers_tools', sheet: 'starter_tools_01', cell: 'row 2, col 3', cat: 'tool' },

  // Starter Spellcasting 01
  'arcane-focus': { visualId: 'equipment.arcane_focus', sheet: 'starter_spellcasting_01', cell: 'row 0, col 0', cat: 'spellcasting' },
  'component-pouch': { visualId: 'equipment.component_pouch', sheet: 'starter_spellcasting_01', cell: 'row 0, col 1', cat: 'spellcasting' },
  'druidic-focus': { visualId: 'equipment.druidic_focus', sheet: 'starter_spellcasting_01', cell: 'row 0, col 2', cat: 'spellcasting' },
  'holy-symbol': { visualId: 'equipment.holy_symbol', sheet: 'starter_spellcasting_01', cell: 'row 0, col 3', cat: 'spellcasting' },
  'crystal': { visualId: 'equipment.crystal', sheet: 'starter_spellcasting_01', cell: 'row 1, col 0', cat: 'spellcasting' },
  'orb': { visualId: 'equipment.orb', sheet: 'starter_spellcasting_01', cell: 'row 1, col 1', cat: 'spellcasting' },
  'rod': { visualId: 'equipment.rod', sheet: 'starter_spellcasting_01', cell: 'row 1, col 2', cat: 'spellcasting' },
  'staff': { visualId: 'equipment.staff', sheet: 'starter_spellcasting_01', cell: 'row 1, col 3', cat: 'spellcasting' },
  'wand': { visualId: 'equipment.wand', sheet: 'starter_spellcasting_01', cell: 'row 2, col 0', cat: 'spellcasting' },
  'spellbook': { visualId: 'equipment.spellbook', sheet: 'starter_spellcasting_01', cell: 'row 2, col 1', cat: 'spellcasting' },
  'amulet': { visualId: 'equipment.amulet', sheet: 'starter_spellcasting_01', cell: 'row 2, col 2', cat: 'spellcasting' },
  'reliquary': { visualId: 'equipment.reliquary', sheet: 'starter_spellcasting_01', cell: 'row 2, col 3', cat: 'spellcasting' },
  'emblem': { visualId: 'equipment.emblem', sheet: 'starter_spellcasting_01', cell: 'row 3, col 0', cat: 'spellcasting' },
  'sprig-of-mistletoe': { visualId: 'equipment.sprig_of_mistletoe', sheet: 'starter_spellcasting_01', cell: 'row 3, col 1', cat: 'spellcasting' },
  'totem': { visualId: 'equipment.totem', sheet: 'starter_spellcasting_01', cell: 'row 3, col 2', cat: 'spellcasting' },

  // Starter Personal 01
  'clothes-common': { visualId: 'equipment.clothes_common', sheet: 'starter_personal_01', cell: 'row 0, col 0', cat: 'personal' },
  'clothes-fine': { visualId: 'equipment.clothes_fine', sheet: 'starter_personal_01', cell: 'row 0, col 1', cat: 'personal' },
  'clothes-travelers': { visualId: 'equipment.clothes_travelers', sheet: 'starter_personal_01', cell: 'row 0, col 2', cat: 'personal' },
  'costume': { visualId: 'equipment.costume', sheet: 'starter_personal_01', cell: 'row 0, col 3', cat: 'personal' },
  'pouch': { visualId: 'equipment.pouch', sheet: 'starter_personal_01', cell: 'row 1, col 0', cat: 'personal' },
  'chest': { visualId: 'equipment.chest', sheet: 'starter_personal_01', cell: 'row 1, col 1', cat: 'personal' },
  'candle': { visualId: 'equipment.candle', sheet: 'starter_personal_01', cell: 'row 1, col 2', cat: 'personal' },
  'lantern-hooded': { visualId: 'equipment.lantern_hooded', sheet: 'starter_personal_01', cell: 'row 1, col 3', cat: 'personal' },
  'oil-flask': { visualId: 'equipment.oil_flask', sheet: 'starter_personal_01', cell: 'row 2, col 0', cat: 'personal' },
  'blanket': { visualId: 'equipment.blanket', sheet: 'starter_personal_01', cell: 'row 2, col 1', cat: 'personal' },
  'ink-1-ounce-bottle': { visualId: 'equipment.ink_bottle', sheet: 'starter_personal_01', cell: 'row 2, col 2', cat: 'personal' },
  'ink-pen': { visualId: 'equipment.ink_pen', sheet: 'starter_personal_01', cell: 'row 2, col 3', cat: 'personal' },
  'parchment-one-sheet': { visualId: 'equipment.parchment_sheet', sheet: 'starter_personal_01', cell: 'row 3, col 0', cat: 'personal' },
  'book-of-lore': { visualId: 'equipment.book_lore', sheet: 'starter_personal_01', cell: 'row 3, col 1', cat: 'personal' },
};

// Check existing sprite sheet images
function checkSheetImageExists(sheetId) {
  const relPath = `public/assets/atlas/equipment/sprites/${sheetId}.webp`;
  return fs.existsSync(path.join(PROJECT_ROOT, relPath));
}

// Extract items recursively from class/background option structures
function extractItemsFromOption(opt, sourceName, foundItems) {
  if (!opt) return;
  if (opt.of && opt.of.index) {
    foundItems.push({ item: opt.of.index, source: sourceName });
  }
  if (opt.items && Array.isArray(opt.items)) {
    opt.items.forEach(i => extractItemsFromOption(i, sourceName, foundItems));
  }
  if (opt.options && Array.isArray(opt.options)) {
    opt.options.forEach(o => extractItemsFromOption(o, sourceName, foundItems));
  }
  if (opt.from && opt.from.options && Array.isArray(opt.from.options)) {
    opt.from.options.forEach(o => extractItemsFromOption(o, sourceName, foundItems));
  }
  if (opt.choice && opt.choice.from && opt.choice.from.options) {
    opt.choice.from.options.forEach(o => extractItemsFromOption(o, sourceName, foundItems));
  }
}

function main() {
  console.log('--- Starting Starter Equipment Asset Audit ---');

  const starterItemsMap = new Map();

  const addItemReference = (canonicalId, source, ruleset) => {
    const cleanId = canonicalId.toLowerCase().replace(/_/g, '-');
    if (!starterItemsMap.has(cleanId)) {
      starterItemsMap.set(cleanId, {
        canonicalId: cleanId,
        sources: new Set(),
        rulesets: new Set()
      });
    }
    const entry = starterItemsMap.get(cleanId);
    if (source) entry.sources.add(source);
    if (ruleset) entry.rulesets.add(ruleset);
  };

  // 1. Audit Classes
  if (fs.existsSync(CLASS_DIR)) {
    fs.readdirSync(CLASS_DIR).forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(CLASS_DIR, file), 'utf8'));
          const className = `Class: ${content.name || file.replace('.json', '')}`;

          if (Array.isArray(content.starting_equipment)) {
            content.starting_equipment.forEach(e => {
              if (e.equipment && e.equipment.index) {
                addItemReference(e.equipment.index, className, '2014');
              }
            });
          }

          if (Array.isArray(content.starting_equipment_options)) {
            content.starting_equipment_options.forEach(opt => {
              const found = [];
              extractItemsFromOption(opt, className, found);
              found.forEach(f => addItemReference(f.item, className, '2014'));
            });
          }
        } catch (e) {
          console.warn(`Could not parse class file ${file}: ${e.message}`);
        }
      }
    });
  }

  // 2. Audit Backgrounds
  if (fs.existsSync(BG_DIR)) {
    fs.readdirSync(BG_DIR).forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(BG_DIR, file), 'utf8'));
          const bgName = `Background: ${content.name || file.replace('.json', '')}`;
          if (Array.isArray(content.starting_equipment)) {
            content.starting_equipment.forEach(e => {
              if (e.equipment && e.equipment.index) {
                addItemReference(e.equipment.index, bgName, '2014');
              }
            });
          }
        } catch (e) {
          console.warn(`Could not parse background file ${file}: ${e.message}`);
        }
      }
    });
  }

  // 3. Audit Packs and Pack Contents
  Object.entries(EQUIPMENT_PACKS).forEach(([packKey, contents]) => {
    const packSource = `Pack: ${packKey}`;
    addItemReference(packKey, packSource, 'both');
    contents.forEach(contentItem => {
      addItemReference(contentItem, `${packSource} (Content)`, 'both');
    });
  });

  // 4. Audit Equipment Databases (2014 & 2024)
  const scanEquipDir = (dir, ruleset) => {
    if (!fs.existsSync(dir)) return;
    const walk = (d) => {
      fs.readdirSync(d).forEach(f => {
        const full = path.join(d, f);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (f.endsWith('.json')) {
          const cleanId = f.replace('.json', '');
          addItemReference(cleanId, `Database (${ruleset})`, ruleset);
        }
      });
    };
    walk(dir);
  };
  scanEquipDir(EQUIP_14_DIR, '2014');
  scanEquipDir(EQUIP_24_DIR, '2024');

  // Build audit entries
  const auditEntries = [];
  let readyCount = 0;
  let plannedCount = 0;
  let missingCount = 0;

  for (const [cleanId, data] of starterItemsMap.entries()) {
    const mapped = VISUAL_MAPPING[cleanId] || {
      visualId: `equipment.${cleanId.replace(/-/g, '_')}`,
      sheet: 'NONE',
      cell: 'UNASSIGNED',
      cat: cleanId.includes('pack') ? 'pack' : 'adventuring_gear'
    };

    let status = 'MISSING';
    let notes = 'Awaiting sprite cell planning and asset production.';

    if (mapped.sheet !== 'NONE' && mapped.cell !== 'UNASSIGNED') {
      const sheetImgExists = checkSheetImageExists(mapped.sheet);
      if (sheetImgExists) {
        status = 'READY';
        notes = 'Visual ID mapped, cell assigned, sprite sheet rendered on disk.';
        readyCount++;
      } else {
        status = 'PLANNED';
        notes = 'Visual ID mapped and cell assigned in manifest; awaiting image generation.';
        plannedCount++;
      }
    } else {
      missingCount++;
    }

    auditEntries.push({
      canonicalId: cleanId,
      visualId: mapped.visualId,
      category: mapped.cat,
      sources: Array.from(data.sources),
      rulesets: Array.from(data.rulesets),
      spriteSheet: mapped.sheet,
      cell: mapped.cell,
      status,
      notes
    });
  }

  auditEntries.sort((a, b) => a.canonicalId.localeCompare(b.canonicalId));

  // Write JSON report
  const jsonReportPath = path.join(DOCS_DIR, 'inventory_asset_audit.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify({
    summary: {
      totalStarterItems: auditEntries.length,
      ready: readyCount,
      planned: plannedCount,
      missing: missingCount,
      generatedAt: new Date().toISOString()
    },
    items: auditEntries
  }, null, 2), 'utf8');

  // Write Markdown report
  let mdContent = `# Inventory & Starter Equipment Asset Audit Report\n\n`;
  mdContent += `*Generated on: ${new Date().toLocaleDateString()}*\n\n`;
  mdContent += `## Executive Summary\n\n`;
  mdContent += `- **Total Starter Items Audited:** ${auditEntries.length}\n`;
  mdContent += `- **READY (Mapped + Image Exists):** ${readyCount}\n`;
  mdContent += `- **PLANNED (Mapped + Manifest Cell Reserved):** ${plannedCount}\n`;
  mdContent += `- **MISSING (Needs Sprite Cell Assignment):** ${missingCount}\n\n`;

  mdContent += `## Starter Items Audit Status\n\n`;
  mdContent += `| Canonical Item ID | Visual Identity | Category | Rulesets | Sprite Sheet | Cell | Status |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  auditEntries.forEach(item => {
    const rulesStr = item.rulesets.join(', ');
    mdContent += `| \`${item.canonicalId}\` | \`${item.visualId}\` | ${item.category} | ${rulesStr} | ${item.spriteSheet} | ${item.cell} | **${item.status}** |\n`;
  });

  mdContent += `\n\n## Unresolved / Missing Starter Assets\n\n`;
  mdContent += `The following items still require visual identity assignment or sprite cell planning:\n\n`;
  const missingItems = auditEntries.filter(i => i.status === 'MISSING');
  if (missingItems.length === 0) {
    mdContent += `*All starter items have assigned visual identities and planned manifest cells.*\n`;
  } else {
    missingItems.forEach(mi => {
      mdContent += `- \`${mi.canonicalId}\` (${mi.category})\n`;
    });
  }

  const mdReportPath = path.join(DOCS_DIR, 'INVENTORY_ASSET_AUDIT.md');
  fs.writeFileSync(mdReportPath, mdContent, 'utf8');

  console.log(`Successfully generated:\n- ${jsonReportPath}\n- ${mdReportPath}`);
  console.log(`Summary: Total: ${auditEntries.length} | READY: ${readyCount} | PLANNED: ${plannedCount} | MISSING: ${missingCount}`);
}

main();
