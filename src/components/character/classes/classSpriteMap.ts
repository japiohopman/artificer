export interface ClassSpriteCoord {
  classId: string;
  spriteRow: number; // 0-based: 0 to 2
  spriteColumn: number; // 0-based: 0 to 3
}

export const CLASS_SPRITE_SHEET_CONFIG = {
  src: '/assets/ui/official/classes/classSprite.webp',
  rows: 3,
  cols: 4,
  aspectRatio: 2 / 3, // 2:3 cell aspect ratio
};

export const CLASS_SPRITE_MAP: Record<string, ClassSpriteCoord> = {
  // Row 0
  'barbarian': { classId: 'barbarian', spriteRow: 0, spriteColumn: 0 },
  'bard': { classId: 'bard', spriteRow: 0, spriteColumn: 1 },
  'fighter': { classId: 'fighter', spriteRow: 0, spriteColumn: 2 },
  'cleric': { classId: 'cleric', spriteRow: 0, spriteColumn: 3 },

  // Row 1
  'ranger': { classId: 'ranger', spriteRow: 1, spriteColumn: 0 },
  'rogue': { classId: 'rogue', spriteRow: 1, spriteColumn: 1 },
  'paladin': { classId: 'paladin', spriteRow: 1, spriteColumn: 2 },
  'monk': { classId: 'monk', spriteRow: 1, spriteColumn: 3 },

  // Row 2
  'druid': { classId: 'druid', spriteRow: 2, spriteColumn: 0 },
  'sorcerer': { classId: 'sorcerer', spriteRow: 2, spriteColumn: 1 },
  'warlock': { classId: 'warlock', spriteRow: 2, spriteColumn: 2 },
  'wizard': { classId: 'wizard', spriteRow: 2, spriteColumn: 3 },
};

export function getClassSpriteCoord(classKey: string): ClassSpriteCoord | null {
  if (!classKey) return null;
  const normalized = classKey.toLowerCase().trim().replace(/_/g, '-');

  if (CLASS_SPRITE_MAP[normalized]) {
    return CLASS_SPRITE_MAP[normalized];
  }

  // Direct lookup with underscores
  const rawKey = classKey.toLowerCase().trim();
  if (CLASS_SPRITE_MAP[rawKey]) {
    return CLASS_SPRITE_MAP[rawKey];
  }

  return null;
}
