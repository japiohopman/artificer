const fs = require('fs');
const path = require('path');

const PUBLIC_ICONS_DIR = path.join(__dirname, '../public/assets/icons/svg');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/iconRegistry.generated.ts');

const FOLDER_TO_CATEGORY = {
  abilities: 'ability_score',
  action: 'actions',
  actors: 'creatures',
  damage: 'damage_types',
  dice: 'dice',
  items: 'equipment',
  schools: 'magic_schools',
  statuses: 'conditions',
  tarot: 'tarot',
  ui: 'ui',
  attacks: 'attacks',
  character: 'character',
  currency: 'currency',
  editor: 'editor',
  equipment_doll: 'equipment_doll',
  feats: 'feats',
  features: 'features',
  materials: 'materials',
  minigame: 'minigame',
  musical_instruments: 'musical_instruments',
  skill: 'skill',
  stat_comparison: 'stat_comparison',
  subclasses: 'subclasses',
  traits: 'traits',
  world_atlas: 'world_atlas',
  book_reader: 'book_reader',
};

const CATEGORY_META = [
  { id: 'ui', name: 'User Interface', file: 'svg/ui/', description: 'General interface elements and controls.' },
  { id: 'ability_score', name: 'Ability Scores', file: 'svg/abilities/', description: 'Core character attributes.', isComplete: true },
  { id: 'actions', name: 'Actions', file: 'svg/action/', description: 'Combat and exploration actions.' },
  { id: 'attacks', name: 'Attacks', file: 'svg/attacks/', description: 'Offensive maneuvers and strikes.' },
  { id: 'character', name: 'Character', file: 'svg/character/', description: 'Social and biographical elements.' },
  { id: 'conditions', name: 'Conditions', file: 'svg/statuses/', description: 'Status effects and ailments.' },
  { id: 'creatures', name: 'Creatures', file: 'svg/actors/', description: 'Beast and monster identifiers.' },
  { id: 'damage_types', name: 'Damage Types', file: 'svg/damage/', description: 'Elemental and physical damage markers.' },
  { id: 'dice', name: 'Dice', file: 'svg/dice/', description: 'Polyhedral dice and randomization.' },
  { id: 'equipment', name: 'Equipment', file: 'svg/items/', description: 'Items, gear, and tools.' },
  { id: 'equipment_doll', name: 'Equipment Doll', file: 'svg/equipment_doll/', description: 'Character slot indicators.' },
  { id: 'feats', name: 'Feats', file: 'svg/feats/', description: 'Specialized talents and expertise.' },
  { id: 'features', name: 'Features', file: 'svg/features/', description: 'Class and racial abilities.' },
  { id: 'magic_schools', name: 'Magic Schools', file: 'svg/schools/', description: 'Arcane traditions and domains.', isComplete: true },
  { id: 'materials', name: 'Materials', file: 'svg/materials/', description: 'Crafting resources and ingredients.' },
  { id: 'minigame', name: 'Minigames', file: 'svg/minigame/', description: 'Cards, tokens, and game pieces.' },
  { id: 'musical_instruments', name: 'Instruments', file: 'svg/musical_instruments/', description: 'Tools for bards and performers.' },
  { id: 'skill', name: 'Skills', file: 'svg/skill/', description: 'Proficiencies and expertise.' },
  { id: 'stat_comparison', name: 'Stat Comparison', file: 'svg/stat_comparison/', description: 'Value changes and trends.' },
  { id: 'subclasses', name: 'Subclasses', file: 'svg/subclasses/', description: 'Archetypes and specialization.' },
  { id: 'tarot', name: 'Tarot', file: 'svg/tarot/', description: 'Arcana and divination cards.', isComplete: true },
  { id: 'traits', name: 'Traits', file: 'svg/traits/', description: 'Personality and physical quirks.' },
  { id: 'world_atlas', name: 'World Atlas', file: 'svg/world_atlas/', description: 'Locations and geography.' },
  { id: 'book_reader', name: 'Book Reader', file: 'svg/book_reader/', description: 'Documentation and lore tools.' },
  { id: 'editor', name: 'Editor', file: 'svg/editor/', description: 'Development and tool icons.' },
  { id: 'currency', name: 'Currency', file: 'svg/currency/', description: 'Wealth and trade markers.' },
];

function scanSvgFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanSvgFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseSvgFile(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, '../public'), filePath).replace(/\\/g, '/');
  const publicAssetUrl = '/' + relPath;

  const parts = relPath.split('/');
  const filename = parts[parts.length - 1];
  const folderName = parts.length > 3 ? parts[parts.length - 2] : 'root';
  const id = filename.replace(/\.svg$/, '');
  const categoryId = FOLDER_TO_CATEGORY[folderName] || folderName;

  const viewBoxMatch = rawContent.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";

  const labelMatch = rawContent.match(/data-label=["']([^"']+)["']/i);
  const label = labelMatch
    ? labelMatch[1]
    : id
      .replace(/^(tarot_\d+_|trait-)/i, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const descMatch = rawContent.match(/data-description=["']([^"']+)["']/i);
  const description = descMatch
    ? descMatch[1]
    : `A symbolic icon representing ${label}.`;

  const usageMatch = rawContent.match(/data-usage=["']([^"']+)["']/i);
  const usage = usageMatch ? usageMatch[1] : undefined;

  const usedInMatch = rawContent.match(/data-used-in=["']([^"']+)["']/i);
  const usedIn = usedInMatch ? usedInMatch[1] : undefined;

  const rotateMatch = rawContent.match(/data-rotate=["']([^"']+)["']/i);
  const rotate = rotateMatch ? parseInt(rotateMatch[1], 10) : undefined;

  const animationMatch = rawContent.match(/data-animation=["']([^"']+)["']/i);
  const animation = animationMatch ? animationMatch[1] : undefined;

  const colorMatch = rawContent.match(/data-color=["']([^"']+)["']/i);
  const color = colorMatch ? colorMatch[1] : undefined;

  const definition = {
    name: id,
    category: categoryId,
    path: publicAssetUrl,
    label,
    description,
    viewBox,
  };

  if (usage) definition.usage = usage;
  if (usedIn) definition.usedIn = usedIn;
  if (rotate !== undefined) definition.rotate = rotate;
  if (animation) definition.animation = animation;
  if (color) definition.color = color;

  return {
    id,
    folderName,
    categoryId,
    publicAssetUrl,
    definition
  };
}

function buildExplorerTree(svgFiles) {
  const rootNode = {
    type: 'folder',
    name: 'svg',
    path: '',
    children: []
  };

  const prefix = path.join(__dirname, '../public/assets/icons/svg').replace(/\\/g, '/');

  svgFiles.forEach(filePath => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const rel = normalizedPath.substring(prefix.length + 1);
    const segments = rel.split('/');

    let currentNode = rootNode;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFile = i === segments.length - 1;

      if (isFile) {
        const iconId = segment.replace(/\.svg$/, '');
        currentNode.children.push({
          type: 'file',
          name: segment,
          iconId,
          path: rel,
          fullPath: `/public/assets/icons/svg/${rel}`,
        });
      } else {
        let dirNode = currentNode.children.find(
          c => c.type === 'folder' && c.name === segment
        );
        if (!dirNode) {
          dirNode = {
            type: 'folder',
            name: segment,
            path: currentNode.path ? `${currentNode.path}/${segment}` : segment,
            children: [],
          };
          currentNode.children.push(dirNode);
        }
        currentNode = dirNode;
      }
    }
  });

  function sortTree(node) {
    node.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(child => {
      if (child.type === 'folder') sortTree(child);
    });
  }

  sortTree(rootNode);
  return rootNode;
}

function main() {
  console.log('Generating optimized source-side icon manifest (URLs + metadata only)...');
  const svgFiles = scanSvgFiles(PUBLIC_ICONS_DIR);
  console.log(`Found ${svgFiles.length} SVG files.`);

  const parsedSvgs = svgFiles.map(parseSvgFile);

  const allIconsMap = {};
  const categoryIdsMap = {};

  parsedSvgs.forEach(item => {
    allIconsMap[item.id] = item.definition;
    if (!categoryIdsMap[item.categoryId]) {
      categoryIdsMap[item.categoryId] = [];
    }
    categoryIdsMap[item.categoryId].push(item.id);
  });

  const categoryList = CATEGORY_META.map(cat => ({
    ...cat,
    iconIds: categoryIdsMap[cat.id] || []
  }));

  Object.keys(categoryIdsMap).forEach(catId => {
    if (!categoryList.find(c => c.id === catId)) {
      const catName = catId
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      categoryList.push({
        id: catId,
        name: catName,
        file: `svg/${catId}/`,
        iconIds: categoryIdsMap[catId],
        description: `Custom SVG icons under the ${catName} module.`
      });
    }
  });

  const explorerTree = buildExplorerTree(svgFiles);

  const fileContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 * Generated by tools/generateIconRegistry.cjs
 * Canonical Physical Asset Store: public/assets/icons/svg/
 * Contains ONLY public URLs and metadata - NO duplicated artwork or path strings.
 */

export interface IconDefinition {
  name: string;
  category: string;
  path: string; // Static public asset URL (e.g. /assets/icons/svg/skill/acrobatics.svg)
  label: string;
  description: string;
  viewBox?: string;
  usage?: string;
  usedIn?: string;
  rotate?: number;
  animation?: 'spin' | 'pulse' | 'bounce' | string;
  color?: string;
}

export interface IconCategory {
  id: string;
  name: string;
  file: string;
  icons: Record<string, IconDefinition>;
  description: string;
  isComplete?: boolean;
}

export interface FileNode {
  type: 'file';
  name: string;
  iconId: string;
  path: string;
  fullPath: string;
}

export interface FolderNode {
  type: 'folder';
  name: string;
  path: string;
  children: Array<FolderNode | FileNode>;
}

// Canonical physical manifest of all icons (single object allocation per icon)
export const ALL_ICONS: Record<string, IconDefinition> = ${JSON.stringify(allIconsMap, null, 2)};

const CATEGORY_MAPPINGS: Record<string, string[]> = ${JSON.stringify(categoryIdsMap, null, 2)};

// Derived category map referencing ALL_ICONS entries directly
export const SVG_CATEGORIES: Record<string, Record<string, IconDefinition>> = {};
Object.entries(CATEGORY_MAPPINGS).forEach(([catId, iconIds]) => {
  SVG_CATEGORIES[catId] = {};
  iconIds.forEach(id => {
    if (ALL_ICONS[id]) {
      SVG_CATEGORIES[catId][id] = ALL_ICONS[id];
    }
  });
});

const RAW_CATEGORY_META = ${JSON.stringify(categoryList, null, 2)};

export const ICON_CATEGORIES: IconCategory[] = RAW_CATEGORY_META.map(cat => ({
  id: cat.id,
  name: cat.name,
  file: cat.file,
  description: cat.description,
  isComplete: cat.isComplete,
  icons: SVG_CATEGORIES[cat.id] || {}
}));

export const TAROT_ICONS = SVG_CATEGORIES['tarot'] || {};
export const WORLD_ATLAS_ICONS = SVG_CATEGORIES['world_atlas'] || {};
export const UI_ICONS = SVG_CATEGORIES['ui'] || {};
export const ATTACK_ICONS = SVG_CATEGORIES['attacks'] || {};
export const EQUIPMENT_ICONS = SVG_CATEGORIES['equipment'] || {};
export const DAMAGE_TYPE_ICONS = SVG_CATEGORIES['damage_types'] || {};
export const CONDITION_ICONS = SVG_CATEGORIES['conditions'] || {};
export const CREATURE_TYPE_ICONS = SVG_CATEGORIES['creatures'] || {};
export const DICE_ICONS = SVG_CATEGORIES['dice'] || {};
export const CHARACTER_ICONS = SVG_CATEGORIES['character'] || {};
export const CURRENCY_ICONS = SVG_CATEGORIES['currency'] || {};
export const EDITOR_ICONS = SVG_CATEGORIES['editor'] || {};
export const ABILITY_SCORE_ICONS = SVG_CATEGORIES['ability_score'] || {};
export const SKILL_ICONS = SVG_CATEGORIES['skill'] || {};
export const FEAT_ICONS = SVG_CATEGORIES['feats'] || {};
export const FEATURE_ICONS = SVG_CATEGORIES['features'] || {};
export const TRAIT_ICONS = SVG_CATEGORIES['traits'] || {};
export const MAGIC_SCHOOL_ICONS = SVG_CATEGORIES['magic_schools'] || {};
export const ACTION_ICONS = SVG_CATEGORIES['actions'] || {};
export const SUBCLASS_ICONS = SVG_CATEGORIES['subclasses'] || {};
export const STAT_COMPARISON_ICONS = SVG_CATEGORIES['stat_comparison'] || {};
export const MATERIALS_ICONS = SVG_CATEGORIES['materials'] || {};
export const MUSICAL_INSTRUMENT_ICONS = SVG_CATEGORIES['musical_instruments'] || {};
export const BOOK_READER_ICONS = SVG_CATEGORIES['book_reader'] || {};
export const EQUIPMENT_DOLL = SVG_CATEGORIES['equipment_doll'] || {};
export const MINI_GAME_ICONS = SVG_CATEGORIES['minigame'] || {};

export const EXPLORER_TREE: FolderNode = ${JSON.stringify(explorerTree, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
  console.log(`Successfully generated optimized icon manifest at ${OUTPUT_FILE}`);
}

main();
