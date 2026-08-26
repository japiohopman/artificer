export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'
  | 'universal';

export type SpellAssetStatus = 'READY' | 'PLANNED' | 'MISSING' | 'DUPLICATE' | 'VERIFY';

export interface SpellSpriteSheetGrid {
  rows: number;
  cols: number;
}

export interface SpellSpriteSheetDefinition {
  id: string;
  path: string;
  grid: SpellSpriteSheetGrid;
  aspectRatio: string;
  level?: number;
  school?: SpellSchool;
  description: string;
}

export interface ReadySpellSpriteCellMapping {
  visualId: string;
  sheetId?: string;
  row?: number;
  col?: number;
  standalonePath?: string;
  aspectRatio?: string;
  ruleset?: '2014' | '2024';
  fallbackVisualId?: string;
  status: 'READY';
  school?: SpellSchool;
  level: number;
  notes?: string;
}

export interface PlannedOrMissingSpellSpriteCellMapping {
  visualId: string;
  sheetId?: string;
  row?: number;
  col?: number;
  standalonePath?: string;
  aspectRatio?: string;
  ruleset?: '2014' | '2024';
  fallbackVisualId?: string;
  status: 'PLANNED' | 'MISSING' | 'DUPLICATE' | 'VERIFY';
  school?: SpellSchool;
  level: number;
  notes?: string;
}

export type SpellSpriteCellMapping = ReadySpellSpriteCellMapping | PlannedOrMissingSpellSpriteCellMapping;

export interface SpellVisualIdentityResolution {
  visualId: string;
  canonicalId: string;
  isCustomRulesetVisual: boolean;
}
