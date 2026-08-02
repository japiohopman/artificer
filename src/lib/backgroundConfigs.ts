import React from 'react';

export interface BackgroundConfig {
  id: string;          // ID used in dropdown selections and stored in DB (e.g. 'land_forest')
  label: string;       // Visual label (e.g. 'Forest')
  filename: string;    // The actual filename base on disk (e.g. 'land_forest')
  sheet: number;       // Sprite sheet number (1 or 2)
  row: number;         // Row index (0 to 11)
}

export const BACKGROUND_CONFIGS: BackgroundConfig[] = [
  // Sheet 1
  { id: 'air', label: 'Air', filename: 'air', sheet: 1, row: 0 },
  { id: 'beach', label: 'Beach', filename: 'beach', sheet: 1, row: 1 },
  { id: 'castle', label: 'Castle', filename: 'castle', sheet: 1, row: 2 },
  { id: 'church', label: 'Church', filename: 'church', sheet: 1, row: 3 },
  { id: 'desert', label: 'Desert', filename: 'desert', sheet: 1, row: 4 },
  { id: 'land_forest', label: 'Forest', filename: 'land_forest', sheet: 1, row: 5 },
  { id: 'fort', label: 'Fort', filename: 'fort', sheet: 1, row: 6 },
  { id: 'land_mountains', label: 'Mountains', filename: 'mountain', sheet: 1, row: 7 },
  { id: 'land_urban', label: 'Urban', filename: 'land_urban', sheet: 1, row: 8 },
  { id: 'snowy', label: 'Snowy', filename: 'snowy', sheet: 1, row: 9 },
  { id: 'swamp', label: 'Swamp', filename: 'swamp', sheet: 1, row: 10 },
  { id: 'water', label: 'Water', filename: 'water', sheet: 1, row: 11 },

  // Sheet 2
  { id: 'ruins', label: 'Ruins', filename: 'ruins', sheet: 2, row: 0 },
  { id: 'cave', label: 'Cave', filename: 'cave', sheet: 2, row: 1 },
  { id: 'dragon_cave', label: 'Dragon Cave', filename: 'dragon_cave', sheet: 2, row: 2 },
  { id: 'land_plains', label: 'Plains', filename: 'land_plains', sheet: 2, row: 3 },
  { id: 'fey', label: 'Fey', filename: 'fey', sheet: 2, row: 4 },
  { id: 'jungle', label: 'Jungle', filename: 'jungle', sheet: 2, row: 5 },
  { id: 'volcano', label: 'Volcano', filename: 'volcano', sheet: 2, row: 6 },
  { id: 'underdark', label: 'Underdark', filename: 'underdark', sheet: 2, row: 7 },
  { id: 'ethereal', label: 'Ethereal', filename: 'ethereal', sheet: 2, row: 8 },
  { id: 'void', label: 'Void', filename: 'void', sheet: 2, row: 9 },
  { id: 'sigil', label: 'Sigil', filename: 'sigil', sheet: 2, row: 10 },
  { id: '9_hells', label: '9 Hells', filename: '9_hells', sheet: 2, row: 11 },
];

/**
 * Infers a background ID from a monster's type/properties
 */
export function inferBackgroundFromMonster(monster: { type?: string; name?: string }): string {
  const mType = (monster.type || "").toLowerCase();

  if (mType.includes('dragon')) return 'dragon_cave';
  if (mType.includes('undead') || mType.includes('fiend') || mType.includes('aberration')) return 'underdark';
  if (mType.includes('fey')) return 'fey';
  if (mType.includes('beast') || mType.includes('plant')) return 'land_forest';
  if (mType.includes('monstrosity') || mType.includes('ooze')) return 'ruins';
  if (mType.includes('elemental')) return 'air';
  if (mType.includes('construct')) return 'fort';
  if (mType.includes('celestial')) return 'church';
  if (mType.includes('giant')) return 'land_mountains';

  return 'land_forest'; // Default fallback
}

/**
 * Returns the proper filename base for a given background ID.
 */
export function getBackgroundFilename(id: string): string {
  if (id === 'generic') {
    return 'land_forest';
  }
  // Support variations like "air2" -> base "air"
  const match = id.match(/^([a-z0-9_]+)(\d)?$/i);
  if (!match) return id;
  const base = match[1];
  const variation = match[2];

  // Map alternative code/DB representations back to config or disk filenames
  const aliases: Record<string, string> = {
    'dessert': 'desert',
    'fay': 'fey',
    'mountain': 'mountain',
    'forest': 'land_forest',
    'urban': 'land_urban',
    'plains': 'land_plains',
    'generic': 'land_forest'
  };

  const aliasBase = aliases[base] || base;
  const config = BACKGROUND_CONFIGS.find(c => c.id === aliasBase || c.filename === aliasBase);
  const fileBase = config ? config.filename : aliasBase;
  return variation ? `${fileBase}${variation}` : fileBase;
}

/**
 * Returns CSS properties for a background thumbnail using the sprite sheets
 */
export function getSpriteThumbnailStyle(id: string, variation: number = 0): React.CSSProperties {
  // Extract base and optional variation from the ID if passed as a single string (e.g. 'air2')
  let baseId = id;
  let col = variation;

  const match = id.match(/^([a-z0-9_]+)(\d)?$/i);
  if (match) {
    baseId = match[1];
    if (match[2] !== undefined) {
      col = parseInt(match[2], 10);
    }
  }

  const aliases: Record<string, string> = {
    'dessert': 'desert',
    'fay': 'fey',
    'mountain': 'land_mountains',
    'forest': 'land_forest',
    'urban': 'land_urban',
    'plains': 'land_plains',
    'generic': 'land_forest'
  };

  const aliasBase = aliases[baseId] || baseId;
  const config = BACKGROUND_CONFIGS.find(c => c.id === aliasBase || c.filename === aliasBase);
  if (!config) {
    return {
      backgroundColor: '#292524', // stone-800 fallback
    };
  }

  const sheetNum = config.sheet;
  const row = config.row;

  const sheetUrl = `/assets/images/enemy_backgrounds/tumb/tumb_enemy_background_sheet${sheetNum}.webp`;
  const posX = col * 25; // 0, 25, 50, 75, 100
  const posY = (row / 11) * 100; // 0 to 100

  return {
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: '500% 1200%',
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: 'no-repeat',
  };
}
