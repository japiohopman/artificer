import { SpriteSheetDefinition, SpriteCellMapping } from './types';

/**
 * Authoritative registry of all canonical starter sprite sheets.
 * Real `.webp` asset dimensions in public/assets/atlas/equipment/sprites/ are 1024 x 1792 px,
 * giving a grid layout of 4 columns by 7 rows (256 x 256 px per cell, 1:1 cell aspect ratio).
 */
export const SPRITE_SHEETS: Record<string, SpriteSheetDefinition> = {
  starter_weapons_01: {
    id: 'starter_weapons_01',
    path: '/assets/atlas/equipment/sprites/starter_weapons_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'weapon',
    description: 'Core simple & martial melee starter weapons',
  },
  starter_weapons_02: {
    id: 'starter_weapons_02',
    path: '/assets/atlas/equipment/sprites/starter_weapons_02.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'weapon',
    description: 'Ranged weapons, heavy martial weapons & ammunition',
  },
  starter_armor_01: {
    id: 'starter_armor_01',
    path: '/assets/atlas/equipment/sprites/starter_armor_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'armor',
    description: 'Light, medium, heavy armor and shields',
  },
  starter_adventuring_01: {
    id: 'starter_adventuring_01',
    path: '/assets/atlas/equipment/sprites/starter_adventuring_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'adventuring_gear',
    description: 'Equipment packs, containers, ropes, and basic survival gear',
  },
  starter_tools_01: {
    id: 'starter_tools_01',
    path: '/assets/atlas/equipment/sprites/starter_tools_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'tool',
    description: 'Artisan tools, thieves tools, musical instruments, and gaming sets',
  },
  starter_spellcasting_01: {
    id: 'starter_spellcasting_01',
    path: '/assets/atlas/equipment/sprites/starter_spellcasting_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'spellcasting',
    description: 'Arcane foci, holy symbols, druidic foci, vestments, and spellbooks',
  },
  starter_personal_01: {
    id: 'starter_personal_01',
    path: '/assets/atlas/equipment/sprites/starter_personal_01.webp',
    grid: { rows: 4, cols: 4 },
    aspectRatio: '1:1',
    category: 'personal',
    description: 'Starter clothing, trinkets, writing supplies, and roleplay items',
  },
};

/**
 * Master mapping from canonical VisualIdentity (e.g. `equipment.longsword`) to sprite sheet cell coordinates.
 */
export const SPRITE_MANIFEST: Record<string, SpriteCellMapping> = {
  // --- STARTER WEAPONS 01 (READY) ---
  'equipment.dagger': { visualId: 'equipment.dagger', sheetId: 'starter_weapons_01', row: 0, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.handaxe': { visualId: 'equipment.handaxe', sheetId: 'starter_weapons_01', row: 0, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.javelin': { visualId: 'equipment.javelin', sheetId: 'starter_weapons_01', row: 0, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.mace': { visualId: 'equipment.mace', sheetId: 'starter_weapons_01', row: 0, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.quarterstaff': { visualId: 'equipment.quarterstaff', sheetId: 'starter_weapons_01', row: 1, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.sickle': { visualId: 'equipment.sickle', sheetId: 'starter_weapons_01', row: 1, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.club': { visualId: 'equipment.club', sheetId: 'starter_weapons_01', row: 1, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.spear': { visualId: 'equipment.spear', sheetId: 'starter_weapons_01', row: 1, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.shortsword': { visualId: 'equipment.shortsword', sheetId: 'starter_weapons_01', row: 2, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.rapier': { visualId: 'equipment.rapier', sheetId: 'starter_weapons_01', row: 2, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.longsword': { visualId: 'equipment.longsword', sheetId: 'starter_weapons_01', row: 2, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.scimitar': { visualId: 'equipment.scimitar', sheetId: 'starter_weapons_01', row: 2, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.greatsword': { visualId: 'equipment.greatsword', sheetId: 'starter_weapons_01', row: 3, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.greataxe': { visualId: 'equipment.greataxe', sheetId: 'starter_weapons_01', row: 3, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.greatclub': { visualId: 'equipment.greatclub', sheetId: 'starter_weapons_01', row: 3, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.light_hammer': { visualId: 'equipment.light_hammer', sheetId: 'starter_weapons_01', row: 3, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },

  // --- STARTER WEAPONS 02 ---
  'equipment.shortbow': { visualId: 'equipment.shortbow', sheetId: 'starter_weapons_02', row: 0, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.longbow': { visualId: 'equipment.longbow', sheetId: 'starter_weapons_02', row: 0, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.light_crossbow': { visualId: 'equipment.light_crossbow', sheetId: 'starter_weapons_02', row: 0, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.heavy_crossbow': { visualId: 'equipment.heavy_crossbow', sheetId: 'starter_weapons_02', row: 0, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.sling': { visualId: 'equipment.sling', sheetId: 'starter_weapons_02', row: 1, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.dart': { visualId: 'equipment.dart', sheetId: 'starter_weapons_02', row: 1, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.blowgun': { visualId: 'equipment.blowgun', sheetId: 'starter_weapons_02', row: 1, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.trident': { visualId: 'equipment.trident', sheetId: 'starter_weapons_02', row: 1, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.warhammer': { visualId: 'equipment.warhammer', sheetId: 'starter_weapons_02', row: 2, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.battleaxe': { visualId: 'equipment.battleaxe', sheetId: 'starter_weapons_02', row: 2, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.flail': { visualId: 'equipment.flail', sheetId: 'starter_weapons_02', row: 2, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.maul': { visualId: 'equipment.maul', sheetId: 'starter_weapons_02', row: 2, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.morningstar': { visualId: 'equipment.morningstar', sheetId: 'starter_weapons_02', row: 3, col: 0, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.pike': { visualId: 'equipment.pike', sheetId: 'starter_weapons_02', row: 3, col: 1, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.halberd': { visualId: 'equipment.halberd', sheetId: 'starter_weapons_02', row: 3, col: 2, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.glaive': { visualId: 'equipment.glaive', sheetId: 'starter_weapons_02', row: 3, col: 3, status: 'READY', category: 'weapon', aspectRatio: '1:1' },
  'equipment.arrow': { visualId: 'equipment.arrow', status: 'PLANNED', category: 'weapon', aspectRatio: '1:1' },
  'equipment.crossbow_bolt': { visualId: 'equipment.crossbow_bolt', status: 'PLANNED', category: 'weapon', aspectRatio: '1:1' },
  'equipment.quiver': { visualId: 'equipment.quiver', status: 'PLANNED', category: 'weapon', aspectRatio: '1:1' },

  // --- STARTER ARMOR 01 ---
  'equipment.padded_armor': { visualId: 'equipment.padded_armor', sheetId: 'starter_armor_01', row: 0, col: 0, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.leather_armor': { visualId: 'equipment.leather_armor', sheetId: 'starter_armor_01', row: 0, col: 1, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.studded_leather_armor': { visualId: 'equipment.studded_leather_armor', sheetId: 'starter_armor_01', row: 0, col: 2, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.hide_armor': { visualId: 'equipment.hide_armor', sheetId: 'starter_armor_01', row: 0, col: 3, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.chain_shirt': { visualId: 'equipment.chain_shirt', sheetId: 'starter_armor_01', row: 1, col: 0, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.scale_mail': { visualId: 'equipment.scale_mail', sheetId: 'starter_armor_01', row: 1, col: 1, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.breastplate': { visualId: 'equipment.breastplate', sheetId: 'starter_armor_01', row: 1, col: 2, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.half_plate': { visualId: 'equipment.half_plate', sheetId: 'starter_armor_01', row: 1, col: 3, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.ring_mail': { visualId: 'equipment.ring_mail', sheetId: 'starter_armor_01', row: 2, col: 0, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.chain_mail': { visualId: 'equipment.chain_mail', sheetId: 'starter_armor_01', row: 2, col: 1, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.splint_armor': { visualId: 'equipment.splint_armor', sheetId: 'starter_armor_01', row: 2, col: 2, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.plate_armor': { visualId: 'equipment.plate_armor', sheetId: 'starter_armor_01', row: 2, col: 3, status: 'READY', category: 'armor', aspectRatio: '1:1' },
  'equipment.shield': { visualId: 'equipment.shield', sheetId: 'starter_armor_01', row: 3, col: 0, status: 'READY', category: 'armor', aspectRatio: '1:1' },

  // --- STARTER ADVENTURING 01 ---
  'equipment.explorers_pack': { visualId: 'equipment.explorers_pack', sheetId: 'starter_adventuring_01', row: 0, col: 0, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.dungeoneers_pack': { visualId: 'equipment.dungeoneers_pack', sheetId: 'starter_adventuring_01', row: 0, col: 1, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.burglars_pack': { visualId: 'equipment.burglars_pack', sheetId: 'starter_adventuring_01', row: 0, col: 2, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.diplomats_pack': { visualId: 'equipment.diplomats_pack', sheetId: 'starter_adventuring_01', row: 0, col: 3, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.entertainers_pack': { visualId: 'equipment.entertainers_pack', sheetId: 'starter_adventuring_01', row: 1, col: 0, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.priests_pack': { visualId: 'equipment.priests_pack', sheetId: 'starter_adventuring_01', row: 1, col: 1, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.scholars_pack': { visualId: 'equipment.scholars_pack', sheetId: 'starter_adventuring_01', row: 1, col: 2, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.backpack': { visualId: 'equipment.backpack', sheetId: 'starter_adventuring_01', row: 2, col: 0, status: 'READY', category: 'container', aspectRatio: '1:1' },
  'equipment.bedroll': { visualId: 'equipment.bedroll', sheetId: 'starter_adventuring_01', row: 2, col: 1, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.hempen_rope_50_ft': { visualId: 'equipment.hempen_rope_50_ft', sheetId: 'starter_adventuring_01', row: 2, col: 2, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.rations': { visualId: 'equipment.rations', sheetId: 'starter_adventuring_01', row: 2, col: 3, status: 'READY', category: 'consumable', aspectRatio: '1:1' },
  'equipment.torch': { visualId: 'equipment.torch', sheetId: 'starter_adventuring_01', row: 3, col: 0, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.tinderbox': { visualId: 'equipment.tinderbox', sheetId: 'starter_adventuring_01', row: 3, col: 1, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.waterskin': { visualId: 'equipment.waterskin', sheetId: 'starter_adventuring_01', row: 3, col: 2, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.mess_kit': { visualId: 'equipment.mess_kit', sheetId: 'starter_adventuring_01', row: 3, col: 3, status: 'READY', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.ball_bearings': { visualId: 'equipment.ball_bearings', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.string': { visualId: 'equipment.string', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.hammer': { visualId: 'equipment.hammer', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.piton': { visualId: 'equipment.piton', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.lantern_hooded': { visualId: 'equipment.lantern_hooded', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.chest': { visualId: 'equipment.chest', status: 'PLANNED', category: 'container', aspectRatio: '1:1' },
  'equipment.map_case': { visualId: 'equipment.map_case', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.blanket': { visualId: 'equipment.blanket', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.pot_iron': { visualId: 'equipment.pot_iron', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1' },
  'equipment.silk_rope_50_ft': { visualId: 'equipment.silk_rope_50_ft', status: 'PLANNED', category: 'adventuring_gear', aspectRatio: '1:1', fallbackVisualId: 'equipment.hempen_rope_50_ft' },

  // --- STARTER TOOLS 01 ---
  'equipment.thieves_tools': { visualId: 'equipment.thieves_tools', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.disguise_kit': { visualId: 'equipment.disguise_kit', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.forgery_kit': { visualId: 'equipment.forgery_kit', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.herbalism_kit': { visualId: 'equipment.herbalism_kit', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.navigators_tools': { visualId: 'equipment.navigators_tools', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.poisoners_kit': { visualId: 'equipment.poisoners_kit', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.alchemists_supplies': { visualId: 'equipment.alchemists_supplies', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.brewers_supplies': { visualId: 'equipment.brewers_supplies', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.calligraphers_supplies': { visualId: 'equipment.calligraphers_supplies', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.carpenters_tools': { visualId: 'equipment.carpenters_tools', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.cartographers_tools': { visualId: 'equipment.cartographers_tools', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.cobblers_tools': { visualId: 'equipment.cobblers_tools', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.cooks_utensils': { visualId: 'equipment.cooks_utensils', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.lute': { visualId: 'equipment.lute', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.dice_set': { visualId: 'equipment.dice_set', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.playing_card_set': { visualId: 'equipment.playing_card_set', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },
  'equipment.scale_merchants': { visualId: 'equipment.scale_merchants', status: 'PLANNED', category: 'tool', aspectRatio: '1:1' },

  // --- STARTER SPELLCASTING 01 ---
  'equipment.arcane_focus': { visualId: 'equipment.arcane_focus', sheetId: 'starter_spellcasting_01', row: 0, col: 0, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.component_pouch': { visualId: 'equipment.component_pouch', sheetId: 'starter_spellcasting_01', row: 0, col: 1, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.druidic_focus': { visualId: 'equipment.druidic_focus', sheetId: 'starter_spellcasting_01', row: 0, col: 2, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.holy_symbol': { visualId: 'equipment.holy_symbol', sheetId: 'starter_spellcasting_01', row: 0, col: 3, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.crystal': { visualId: 'equipment.crystal', sheetId: 'starter_spellcasting_01', row: 1, col: 0, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.orb': { visualId: 'equipment.orb', sheetId: 'starter_spellcasting_01', row: 1, col: 1, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.rod': { visualId: 'equipment.rod', sheetId: 'starter_spellcasting_01', row: 1, col: 2, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.staff': { visualId: 'equipment.staff', sheetId: 'starter_spellcasting_01', row: 1, col: 3, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.wand': { visualId: 'equipment.wand', sheetId: 'starter_spellcasting_01', row: 2, col: 0, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.spellbook': { visualId: 'equipment.spellbook', sheetId: 'starter_spellcasting_01', row: 2, col: 1, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.amulet': { visualId: 'equipment.amulet', sheetId: 'starter_spellcasting_01', row: 2, col: 2, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.reliquary': { visualId: 'equipment.reliquary', sheetId: 'starter_spellcasting_01', row: 2, col: 3, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.emblem': { visualId: 'equipment.emblem', sheetId: 'starter_spellcasting_01', row: 3, col: 0, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.sprig_of_mistletoe': { visualId: 'equipment.sprig_of_mistletoe', sheetId: 'starter_spellcasting_01', row: 3, col: 1, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.totem': { visualId: 'equipment.totem', sheetId: 'starter_spellcasting_01', row: 3, col: 2, status: 'READY', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.alms_box': { visualId: 'equipment.alms_box', status: 'PLANNED', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.censer': { visualId: 'equipment.censer', status: 'PLANNED', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.incense_block': { visualId: 'equipment.incense_block', status: 'PLANNED', category: 'spellcasting', aspectRatio: '1:1' },
  'equipment.vestments': { visualId: 'equipment.vestments', status: 'PLANNED', category: 'spellcasting', aspectRatio: '1:1' },

  // --- STARTER PERSONAL / ROLEPLAY 01 ---
  'equipment.travelers_clothes': { visualId: 'equipment.travelers_clothes', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.fine_clothes': { visualId: 'equipment.fine_clothes', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.costume': { visualId: 'equipment.costume', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.pouch': { visualId: 'equipment.pouch', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.signet_ring': { visualId: 'equipment.signet_ring', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.parchment': { visualId: 'equipment.parchment', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.paper': { visualId: 'equipment.paper', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.ink': { visualId: 'equipment.ink', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.ink_pen': { visualId: 'equipment.ink_pen', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.book_of_lore': { visualId: 'equipment.book_of_lore', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.candle': { visualId: 'equipment.candle', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.lamp': { visualId: 'equipment.lamp', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.oil_flask': { visualId: 'equipment.oil_flask', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.soap': { visualId: 'equipment.soap', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.bell': { visualId: 'equipment.bell', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.crowbar': { visualId: 'equipment.crowbar', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.abacus': { visualId: 'equipment.abacus', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.book': { visualId: 'equipment.book', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.gold': { visualId: 'equipment.gold', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.knife_small': { visualId: 'equipment.knife_small', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.little_bag_of_sand': { visualId: 'equipment.little_bag_of_sand', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.manacles': { visualId: 'equipment.manacles', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.perfume_vial': { visualId: 'equipment.perfume_vial', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.robes': { visualId: 'equipment.robes', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
  'equipment.sealing_wax': { visualId: 'equipment.sealing_wax', status: 'PLANNED', category: 'personal', aspectRatio: '1:1' },
};

export function getSpriteSheetDefinition(sheetId: string): SpriteSheetDefinition | undefined {
  return SPRITE_SHEETS[sheetId];
}

export function getSpriteCellForVisual(visualId: string): SpriteCellMapping | undefined {
  return SPRITE_MANIFEST[visualId];
}

export function getAllSpriteSheets(): SpriteSheetDefinition[] {
  return Object.values(SPRITE_SHEETS);
}

export function getAllManifestMappings(): SpriteCellMapping[] {
  return Object.values(SPRITE_MANIFEST);
}
