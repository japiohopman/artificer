export interface BackgroundSpriteCoord {
  backgroundId: string;
  spriteRow: number; // 0-based: 0 to 3
  spriteColumn: number; // 0-based: 0 to 3
}

export const BACKGROUND_SPRITE_SHEET_CONFIG = {
  src: '/assets/ui/official/backgrounds/backgroundSprite.webp',
  rows: 4,
  cols: 4,
  aspectRatio: 1, // 1:1 square cell aspect ratio
};

export const BACKGROUND_SPRITE_MAP: Record<string, BackgroundSpriteCoord> = {
  // Row 0: 0_0 Acolyte, 0_1 Artisan, 0_2 Charlatan, 0_3 Criminal
  'acolyte': { backgroundId: 'acolyte', spriteRow: 0, spriteColumn: 0 },
  'artisan': { backgroundId: 'artisan', spriteRow: 0, spriteColumn: 1 },
  'guild-artisan': { backgroundId: 'guild-artisan', spriteRow: 0, spriteColumn: 1 },
  'guild_artisan': { backgroundId: 'guild_artisan', spriteRow: 0, spriteColumn: 1 },
  'charlatan': { backgroundId: 'charlatan', spriteRow: 0, spriteColumn: 2 },
  'criminal': { backgroundId: 'criminal', spriteRow: 0, spriteColumn: 3 },

  // Row 1: 1_0 Entertainer, 1_1 Farmer, 1_2 Guard, 1_3 Guide
  'entertainer': { backgroundId: 'entertainer', spriteRow: 1, spriteColumn: 0 },
  'farmer': { backgroundId: 'farmer', spriteRow: 1, spriteColumn: 1 },
  'folk-hero': { backgroundId: 'folk-hero', spriteRow: 1, spriteColumn: 1 },
  'folk_hero': { backgroundId: 'folk_hero', spriteRow: 1, spriteColumn: 1 },
  'guard': { backgroundId: 'guard', spriteRow: 1, spriteColumn: 2 },
  'guide': { backgroundId: 'guide', spriteRow: 1, spriteColumn: 3 },
  'outlander': { backgroundId: 'outlander', spriteRow: 1, spriteColumn: 3 },

  // Row 2: 2_0 Hermit, 2_1 Merchant, 2_2 Noble, 2_3 Sage
  'hermit': { backgroundId: 'hermit', spriteRow: 2, spriteColumn: 0 },
  'merchant': { backgroundId: 'merchant', spriteRow: 2, spriteColumn: 1 },
  'noble': { backgroundId: 'noble', spriteRow: 2, spriteColumn: 2 },
  'sage': { backgroundId: 'sage', spriteRow: 2, spriteColumn: 3 },

  // Row 3: 3_0 Sailor, 3_1 Scribe, 3_2 Soldier, 3_3 Wayfarer
  'sailor': { backgroundId: 'sailor', spriteRow: 3, spriteColumn: 0 },
  'scribe': { backgroundId: 'scribe', spriteRow: 3, spriteColumn: 1 },
  'soldier': { backgroundId: 'soldier', spriteRow: 3, spriteColumn: 2 },
  'wayfarer': { backgroundId: 'wayfarer', spriteRow: 3, spriteColumn: 3 },
  'urchin': { backgroundId: 'urchin', spriteRow: 3, spriteColumn: 3 },
};

export function getBackgroundSpriteCoord(backgroundKey: string): BackgroundSpriteCoord | null {
  if (!backgroundKey) return null;
  const normalized = backgroundKey.toLowerCase().trim().replace(/_/g, '-');

  if (BACKGROUND_SPRITE_MAP[normalized]) {
    return BACKGROUND_SPRITE_MAP[normalized];
  }

  const rawKey = backgroundKey.toLowerCase().trim();
  if (BACKGROUND_SPRITE_MAP[rawKey]) {
    return BACKGROUND_SPRITE_MAP[rawKey];
  }

  return null;
}
