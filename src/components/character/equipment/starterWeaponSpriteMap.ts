export interface WeaponSpriteCoord {
  sheet: 'starter_weapons_01' | 'starter_weapons_02';
  row: number; // 0-based: 0 to 3
  col: number; // 0-based: 0 to 3
}

export const STARTER_WEAPONS_01_PATH = '/assets/atlas/equipment/sprites/starter_weapons_01.webp';
export const STARTER_WEAPONS_02_PATH = '/assets/atlas/equipment/sprites/starter_weapons_02.webp';

export const STARTER_WEAPON_SPRITE_MAP: Record<string, WeaponSpriteCoord> = {
  // starter_weapons_01
  // Row 0
  'dagger': { sheet: 'starter_weapons_01', row: 0, col: 0 },
  'handaxe': { sheet: 'starter_weapons_01', row: 0, col: 1 },
  'javelin': { sheet: 'starter_weapons_01', row: 0, col: 2 },
  'mace': { sheet: 'starter_weapons_01', row: 0, col: 3 },

  // Row 1
  'quarterstaff': { sheet: 'starter_weapons_01', row: 1, col: 0 },
  'sickle': { sheet: 'starter_weapons_01', row: 1, col: 1 },
  'club': { sheet: 'starter_weapons_01', row: 1, col: 2 },
  'spear': { sheet: 'starter_weapons_01', row: 1, col: 3 },

  // Row 2
  'shortsword': { sheet: 'starter_weapons_01', row: 2, col: 0 },
  'rapier': { sheet: 'starter_weapons_01', row: 2, col: 1 },
  'longsword': { sheet: 'starter_weapons_01', row: 2, col: 2 },
  'scimitar': { sheet: 'starter_weapons_01', row: 2, col: 3 },

  // Row 3
  'greatsword': { sheet: 'starter_weapons_01', row: 3, col: 0 },
  'greataxe': { sheet: 'starter_weapons_01', row: 3, col: 1 },
  'greatclub': { sheet: 'starter_weapons_01', row: 3, col: 2 },
  'light-hammer': { sheet: 'starter_weapons_01', row: 3, col: 3 },
  'light_hammer': { sheet: 'starter_weapons_01', row: 3, col: 3 },

  // starter_weapons_02
  // Row 0
  'shortbow': { sheet: 'starter_weapons_02', row: 0, col: 0 },
  'longbow': { sheet: 'starter_weapons_02', row: 0, col: 1 },
  'light-crossbow': { sheet: 'starter_weapons_02', row: 0, col: 2 },
  'light_crossbow': { sheet: 'starter_weapons_02', row: 0, col: 2 },
  'heavy-crossbow': { sheet: 'starter_weapons_02', row: 0, col: 3 },
  'heavy_crossbow': { sheet: 'starter_weapons_02', row: 0, col: 3 },

  // Row 1
  'sling': { sheet: 'starter_weapons_02', row: 1, col: 0 },
  'dart': { sheet: 'starter_weapons_02', row: 1, col: 1 },
  'blowgun': { sheet: 'starter_weapons_02', row: 1, col: 2 },
  'trident': { sheet: 'starter_weapons_02', row: 1, col: 3 },

  // Row 2
  'warhammer': { sheet: 'starter_weapons_02', row: 2, col: 0 },
  'battleaxe': { sheet: 'starter_weapons_02', row: 2, col: 1 },
  'flail': { sheet: 'starter_weapons_02', row: 2, col: 2 },
  'maul': { sheet: 'starter_weapons_02', row: 2, col: 3 },

  // Row 3
  'morningstar': { sheet: 'starter_weapons_02', row: 3, col: 0 },
  'pike': { sheet: 'starter_weapons_02', row: 3, col: 1 },
  'halberd': { sheet: 'starter_weapons_02', row: 3, col: 2 },
  'glaive': { sheet: 'starter_weapons_02', row: 3, col: 3 },
};

export function getStarterWeaponSpriteCoord(weaponKey: string): WeaponSpriteCoord | null {
  if (!weaponKey) return null;
  const cleanKey = weaponKey.toLowerCase().trim();
  const hyphenKey = cleanKey.replace(/_/g, '-');
  const underscoreKey = cleanKey.replace(/-/g, '_');

  return STARTER_WEAPON_SPRITE_MAP[cleanKey] ||
         STARTER_WEAPON_SPRITE_MAP[hyphenKey] ||
         STARTER_WEAPON_SPRITE_MAP[underscoreKey] || null;
}
