export interface IconDefinition {
  path: string;
  label: string;
  description: string;
  rawHtml: string;
  viewBox: string;
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

// Process and parse dynamically imported SVGs
const svgModules = (import.meta as any).glob('/src/assets/icons/svg/**/*.svg', { query: '?raw', eager: true });

const DYNAMIC_SVGS: Record<string, IconDefinition> = {};
const SVG_CATEGORIES: Record<string, Record<string, IconDefinition>> = {};

// Map folder names in src/assets/icons/svg/<folder>/ to standard category IDs
const FOLDER_TO_CATEGORY: Record<string, string> = {
  abilities: 'ability_score',
  action: 'actions',
  actors: 'creatures',
  damage: 'damage_types',
  dice: 'dice',
  items: 'equipment',
  schools: 'magic_schools',
  statuses: 'conditions',
  tarot: 'tarot',
  
  // Directly mapping new folders:
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

Object.entries(svgModules).forEach(([filePath, module]) => {
  const rawContent = (module as any).default || (module as any);
  if (typeof rawContent !== 'string') return;

  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  const folderName = parts[parts.length - 2];
  
  const id = filename.replace(/\.svg$/, '');
  const categoryId = FOLDER_TO_CATEGORY[folderName] || folderName;

  // Extract viewBox attribute
  const viewBoxMatch = rawContent.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";

  // Clean XML wrappers and extract inner content
  let rawHtml = rawContent
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim();
    
  const svgMatch = rawHtml.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (svgMatch) {
    rawHtml = svgMatch[1].trim();
  }

  // Fallback path attribute for traditional single-path rendering
  const pathMatch = rawContent.match(/<path[^>]+d=["']([^"']+)["']/i);
  const fallbackPath = pathMatch ? pathMatch[1] : '';

  // Extract embedded data attributes for metadata
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
  const animation = animationMatch ? (animationMatch[1] as any) : undefined;

  const colorMatch = rawContent.match(/data-color=["']([^"']+)["']/i);
  const color = colorMatch ? colorMatch[1] : undefined;

  const definition: IconDefinition = {
    path: fallbackPath,
    label,
    description,
    rawHtml,
    viewBox,
    usage,
    usedIn,
    rotate,
    animation,
    color,
  };

  DYNAMIC_SVGS[id] = definition;

  if (!SVG_CATEGORIES[categoryId]) {
    SVG_CATEGORIES[categoryId] = {};
  }
  SVG_CATEGORIES[categoryId][id] = definition;
});

// Re-export Tarot icons specifically for backward compatibility
export const TAROT_ICONS = SVG_CATEGORIES['tarot'] || {};

export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'ui', name: 'User Interface', file: 'svg/ui/', icons: {}, description: 'General interface elements and controls.' },
  { id: 'ability_score', name: 'Ability Scores', file: 'svg/abilities/', icons: {}, description: 'Core character attributes.', isComplete: true },
  { id: 'actions', name: 'Actions', file: 'svg/action/', icons: {}, description: 'Combat and exploration actions.' },
  { id: 'attacks', name: 'Attacks', file: 'svg/attacks/', icons: {}, description: 'Offensive maneuvers and strikes.' },
  { id: 'character', name: 'Character', file: 'svg/character/', icons: {}, description: 'Social and biographical elements.' },
  { id: 'conditions', name: 'Conditions', file: 'svg/statuses/', icons: {}, description: 'Status effects and ailments.' },
  { id: 'creatures', name: 'Creatures', file: 'svg/actors/', icons: {}, description: 'Beast and monster identifiers.' },
  { id: 'damage_types', name: 'Damage Types', file: 'svg/damage/', icons: {}, description: 'Elemental and physical damage markers.' },
  { id: 'dice', name: 'Dice', file: 'svg/dice/', icons: {}, description: 'Polyhedral dice and randomization.' },
  { id: 'equipment', name: 'Equipment', file: 'svg/items/', icons: {}, description: 'Items, gear, and tools.' },
  { id: 'equipment_doll', name: 'Equipment Doll', file: 'svg/equipment_doll/', icons: {}, description: 'Character slot indicators.' },
  { id: 'feats', name: 'Feats', file: 'svg/feats/', icons: {}, description: 'Specialized talents and expertise.' },
  { id: 'features', name: 'Features', file: 'svg/features/', icons: {}, description: 'Class and racial abilities.' },
  { id: 'magic_schools', name: 'Magic Schools', file: 'svg/schools/', icons: {}, description: 'Arcane traditions and domains.', isComplete: true },
  { id: 'materials', name: 'Materials', file: 'svg/materials/', icons: {}, description: 'Crafting resources and ingredients.' },
  { id: 'minigame', name: 'Minigames', file: 'svg/minigame/', icons: {}, description: 'Cards, tokens, and game pieces.' },
  { id: 'musical_instruments', name: 'Instruments', file: 'svg/musical_instruments/', icons: {}, description: 'Tools for bards and performers.' },
  { id: 'skill', name: 'Skills', file: 'svg/skill/', icons: {}, description: 'Proficiencies and expertise.' },
  { id: 'stat_comparison', name: 'Stat Comparison', file: 'svg/stat_comparison/', icons: {}, description: 'Value changes and trends.' },
  { id: 'subclasses', name: 'Subclasses', file: 'svg/subclasses/', icons: {}, description: 'Archetypes and specialization.' },
  { id: 'tarot', name: 'Tarot', file: 'svg/tarot/', icons: {}, description: 'Arcana and divination cards.', isComplete: true },
  { id: 'traits', name: 'Traits', file: 'svg/traits/', icons: {}, description: 'Personality and physical quirks.' },
  { id: 'world_atlas', name: 'World Atlas', file: 'svg/world_atlas/', icons: {}, description: 'Locations and geography.' },
  { id: 'book_reader', name: 'Book Reader', file: 'svg/book_reader/', icons: {}, description: 'Documentation and lore tools.' },
  { id: 'editor', name: 'Editor', file: 'svg/editor/', icons: {}, description: 'Development and tool icons.' },
  { id: 'currency', name: 'Currency', file: 'svg/currency/', icons: {}, description: 'Wealth and trade markers.' },
];

// Merge dynamic SVGs into existing categories
ICON_CATEGORIES.forEach(cat => {
  if (SVG_CATEGORIES[cat.id]) {
    cat.icons = {
      ...cat.icons,
      ...SVG_CATEGORIES[cat.id]
    };
  }
});

// Auto-register any new category folders under src/assets/icons/svg/
Object.entries(SVG_CATEGORIES).forEach(([catId, icons]) => {
  const existingCat = ICON_CATEGORIES.find(c => c.id === catId);
  if (!existingCat) {
    const catName = catId
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
      
    ICON_CATEGORIES.push({
      id: catId,
      name: catName,
      file: `svg/${catId}/`,
      icons,
      description: `Custom SVG icons under the ${catName} module.`
    });
  }
});

export const ALL_ICONS = DYNAMIC_SVGS;

// Construct the filesystem directory explorer tree dynamically from svgModules
const rootNode: FolderNode = {
  type: 'folder',
  name: 'svg',
  path: '',
  children: []
};

Object.keys(svgModules).forEach((filePath) => {
  const prefix = '/src/assets/icons/svg/';
  const index = filePath.indexOf(prefix);
  if (index === -1) return;

  const relativePath = filePath.substring(index + prefix.length);
  const segments = relativePath.split('/');

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
        path: relativePath,
        fullPath: filePath,
      });
    } else {
      let dirNode = currentNode.children.find(
        (child: FolderNode | FileNode) => child.type === 'folder' && child.name === segment
      ) as FolderNode;
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

// Helper function to recursively sort folders first, then files alphabetically
function sortTree(node: FolderNode) {
  node.children.sort((a: FolderNode | FileNode, b: FolderNode | FileNode) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  node.children.forEach((child: FolderNode | FileNode) => {
    if (child.type === 'folder') {
      sortTree(child as FolderNode);
    }
  });
}

sortTree(rootNode);

export const EXPLORER_TREE = rootNode;
