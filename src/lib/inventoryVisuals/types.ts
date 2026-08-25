export type AssetCategory =
  | 'weapon'
  | 'armor'
  | 'adventuring_gear'
  | 'tool'
  | 'spellcasting'
  | 'personal'
  | 'potion'
  | 'ring'
  | 'scroll'
  | 'rod'
  | 'tradegood'
  | 'container'
  | 'pack';

export type AuditStatus = 'PLANNED' | 'READY' | 'MISSING' | 'DUPLICATE' | 'VERIFY';

export interface VisualIdentity {
  visualId: string;
  category: AssetCategory;
  description?: string;
  fallbackVisualId?: string;
  rulesetVariant?: '2014' | '2024';
}

export interface SpriteSheetSpec {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cellWidth: number; // e.g. 64 or 128
  cellHeight: number;
  assetPath: string;
  isStarter: boolean;
}

export interface SpriteCellLocation {
  sheetId: string;
  row: number; // 0-based index
  col: number; // 0-based index
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g. "1:1", "9:16", "3:2"
  ruleset?: '2014' | '2024' | 'both';
  fallbackVisualId?: string;
}

export type SpriteManifestMap = Record<string, SpriteCellLocation>;

export interface AuditEntry {
  canonicalId: string;
  visualId: string;
  category: string;
  source: string;
  rulesets: string[];
  spriteSheet: string;
  cell: string;
  status: AuditStatus;
  notes?: string;
}
