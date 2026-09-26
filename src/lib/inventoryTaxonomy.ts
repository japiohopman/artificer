export type RootTaxonomy = 'EQUIPMENT' | 'MATERIALS';

export type EquipmentSubcategory =
  | 'weapons'
  | 'armor'
  | 'shields'
  | 'ammunition'
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
  svgIcon?: string;
}

export const EQUIPMENT_SUBCATEGORIES: TaxonomyCategoryDef[] = [
  { id: 'weapons', label: 'Weapons', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/weapon.svg' },
  { id: 'armor', label: 'Armor', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/chest.svg' },
  { id: 'shields', label: 'Shields', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/shield.svg' },
  { id: 'ammunition', label: 'Ammunition', root: 'EQUIPMENT' },
  { id: 'tools', label: 'Tools', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/tools.svg' },
  { id: 'accessories', label: 'Accessories', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/ring.svg' },
  { id: 'containers', label: 'Containers', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/back.svg' },
  { id: 'adventuring_gear', label: 'Adventuring Gear', root: 'EQUIPMENT' },
  { id: 'spellcasting_gear', label: 'Spellcasting Gear', root: 'EQUIPMENT', svgIcon: '/assets/icons/svg/equipment_doll/focus.svg' },
  { id: 'consumables', label: 'Consumables', root: 'EQUIPMENT' },
];

export const MATERIALS_SUBCATEGORIES: TaxonomyCategoryDef[] = [
  { id: 'crafting_materials', label: 'Crafting Materials', root: 'MATERIALS' },
  { id: 'components', label: 'Components', root: 'MATERIALS' },
  { id: 'keys', label: 'Keys', root: 'MATERIALS' },
  { id: 'quest_items', label: 'Quest Items', root: 'MATERIALS' },
  { id: 'books', label: 'Books', root: 'MATERIALS' },
  { id: 'valuables', label: 'Valuables', root: 'MATERIALS', svgIcon: '/assets/icons/svg/equipment_doll/gem.svg' },
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

  const rawKind = (item.kind || item.type || item.equipment_category || (item.equipment_category?.name) || (item.equipment_category?.index) || '').toString().toLowerCase();
  const rawId = (item.id || item.index || item.template || item.name || '').toString().toLowerCase();

  // 1. Ammunition Check (High priority equipment subcategory)
  if (
    rawKind === 'ammunition' ||
    rawKind === 'ammo' ||
    rawId.includes('arrow') ||
    rawId.includes('bolt') ||
    rawId.includes('needle') ||
    rawId.includes('bullet') ||
    (item.gear_category && String(item.gear_category.name || item.gear_category.index || '').toLowerCase().includes('ammunition'))
  ) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'ammunition', subcategoryLabel: 'Ammunition' };
  }

  // 2. Weapons & Combat Gear
  if (rawKind === 'weapon' || rawKind.includes('weapon')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'weapons', subcategoryLabel: 'Weapons' };
  }
  if (rawKind === 'shield' || (rawKind === 'armor' && rawId.includes('shield'))) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'shields', subcategoryLabel: 'Shields' };
  }
  if (rawKind === 'armor' || rawKind.includes('armor') || rawId.includes('armor') || rawId.includes('mail') || rawId.includes('plate') || rawId.includes('breastplate')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'armor', subcategoryLabel: 'Armor' };
  }

  // 3. Tools & Kits
  if (rawKind === 'tool' || rawKind.includes('tool') || rawId.includes('kit') || rawId.includes('tools') || rawId.includes('supplies')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'tools', subcategoryLabel: 'Tools' };
  }

  // 4. Wearable Accessories
  if (
    rawKind === 'accessory' ||
    rawKind.includes('accessory') ||
    rawKind === 'ring' ||
    rawKind === 'neck' ||
    rawKind === 'belt' ||
    rawKind === 'head' ||
    rawKind === 'feet' ||
    rawKind === 'hands' ||
    rawKind === 'back' ||
    rawId.includes('amulet') ||
    rawId.includes('ring') ||
    rawId.includes('cloak') ||
    rawId.includes('boots') ||
    rawId.includes('bracers')
  ) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'accessories', subcategoryLabel: 'Accessories' };
  }

  // 5. MATERIALS Subcategories
  if (rawKind === 'quest' || rawId.includes('quest') || item.isQuestItem) {
    return { rootCategory: 'MATERIALS', subcategory: 'quest_items', subcategoryLabel: 'Quest Items' };
  }
  if (rawKind === 'key' || rawId.includes('key') || rawId.includes('lockpick')) {
    return { rootCategory: 'MATERIALS', subcategory: 'keys', subcategoryLabel: 'Keys' };
  }
  if (rawKind === 'book' || rawKind === 'scroll_knowledge' || rawId.includes('book') || rawId.includes('tome') || rawId.includes('journal') || rawId.includes('manual')) {
    return { rootCategory: 'MATERIALS', subcategory: 'books', subcategoryLabel: 'Books' };
  }
  if (rawKind === 'material' || rawKind === 'monster_part' || rawKind === 'bundled_material' || rawId.includes('ore') || rawId.includes('ingot') || (rawId.includes('leather') && !rawId.includes('armor'))) {
    return { rootCategory: 'MATERIALS', subcategory: 'crafting_materials', subcategoryLabel: 'Crafting Materials' };
  }
  if (rawKind === 'component' || rawId.includes('pouch_component') || rawId.includes('reagent')) {
    return { rootCategory: 'MATERIALS', subcategory: 'components', subcategoryLabel: 'Components' };
  }
  if (rawKind === 'currency' || rawKind === 'trinket' || rawKind === 'trash' || rawId.includes('gem') || rawId.includes('coin') || rawId.includes('gold') || rawId.includes('silver') || rawId.includes('ruby')) {
    return { rootCategory: 'MATERIALS', subcategory: 'valuables', subcategoryLabel: 'Valuables' };
  }

  // 6. Containers
  if (rawKind === 'container' || rawId.includes('backpack') || rawId.includes('pouch') || rawId.includes('chest') || rawId.includes('sack') || rawId.includes('bag')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'containers', subcategoryLabel: 'Containers' };
  }

  // 7. Spellcasting Gear
  if (rawKind === 'focus' || rawId.includes('wand') || rawId.includes('staff') || rawId.includes('symbol') || rawId.includes('orb') || rawId.includes('focus')) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'spellcasting_gear', subcategoryLabel: 'Spellcasting Gear' };
  }

  // 8. Consumables (Potions, Scrolls, Rations)
  if (
    rawKind === 'consumable' ||
    rawId.includes('potion') ||
    rawId.includes('scroll') ||
    rawId.includes('ration') ||
    rawId.includes('flask')
  ) {
    return { rootCategory: 'EQUIPMENT', subcategory: 'consumables', subcategoryLabel: 'Consumables' };
  }

  // Default Fallback
  return { rootCategory: 'EQUIPMENT', subcategory: 'adventuring_gear', subcategoryLabel: 'Adventuring Gear' };
}
