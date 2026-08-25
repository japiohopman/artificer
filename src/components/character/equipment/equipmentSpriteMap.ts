export interface EquipmentSpriteCoord {
  sheet: 'starter_weapons_01' | 'starter_weapons_02' | 'starter_spellcasting_01' | 'starter_armor_01' | 'starter_adventuring_01';
  row: number; // 0-based: 0 to 3
  col: number; // 0-based: 0 to 3
}

export const SPRITE_SHEET_PATHS = {
  starter_weapons_01: '/assets/atlas/equipment/sprites/starter_weapons_01.webp',
  starter_weapons_02: '/assets/atlas/equipment/sprites/starter_weapons_02.webp',
  starter_spellcasting_01: '/assets/atlas/equipment/sprites/starter_spellcasting_01.webp',
  starter_armor_01: '/assets/atlas/equipment/sprites/starter_armor_01.webp',
  starter_adventuring_01: '/assets/atlas/equipment/sprites/starter_adventuring_01.webp',
} as const;

export const EQUIPMENT_SPRITE_MAP: Record<string, EquipmentSpriteCoord> = {
  // --- STARTER WEAPONS 01 ---
  'dagger': { sheet: 'starter_weapons_01', row: 0, col: 0 },
  'handaxe': { sheet: 'starter_weapons_01', row: 0, col: 1 },
  'javelin': { sheet: 'starter_weapons_01', row: 0, col: 2 },
  'mace': { sheet: 'starter_weapons_01', row: 0, col: 3 },
  'quarterstaff': { sheet: 'starter_weapons_01', row: 1, col: 0 },
  'sickle': { sheet: 'starter_weapons_01', row: 1, col: 1 },
  'club': { sheet: 'starter_weapons_01', row: 1, col: 2 },
  'spear': { sheet: 'starter_weapons_01', row: 1, col: 3 },
  'shortsword': { sheet: 'starter_weapons_01', row: 2, col: 0 },
  'rapier': { sheet: 'starter_weapons_01', row: 2, col: 1 },
  'longsword': { sheet: 'starter_weapons_01', row: 2, col: 2 },
  'scimitar': { sheet: 'starter_weapons_01', row: 2, col: 3 },
  'greatsword': { sheet: 'starter_weapons_01', row: 3, col: 0 },
  'greataxe': { sheet: 'starter_weapons_01', row: 3, col: 1 },
  'greatclub': { sheet: 'starter_weapons_01', row: 3, col: 2 },
  'light-hammer': { sheet: 'starter_weapons_01', row: 3, col: 3 },
  'light_hammer': { sheet: 'starter_weapons_01', row: 3, col: 3 },

  // --- STARTER WEAPONS 02 ---
  'shortbow': { sheet: 'starter_weapons_02', row: 0, col: 0 },
  'longbow': { sheet: 'starter_weapons_02', row: 0, col: 1 },
  'light-crossbow': { sheet: 'starter_weapons_02', row: 0, col: 2 },
  'light_crossbow': { sheet: 'starter_weapons_02', row: 0, col: 2 },
  'heavy-crossbow': { sheet: 'starter_weapons_02', row: 0, col: 3 },
  'heavy_crossbow': { sheet: 'starter_weapons_02', row: 0, col: 3 },
  'sling': { sheet: 'starter_weapons_02', row: 1, col: 0 },
  'dart': { sheet: 'starter_weapons_02', row: 1, col: 1 },
  'blowgun': { sheet: 'starter_weapons_02', row: 1, col: 2 },
  'trident': { sheet: 'starter_weapons_02', row: 1, col: 3 },
  'warhammer': { sheet: 'starter_weapons_02', row: 2, col: 0 },
  'battleaxe': { sheet: 'starter_weapons_02', row: 2, col: 1 },
  'flail': { sheet: 'starter_weapons_02', row: 2, col: 2 },
  'maul': { sheet: 'starter_weapons_02', row: 2, col: 3 },
  'morningstar': { sheet: 'starter_weapons_02', row: 3, col: 0 },
  'pike': { sheet: 'starter_weapons_02', row: 3, col: 1 },
  'halberd': { sheet: 'starter_weapons_02', row: 3, col: 2 },
  'glaive': { sheet: 'starter_weapons_02', row: 3, col: 3 },

  // --- STARTER SPELLCASTING 01 ---
  'arcane-focus': { sheet: 'starter_spellcasting_01', row: 0, col: 0 },
  'arcane_focus': { sheet: 'starter_spellcasting_01', row: 0, col: 0 },
  'component-pouch': { sheet: 'starter_spellcasting_01', row: 0, col: 1 },
  'component_pouch': { sheet: 'starter_spellcasting_01', row: 0, col: 1 },
  'druidic-focus': { sheet: 'starter_spellcasting_01', row: 0, col: 2 },
  'druidic_focus': { sheet: 'starter_spellcasting_01', row: 0, col: 2 },
  'holy-symbol': { sheet: 'starter_spellcasting_01', row: 0, col: 3 },
  'holy_symbol': { sheet: 'starter_spellcasting_01', row: 0, col: 3 },
  'crystal': { sheet: 'starter_spellcasting_01', row: 1, col: 0 },
  'orb': { sheet: 'starter_spellcasting_01', row: 1, col: 1 },
  'rod': { sheet: 'starter_spellcasting_01', row: 1, col: 2 },
  'staff': { sheet: 'starter_spellcasting_01', row: 1, col: 3 },
  'wand': { sheet: 'starter_spellcasting_01', row: 2, col: 0 },
  'spellbook': { sheet: 'starter_spellcasting_01', row: 2, col: 1 },
  'amulet': { sheet: 'starter_spellcasting_01', row: 2, col: 2 },
  'reliquary': { sheet: 'starter_spellcasting_01', row: 2, col: 3 },
  'emblem': { sheet: 'starter_spellcasting_01', row: 3, col: 0 },
  'sprig-of-mistletoe': { sheet: 'starter_spellcasting_01', row: 3, col: 1 },
  'sprig_of_mistletoe': { sheet: 'starter_spellcasting_01', row: 3, col: 1 },
  'totem': { sheet: 'starter_spellcasting_01', row: 3, col: 2 },

  // --- STARTER ARMOR 01 ---
  'padded': { sheet: 'starter_armor_01', row: 0, col: 0 },
  'padded-armor': { sheet: 'starter_armor_01', row: 0, col: 0 },
  'padded_armor': { sheet: 'starter_armor_01', row: 0, col: 0 },
  'leather': { sheet: 'starter_armor_01', row: 0, col: 1 },
  'leather-armor': { sheet: 'starter_armor_01', row: 0, col: 1 },
  'leather_armor': { sheet: 'starter_armor_01', row: 0, col: 1 },
  'studded-leather': { sheet: 'starter_armor_01', row: 0, col: 2 },
  'studded-leather-armor': { sheet: 'starter_armor_01', row: 0, col: 2 },
  'studded_leather_armor': { sheet: 'starter_armor_01', row: 0, col: 2 },
  'hide': { sheet: 'starter_armor_01', row: 0, col: 3 },
  'hide-armor': { sheet: 'starter_armor_01', row: 0, col: 3 },
  'hide_armor': { sheet: 'starter_armor_01', row: 0, col: 3 },
  'chain-shirt': { sheet: 'starter_armor_01', row: 1, col: 0 },
  'chain_shirt': { sheet: 'starter_armor_01', row: 1, col: 0 },
  'scale-mail': { sheet: 'starter_armor_01', row: 1, col: 1 },
  'scale_mail': { sheet: 'starter_armor_01', row: 1, col: 1 },
  'breastplate': { sheet: 'starter_armor_01', row: 1, col: 2 },
  'half-plate': { sheet: 'starter_armor_01', row: 1, col: 3 },
  'half_plate': { sheet: 'starter_armor_01', row: 1, col: 3 },
  'ring-mail': { sheet: 'starter_armor_01', row: 2, col: 0 },
  'ring_mail': { sheet: 'starter_armor_01', row: 2, col: 0 },
  'chain-mail': { sheet: 'starter_armor_01', row: 2, col: 1 },
  'chain_mail': { sheet: 'starter_armor_01', row: 2, col: 1 },
  'splint': { sheet: 'starter_armor_01', row: 2, col: 2 },
  'splint-armor': { sheet: 'starter_armor_01', row: 2, col: 2 },
  'splint_armor': { sheet: 'starter_armor_01', row: 2, col: 2 },
  'plate': { sheet: 'starter_armor_01', row: 2, col: 3 },
  'plate-armor': { sheet: 'starter_armor_01', row: 2, col: 3 },
  'plate_armor': { sheet: 'starter_armor_01', row: 2, col: 3 },
  'shield': { sheet: 'starter_armor_01', row: 3, col: 0 },

  // --- STARTER ADVENTURING 01 ---
  'explorers-pack': { sheet: 'starter_adventuring_01', row: 0, col: 0 },
  'explorers_pack': { sheet: 'starter_adventuring_01', row: 0, col: 0 },
  'dungeoneers-pack': { sheet: 'starter_adventuring_01', row: 0, col: 1 },
  'dungeoneers_pack': { sheet: 'starter_adventuring_01', row: 0, col: 1 },
  'burglars-pack': { sheet: 'starter_adventuring_01', row: 0, col: 2 },
  'burglars_pack': { sheet: 'starter_adventuring_01', row: 0, col: 2 },
  'diplomats-pack': { sheet: 'starter_adventuring_01', row: 0, col: 3 },
  'diplomats_pack': { sheet: 'starter_adventuring_01', row: 0, col: 3 },
  'entertainers-pack': { sheet: 'starter_adventuring_01', row: 1, col: 0 },
  'entertainers_pack': { sheet: 'starter_adventuring_01', row: 1, col: 0 },
  'priests-pack': { sheet: 'starter_adventuring_01', row: 1, col: 1 },
  'priests_pack': { sheet: 'starter_adventuring_01', row: 1, col: 1 },
  'scholars-pack': { sheet: 'starter_adventuring_01', row: 1, col: 2 },
  'scholars_pack': { sheet: 'starter_adventuring_01', row: 1, col: 2 },
  'backpack': { sheet: 'starter_adventuring_01', row: 2, col: 0 },
  'bedroll': { sheet: 'starter_adventuring_01', row: 2, col: 1 },
  'hempen-rope-50-ft': { sheet: 'starter_adventuring_01', row: 2, col: 2 },
  'hempen_rope_50_ft': { sheet: 'starter_adventuring_01', row: 2, col: 2 },
  'rope': { sheet: 'starter_adventuring_01', row: 2, col: 2 },
  'rations': { sheet: 'starter_adventuring_01', row: 2, col: 3 },
  'torch': { sheet: 'starter_adventuring_01', row: 3, col: 0 },
  'tinderbox': { sheet: 'starter_adventuring_01', row: 3, col: 1 },
  'waterskin': { sheet: 'starter_adventuring_01', row: 3, col: 2 },
  'mess-kit': { sheet: 'starter_adventuring_01', row: 3, col: 3 },
  'mess_kit': { sheet: 'starter_adventuring_01', row: 3, col: 3 },
};

export function getEquipmentSpriteCoord(itemKey: string): EquipmentSpriteCoord | null {
  if (!itemKey) return null;
  const cleanKey = itemKey.toLowerCase().trim();
  const hyphenKey = cleanKey.replace(/_/g, '-');
  const underscoreKey = cleanKey.replace(/-/g, '_');

  return EQUIPMENT_SPRITE_MAP[cleanKey] ||
         EQUIPMENT_SPRITE_MAP[hyphenKey] ||
         EQUIPMENT_SPRITE_MAP[underscoreKey] || null;
}
