import { SpriteSheetSpec, SpriteCellLocation, SpriteManifestMap } from './types';

/**
 * Authoritative registry of starter equipment sprite sheet specifications.
 * Defines dimensions, paths, and grid layout for asset sheets.
 */
export const SPRITE_SHEET_SPECS: Record<string, SpriteSheetSpec> = {
  starter_weapons_01: {
    id: 'starter_weapons_01',
    name: 'Starter Weapons Sheet 1 (Melee & Martial)',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_weapons_01.webp',
    isStarter: true,
  },
  starter_weapons_02: {
    id: 'starter_weapons_02',
    name: 'Starter Weapons Sheet 2 (Ranged & Heavy)',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_weapons_02.webp',
    isStarter: true,
  },
  starter_armor_01: {
    id: 'starter_armor_01',
    name: 'Starter Armor & Shields Sheet 1',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_armor_01.webp',
    isStarter: true,
  },
  starter_adventuring_01: {
    id: 'starter_adventuring_01',
    name: 'Starter Adventuring Gear & Packs Sheet 1',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_adventuring_01.webp',
    isStarter: true,
  },
  starter_tools_01: {
    id: 'starter_tools_01',
    name: 'Starter Tools & Artisan Kits Sheet 1',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_tools_01.webp',
    isStarter: true,
  },
  starter_spellcasting_01: {
    id: 'starter_spellcasting_01',
    name: 'Starter Spellcasting & Focus Sheet 1',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_spellcasting_01.webp',
    isStarter: true,
  },
  starter_personal_01: {
    id: 'starter_personal_01',
    name: 'Starter Personal & Roleplay Items Sheet 1',
    rows: 4,
    cols: 4,
    cellWidth: 64,
    cellHeight: 64,
    assetPath: '/assets/atlas/equipment/sprites/starter_personal_01.webp',
    isStarter: true,
  },
};

/**
 * Authoritative Sprite Manifest.
 * Maps visual identities (e.g. 'equipment.longsword') to sprite sheet locations.
 */
export const SPRITE_MANIFEST: SpriteManifestMap = {
  // --- STARTER WEAPONS 01 ---
  'equipment.dagger': { sheetId: 'starter_weapons_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.handaxe': { sheetId: 'starter_weapons_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.javelin': { sheetId: 'starter_weapons_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.mace': { sheetId: 'starter_weapons_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.quarterstaff': { sheetId: 'starter_weapons_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.sickle': { sheetId: 'starter_weapons_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.club': { sheetId: 'starter_weapons_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.spear': { sheetId: 'starter_weapons_01', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.shortsword': { sheetId: 'starter_weapons_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.rapier': { sheetId: 'starter_weapons_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.longsword': { sheetId: 'starter_weapons_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.scimitar': { sheetId: 'starter_weapons_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.greatsword': { sheetId: 'starter_weapons_01', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.greataxe': { sheetId: 'starter_weapons_01', row: 3, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.greatclub': { sheetId: 'starter_weapons_01', row: 3, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.light_hammer': { sheetId: 'starter_weapons_01', row: 3, col: 3, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER WEAPONS 02 ---
  'equipment.shortbow': { sheetId: 'starter_weapons_02', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.longbow': { sheetId: 'starter_weapons_02', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.light_crossbow': { sheetId: 'starter_weapons_02', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.heavy_crossbow': { sheetId: 'starter_weapons_02', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.sling': { sheetId: 'starter_weapons_02', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.dart': { sheetId: 'starter_weapons_02', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.blowgun': { sheetId: 'starter_weapons_02', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.trident': { sheetId: 'starter_weapons_02', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.warhammer': { sheetId: 'starter_weapons_02', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.battleaxe': { sheetId: 'starter_weapons_02', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.flail': { sheetId: 'starter_weapons_02', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.maul': { sheetId: 'starter_weapons_02', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.morningstar': { sheetId: 'starter_weapons_02', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.pike': { sheetId: 'starter_weapons_02', row: 3, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.halberd': { sheetId: 'starter_weapons_02', row: 3, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.glaive': { sheetId: 'starter_weapons_02', row: 3, col: 3, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER SPELLCASTING 01 ---
  'equipment.arcane_focus': { sheetId: 'starter_spellcasting_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.component_pouch': { sheetId: 'starter_spellcasting_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.druidic_focus': { sheetId: 'starter_spellcasting_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.holy_symbol': { sheetId: 'starter_spellcasting_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.crystal': { sheetId: 'starter_spellcasting_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.orb': { sheetId: 'starter_spellcasting_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.rod': { sheetId: 'starter_spellcasting_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.staff': { sheetId: 'starter_spellcasting_01', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.wand': { sheetId: 'starter_spellcasting_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.spellbook': { sheetId: 'starter_spellcasting_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.amulet': { sheetId: 'starter_spellcasting_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.reliquary': { sheetId: 'starter_spellcasting_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.emblem': { sheetId: 'starter_spellcasting_01', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.sprig_of_mistletoe': { sheetId: 'starter_spellcasting_01', row: 3, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.totem': { sheetId: 'starter_spellcasting_01', row: 3, col: 2, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER ARMOR 01 ---
  'equipment.padded_armor': { sheetId: 'starter_armor_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.leather_armor': { sheetId: 'starter_armor_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.studded_leather_armor': { sheetId: 'starter_armor_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.hide_armor': { sheetId: 'starter_armor_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.chain_shirt': { sheetId: 'starter_armor_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.scale_mail': { sheetId: 'starter_armor_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.breastplate': { sheetId: 'starter_armor_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.half_plate': { sheetId: 'starter_armor_01', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.ring_mail': { sheetId: 'starter_armor_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.chain_mail': { sheetId: 'starter_armor_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.splint_armor': { sheetId: 'starter_armor_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.plate_armor': { sheetId: 'starter_armor_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.shield': { sheetId: 'starter_armor_01', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER ADVENTURING 01 ---
  'equipment.explorers_pack': { sheetId: 'starter_adventuring_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.dungeoneers_pack': { sheetId: 'starter_adventuring_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.burglars_pack': { sheetId: 'starter_adventuring_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.diplomats_pack': { sheetId: 'starter_adventuring_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.entertainers_pack': { sheetId: 'starter_adventuring_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.priests_pack': { sheetId: 'starter_adventuring_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.scholars_pack': { sheetId: 'starter_adventuring_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.backpack': { sheetId: 'starter_adventuring_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.bedroll': { sheetId: 'starter_adventuring_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.rope_hempen_50': { sheetId: 'starter_adventuring_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.rations': { sheetId: 'starter_adventuring_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.torch': { sheetId: 'starter_adventuring_01', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.tinderbox': { sheetId: 'starter_adventuring_01', row: 3, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.waterskin': { sheetId: 'starter_adventuring_01', row: 3, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.mess_kit': { sheetId: 'starter_adventuring_01', row: 3, col: 3, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER TOOLS 01 ---
  'equipment.thieves_tools': { sheetId: 'starter_tools_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.disguise_kit': { sheetId: 'starter_tools_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.herbalism_kit': { sheetId: 'starter_tools_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.artisans_tools': { sheetId: 'starter_tools_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.alchemists_supplies': { sheetId: 'starter_tools_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.brewers_supplies': { sheetId: 'starter_tools_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.calligraphers_supplies': { sheetId: 'starter_tools_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.carpenters_tools': { sheetId: 'starter_tools_01', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.cartographers_tools': { sheetId: 'starter_tools_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.cooks_utensils': { sheetId: 'starter_tools_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.smiths_tools': { sheetId: 'starter_tools_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.tinkers_tools': { sheetId: 'starter_tools_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },

  // --- STARTER PERSONAL 01 ---
  'equipment.clothes_common': { sheetId: 'starter_personal_01', row: 0, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.clothes_fine': { sheetId: 'starter_personal_01', row: 0, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.clothes_travelers': { sheetId: 'starter_personal_01', row: 0, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.costume': { sheetId: 'starter_personal_01', row: 0, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.pouch': { sheetId: 'starter_personal_01', row: 1, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.chest': { sheetId: 'starter_personal_01', row: 1, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.candle': { sheetId: 'starter_personal_01', row: 1, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.lantern_hooded': { sheetId: 'starter_personal_01', row: 1, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.oil_flask': { sheetId: 'starter_personal_01', row: 2, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.blanket': { sheetId: 'starter_personal_01', row: 2, col: 1, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.ink_bottle': { sheetId: 'starter_personal_01', row: 2, col: 2, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.ink_pen': { sheetId: 'starter_personal_01', row: 2, col: 3, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.parchment_sheet': { sheetId: 'starter_personal_01', row: 3, col: 0, aspectRatio: '1:1', ruleset: 'both' },
  'equipment.book_lore': { sheetId: 'starter_personal_01', row: 3, col: 1, aspectRatio: '1:1', ruleset: 'both' },
};

/**
 * Returns sprite location for a given visual identity.
 */
export function getSpriteCell(visualId: string): SpriteCellLocation | null {
  return SPRITE_MANIFEST[visualId] || null;
}

/**
 * Returns specification details for a given sprite sheet ID.
 */
export function getSpriteSheet(sheetId: string): SpriteSheetSpec | null {
  return SPRITE_SHEET_SPECS[sheetId] || null;
}

/**
 * Returns all registered sprite sheet specifications.
 */
export function getAllSpriteSheets(): Record<string, SpriteSheetSpec> {
  return { ...SPRITE_SHEET_SPECS };
}

/**
 * Returns the entire sprite manifest mapping.
 */
export function getSpriteManifest(): SpriteManifestMap {
  return { ...SPRITE_MANIFEST };
}

/**
 * Validates manifest integrity:
 * - Every cell references a valid sheet.
 * - Coordinates are within specified row/col bounds.
 * - Detects duplicate cell assignments within the same sheet.
 */
export function validateManifest(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cellAssignments = new Map<string, string>(); // 'sheetId:row:col' -> visualId

  for (const [visualId, cell] of Object.entries(SPRITE_MANIFEST)) {
    const sheet = SPRITE_SHEET_SPECS[cell.sheetId];
    if (!sheet) {
      errors.push(`Visual '${visualId}' references unknown sheet '${cell.sheetId}'.`);
      continue;
    }

    if (cell.row < 0 || cell.row >= sheet.rows) {
      errors.push(`Visual '${visualId}' row index ${cell.row} out of bounds for sheet '${cell.sheetId}' (max ${sheet.rows - 1}).`);
    }

    if (cell.col < 0 || cell.col >= sheet.cols) {
      errors.push(`Visual '${visualId}' col index ${cell.col} out of bounds for sheet '${cell.sheetId}' (max ${sheet.cols - 1}).`);
    }

    const key = `${cell.sheetId}:${cell.row}:${cell.col}`;
    if (cellAssignments.has(key)) {
      errors.push(`Duplicate cell assignment at ${key}: '${visualId}' and '${cellAssignments.get(key)}'.`);
    } else {
      cellAssignments.set(key, visualId);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
