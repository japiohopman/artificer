export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'adventuring_gear'
  | 'tool'
  | 'spellcasting'
  | 'personal'
  | 'consumable'
  | 'container'
  | 'tradegood'
  | 'trinket'
  | 'other';

export type AssetStatus = 'READY' | 'PLANNED' | 'MISSING' | 'DUPLICATE' | 'VERIFY';

export interface SpriteSheetGrid {
  rows: number;
  cols: number;
}

export interface SpriteSheetDefinition {
  id: string;
  path: string;
  grid: SpriteSheetGrid;
  aspectRatio: string;
  category: ItemCategory;
  description: string;
}

export interface ReadySpriteCellMapping {
  visualId: string;
  sheetId: string;
  row: number;
  col: number;
  aspectRatio?: string;
  ruleset?: '2014' | '2024';
  fallbackVisualId?: string;
  status: 'READY';
  category: ItemCategory;
  notes?: string;
}

export interface PlannedOrMissingSpriteCellMapping {
  visualId: string;
  sheetId?: string;
  row?: number;
  col?: number;
  aspectRatio?: string;
  ruleset?: '2014' | '2024';
  fallbackVisualId?: string;
  status: 'PLANNED' | 'MISSING' | 'DUPLICATE' | 'VERIFY';
  category: ItemCategory;
  notes?: string;
}

export type SpriteCellMapping = ReadySpriteCellMapping | PlannedOrMissingSpriteCellMapping;

export interface VisualIdentityResolution {
  visualId: string;
  canonicalId: string;
  isCustomRulesetVisual: boolean;
}
