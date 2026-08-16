export interface SpeciesSpriteCoord {
  speciesId: string;
  spriteRow: number; // 0-based: 0 for Row 1, 1 for Row 2
  spriteColumn: number; // 0-based: 0 to 6 for Columns 1 to 7
}

export const SPRITE_SHEET_CONFIG = {
  src: '/assets/ui/official/races/race_sprite.webp',
  rows: 2,
  cols: 7,
  aspectRatio: 3 / 2, // 3:2 aspect ratio
};

export const SPECIES_SPRITE_MAP: Record<string, SpeciesSpriteCoord> = {
  // Row 1
  'dragonborn': { speciesId: 'dragonborn', spriteRow: 0, spriteColumn: 0 },
  'hill-dwarf': { speciesId: 'hill-dwarf', spriteRow: 0, spriteColumn: 1 },
  'dwarf:hill_dwarf': { speciesId: 'dwarf:hill_dwarf', spriteRow: 0, spriteColumn: 1 },
  'mountain-dwarf': { speciesId: 'mountain-dwarf', spriteRow: 0, spriteColumn: 2 },
  'dwarf:mountain_dwarf': { speciesId: 'dwarf:mountain_dwarf', spriteRow: 0, spriteColumn: 2 },
  'drow': { speciesId: 'drow', spriteRow: 0, spriteColumn: 3 },
  'elf:drow': { speciesId: 'elf:drow', spriteRow: 0, spriteColumn: 3 },
  'high-elf': { speciesId: 'high-elf', spriteRow: 0, spriteColumn: 4 },
  'elf:high_elf': { speciesId: 'elf:high_elf', spriteRow: 0, spriteColumn: 4 },
  'wood-elf': { speciesId: 'wood-elf', spriteRow: 0, spriteColumn: 5 },
  'elf:wood_elf': { speciesId: 'elf:wood_elf', spriteRow: 0, spriteColumn: 5 },
  'forest-gnome': { speciesId: 'forest-gnome', spriteRow: 0, spriteColumn: 6 },
  'gnome:forest_gnome': { speciesId: 'gnome:forest_gnome', spriteRow: 0, spriteColumn: 6 },

  // Row 2
  'rock-gnome': { speciesId: 'rock-gnome', spriteRow: 1, spriteColumn: 0 },
  'gnome:rock_gnome': { speciesId: 'gnome:rock_gnome', spriteRow: 1, spriteColumn: 0 },
  'half-elf': { speciesId: 'half-elf', spriteRow: 1, spriteColumn: 1 },
  'half-orc': { speciesId: 'half-orc', spriteRow: 1, spriteColumn: 2 },
  'lightfoot-halfling': { speciesId: 'lightfoot-halfling', spriteRow: 1, spriteColumn: 3 },
  'halfling:lightfoot_halfling': { speciesId: 'halfling:lightfoot_halfling', spriteRow: 1, spriteColumn: 3 },
  'stout-halfling': { speciesId: 'stout-halfling', spriteRow: 1, spriteColumn: 4 },
  'halfling:stout_halfling': { speciesId: 'halfling:stout_halfling', spriteRow: 1, spriteColumn: 4 },
  'human': { speciesId: 'human', spriteRow: 1, spriteColumn: 5 },
  'tiefling': { speciesId: 'tiefling', spriteRow: 1, spriteColumn: 6 },

  // Primary parent species fallbacks
  'dwarf': { speciesId: 'dwarf', spriteRow: 0, spriteColumn: 1 }, // Hill Dwarf
  'elf': { speciesId: 'elf', spriteRow: 0, spriteColumn: 4 }, // High Elf
  'gnome': { speciesId: 'gnome', spriteRow: 0, spriteColumn: 6 }, // Forest Gnome
  'halfling': { speciesId: 'halfling', spriteRow: 1, spriteColumn: 3 }, // Lightfoot Halfling
};

export function getSpeciesSpriteCoord(speciesKey: string): SpeciesSpriteCoord | null {
  if (!speciesKey) return null;
  const normalized = speciesKey.toLowerCase().trim();

  if (SPECIES_SPRITE_MAP[normalized]) {
    return SPECIES_SPRITE_MAP[normalized];
  }

  // Secondary normalization: replace underscores with hyphens
  const hyphenated = normalized.replace(/_/g, '-');
  if (SPECIES_SPRITE_MAP[hyphenated]) {
    return SPECIES_SPRITE_MAP[hyphenated];
  }

  // Check if subrace index format (e.g. elf:drow or drow) match parts
  const parts = normalized.split(':');
  if (parts.length > 1) {
    const subracePart = parts[1].replace(/_/g, '-');
    if (SPECIES_SPRITE_MAP[subracePart]) {
      return SPECIES_SPRITE_MAP[subracePart];
    }
    const racePart = parts[0].replace(/_/g, '-');
    if (SPECIES_SPRITE_MAP[racePart]) {
      return SPECIES_SPRITE_MAP[racePart];
    }
  }

  return null;
}
