export type RootTaxonomy = 'EQUIPMENT' | 'MATERIALS';

export type EquipmentSubcategory =
  | 'weapons'
  | 'armor'
  | 'shields'
  | 'tools'
  | 'accessories'
  | 'containers'
  | 'adventuring_gear'
  | 'spellcasting_gear'
  | 'consumables';

export type MaterialsSubcategory =
  | 'crafting_materials'
  | 'components'
  | 'keys'
  | 'quest_items'
  | 'books'
  | 'valuables';

export type ItemSubcategory = EquipmentSubcategory | MaterialsSubcategory;

export interface TaxonomyCategoryDef {
  id: ItemSubcategory;
  label: string;
  root: RootTaxonomy;
}

export const EQUIPMENT_SUBCATEGORIES: TaxonomyCategoryDef[] = [
  { id: 'weapons', label: 'Weapons', root: 'EQUIPMENT' },
  { id: 'armor', label: 'Armor', root: 'EQUIPMENT' },
  { id: 'shields', label: 'Shields', root: 'EQUIPMENT' },
  { id: 'tools', label: 'Tools', root: 'EQUIPMENT' },
  { id: 'accessories', label: 'Accessories', root: 'EQUIPMENT' },
  { id: 'containers', label: 'Containers', root: 'EQUIPMENT' },
  { id: 'adventuring_gear', label: 'Adventuring Gear', root: 'EQUIPMENT' },
  { id: 'spellcasting_gear', label: 'Spellcasting Gear', root: 'EQUIPMENT' },
  { id: 'consumables', label: 'Consumables', root: 'EQUIPMENT' },
];

export const MATERIALS_SUBCATEGORIES: TaxonomyCategoryDef[] = [
  { id: 'crafting_materials', label: 'Crafting Materials', root: 'MATERIALS' },
  { id: 'components', label: 'Components', root: 'MATERIALS' },
  { id: 'keys', label: 'Keys', root: 'MATERIALS' },
  { id: 'quest_items', label: 'Quest Items', root: 'MATERIALS' },
  { id: 'books', label: 'Books', root: 'MATERIALS' },
  { id: 'valuables', label: 'Valuables', root: 'MATERIALS' },
];

export function resolveItemTaxonomy(item: any): {
  rootCategory: RootTaxonomy;
  subcategory: ItemSubcategory;
  subcategoryLabel: string;
} {
  if (!item) {
    return {
      rootCategory: 'EQUIPMENT',
      subcategory: 'adventuring_gear',
      subcategoryLabel: 'Adventuring Gear',
    };
  }

  const kind = (item.kind || item.type || item.equipment_category || '').toString().toLowerCase();
  const id = (item.id || item.template || item.name || '').toString().toLowerCase();

  // 1. Explicit EQUIPMENT checks
  if (kind === 'weapon' || kind.includes('weapon')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'weapons', subcategoryLabel: 'Weapons' };
  }
  if (kind === 'shield' || (kind === 'armor' && id.includes('shield'))) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'shields', subcategoryLabel: 'Shields' };
  }
  if (kind === 'armor' || kind.includes('armor') || id.includes('armor') || id.includes('mail') || id.includes('plate') || id.includes('breastplate')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'armor', subcategoryLabel: 'Armor' };
  }
  if (kind === 'tool' || kind.includes('tool') || id.includes('kit') || id.includes('tools')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'tools', subcategoryLabel: 'Tools' };
  }
  if (
    kind === 'ring' ||
    kind === 'neck' ||
    kind === 'belt' ||
    kind === 'head' ||
    kind === 'feet' ||
    kind === 'hands' ||
    kind === 'back'
  ) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'accessories', subcategoryLabel: 'Accessories' };
  }

  // 2. MATERIALS subcategories
  if (kind === 'quest' || id.includes('quest') || item.isQuestItem) {
    return { rootCategory: 'MATERIALS', subcategory: 'quest_items', subcategoryLabel: 'Quest Items' };
  }
  if (kind === 'key' || id.includes('key') || id.includes('lockpick')) {
    return { rootCategory: 'MATERIALS', subcategory: 'keys', subcategoryLabel: 'Keys' };
  }
  if (kind === 'book' || kind === 'scroll_knowledge' || id.includes('book') || id.includes('tome') || id.includes('journal')) {
    return { rootCategory: 'MATERIALS', subcategory: 'books', subcategoryLabel: 'Books' };
  }
  if (kind === 'material' || kind === 'monster_part' || kind === 'bundled_material' || id.includes('ore') || id.includes('ingot') || (id.includes('leather') && !id.includes('armor'))) {
    return { rootCategory: 'MATERIALS', subcategory: 'crafting_materials', subcategoryLabel: 'Crafting Materials' };
  }
  if (kind === 'component' || id.includes('pouch_component') || id.includes('reagent')) {
    return { rootCategory: 'MATERIALS', subcategory: 'components', subcategoryLabel: 'Components' };
  }
  if (kind === 'currency' || kind === 'trinket' || kind === 'trash' || id.includes('gem') || id.includes('coin') || id.includes('gold') || id.includes('silver') || id.includes('ruby')) {
    return { rootCategory: 'MATERIALS', subcategory: 'valuables', subcategoryLabel: 'Valuables' };
  }

  // 3. Remaining EQUIPMENT subcategories
  if (kind === 'container' || id.includes('backpack') || id.includes('pouch') || id.includes('chest') || id.includes('sack')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'containers', subcategoryLabel: 'Containers' };
  }
  if (kind === 'focus' || id.includes('wand') || id.includes('staff') || id.includes('symbol') || id.includes('orb')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'spellcasting_gear', subcategoryLabel: 'Spellcasting Gear' };
  }
  if (
    kind === 'consumable' ||
    id.includes('potion') ||
    id.includes('scroll') ||
    id.includes('arrow') ||
    id.includes('bolt') ||
    id.includes('ration')
  ) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'consumables', subcategoryLabel: 'Consumables' };
  }

  // Default fallback
  return { rootCategory: 'EQUIPMENT', subcategory: 'adventuring_gear', subcategoryLabel: 'Adventuring Gear' };
}
