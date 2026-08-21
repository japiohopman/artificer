
import { ItemInstance, InventoryContainer, InventorySlot, EQUIPMENT_SLOT_CATALOG, ItemKind } from '../types/inventory';
import { Character } from '../store/useCharacterStore';
import { calculateCurrencyWeight } from './currencyUtils';
import { getCachedEquipment } from '../services/storageService';
import { useAtlasStore } from '../store/useAtlasStore';

const parseWeight = (weight: any): number => {
  if (weight === null || weight === undefined) return 0;
  if (typeof weight === 'number') return weight;
  const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
  return weightMatch ? parseFloat(weightMatch[0]) : 0;
};

// Canonical D&D 5e standard equipment weights dictionary for template fallbacks
const CANONICAL_TEMPLATE_WEIGHTS: Record<string, number> = {
  'plate_armor': 65, 'plate-armor': 65, 'plate': 65,
  'shield': 6,
  'chain_mail': 55, 'chain-mail': 55,
  'leather_armor': 10, 'leather-armor': 10,
  'studded_leather_armor': 13, 'studded-leather-armor': 13,
  'hide_armor': 12, 'hide-armor': 12,
  'scale_mail': 45, 'scale-mail': 45,
  'breastplate': 20,
  'half_plate_armor': 40, 'half-plate-armor': 40,
  'ring_mail': 40, 'ring-mail': 40,
  'splint_armor': 60, 'splint-armor': 60,
  'padded_armor': 8, 'padded-armor': 8,
  'dagger': 1,
  'longsword': 3,
  'shortsword': 2,
  'greatsword': 6,
  'shortbow': 2,
  'longbow': 2,
  'backpack': 5,
  'bedroll': 7,
  'rations': 2, 'rations-1-day': 2, 'rations_1_day': 2,
  'torch': 1,
  'waterskin': 5,
  'tinderbox': 1,
  'rope-hempen-50-feet': 10, 'rope_hempen_50_feet': 10,
  'crowbar': 5,
  'hammer': 2,
  'piton': 0.25,
  'potion': 0.5,
  'potion-of-healing': 0.5, 'potion_of_healing': 0.5,
};

/**
 * Resolves the canonical weight of an item template using Atlas cache, Atlas store, or canonical fallbacks.
 */
export function resolveItemTemplateWeight(templateRef: any, itemInstance?: any): number {
  if (itemInstance?.metadata?.weight !== undefined) {
    return parseWeight(itemInstance.metadata.weight);
  }

  if (typeof templateRef === 'object' && templateRef !== null) {
    const directWeight = templateRef.weight ?? templateRef.weight_lbs ?? templateRef.metadata?.weight;
    if (directWeight !== undefined) return parseWeight(directWeight);
    if (templateRef.template) return resolveItemTemplateWeight(templateRef.template, itemInstance);
  }

  if (typeof templateRef === 'string' && templateRef.trim()) {
    const cleanId = templateRef.toLowerCase().trim();
    const hyphenId = cleanId.replace(/_/g, '-');
    const underscoreId = cleanId.replace(/-/g, '_');

    const cached = getCachedEquipment(cleanId) || getCachedEquipment(hyphenId) || getCachedEquipment(underscoreId);
    if (cached?.weight !== undefined) {
      return parseWeight(cached.weight);
    }

    try {
      const atlasState = useAtlasStore.getState();
      const allAtlasItems = [
        ...(atlasState.equipmentList || []),
        ...(atlasState.materialsList || []),
        ...(atlasState.keyItemsList || []),
        ...(atlasState.booksList || [])
      ];
      const foundInList = (allAtlasItems as any[]).find((i: any) =>
        i?.index === cleanId || i?.index === hyphenId || i?.index === underscoreId
      );
      if (foundInList?.weight !== undefined) {
        return parseWeight(foundInList.weight);
      }
    } catch (e) {}

    if (CANONICAL_TEMPLATE_WEIGHTS[cleanId] !== undefined) return CANONICAL_TEMPLATE_WEIGHTS[cleanId];
    if (CANONICAL_TEMPLATE_WEIGHTS[hyphenId] !== undefined) return CANONICAL_TEMPLATE_WEIGHTS[hyphenId];
    if (CANONICAL_TEMPLATE_WEIGHTS[underscoreId] !== undefined) return CANONICAL_TEMPLATE_WEIGHTS[underscoreId];
  }

  if (itemInstance?.weight !== undefined) return parseWeight(itemInstance.weight);
  if (itemInstance?.weight_lbs !== undefined) return parseWeight(itemInstance.weight_lbs);

  return 0;
}

/**
 * Calculates total carrying weight for a character including equipped items, backpack items, and currency.
 */
export function calculateCharacterWeight(character: Character | undefined): number {
  if (!character) return 0;

  const calculateItemWeight = (item: any): number => {
    if (!item) return 0;
    const unitWeight = resolveItemTemplateWeight(item.template || item, item);
    return unitWeight * (item.quantity || 1);
  };

  let inventoryWeight = 0;
  if (character.saveVersion === 2 && character.items) {
    inventoryWeight = Object.values(character.items).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
  } else {
    const equippedWeight = Object.values(character.inventory || {}).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    const backpackWeight = (character.backpack || []).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    inventoryWeight = equippedWeight + backpackWeight;
  }

  const moneyWeight = calculateCurrencyWeight(character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });

  return inventoryWeight + moneyWeight;
}

/**
 * Creates a unique ID for an item instance
 */
export const generateInstanceId = (templateId: string): string => {
  return `${templateId}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Derives the ItemKind discriminator from item metadata
 */
export const deriveItemKind = (item: any): ItemKind => {
  if (item.kind) return item.kind;
  
  const idx = item.index?.toLowerCase() || '';
  const category = item.equipment_category?.index || '';
  const armorCat = item.armor_category || '';
  const weaponCat = item.weapon_category || '';

  if (weaponCat || idx.includes('weapon') || category === 'weapon') return 'weapon';
  if (armorCat === 'Shield' || idx === 'shield') return 'shield';
  if (armorCat) return 'armor';
  if (idx.includes('focus') || idx.includes('holy_symbol') || idx === 'spellbook') return 'focus';
  if (idx.includes('pack') || item.contents) return 'equipment_pack';
  if (idx.includes('tool') || category.includes('tool')) return 'tool';
  if (idx.includes('potion') || idx.includes('scroll') || idx.includes('ration') || category.includes('consumables')) return 'consumable';
  if (idx.includes('ring') || idx.includes('amulet') || idx.includes('necklace') || idx.includes('trinket')) return 'trinket';
  if (idx.includes('gp') || idx.includes('gold') || idx.includes('coin')) return 'currency';
  if (idx.includes('book') || idx.includes('tome') || idx.includes('manual')) return 'book';
  
  return 'adventuring_gear';
};

/**
 * Creates a new item instance from a template ID, optionally applying metadata
 */
export const createItemInstance = (templateId: string, quantity: number = 1, metadata?: any): ItemInstance => {
  const instance: ItemInstance = {
    id: generateInstanceId(templateId),
    template: templateId,
    quantity,
    addedAt: Date.now()
  };

  if (metadata) {
    instance.kind = deriveItemKind(metadata);
    instance.isMagic = metadata.rarity && metadata.rarity !== 'Common';
  }

  return instance;
};

/**
 * Creates a default equipment container for a character
 */
export const createDefaultEquipment = (characterId: string): { containerId: string; slots: InventorySlot[] } => {
  const containerId = `equipment_${characterId}`;
  return {
    containerId,
    slots: EQUIPMENT_SLOT_CATALOG.map(slot => ({
      id: slot.id,
      itemId: null
    }))
  };
};

/**
 * Creates a default backpack container for a character
 */
export const createDefaultBackpack = (characterId: string, slotCount: number = 24): InventoryContainer => {
  const id = `backpack_${characterId}`;
  return {
    id,
    type: 'backpack',
    ownerId: characterId,
    slots: Array.from({ length: slotCount }).map((_, i) => ({
      id: `bag_${i}`,
      itemId: null
    }))
  };
};

/**
 * Finds the first available slot in a container
 */
export const findFirstEmptySlot = (container: InventoryContainer): string | null => {
  const emptySlot = container.slots.find(s => s.itemId === null);
  return emptySlot ? emptySlot.id : null;
};

/**
 * Validates if an item can be equipped in a specific slot
 */
export const canEquipItem = (itemTemplate: any, slotId: string): { canEquip: boolean; reason?: string } => {
  const slotDef = EQUIPMENT_SLOT_CATALOG.find(s => s.id === slotId);
  if (!slotDef) return { canEquip: false, reason: 'Invalid slot' };

  const kind = deriveItemKind(itemTemplate);

  // Basic Kind Check
  if (slotDef.accepts?.kinds && !slotDef.accepts.kinds.includes(kind)) {
    return {
      canEquip: false,
      reason: `Slot ${slotDef.label} does not accept ${kind}`
    };
  }

  // Specialized checks

  // Armor Category Check
  if (kind === 'armor' && slotId === 'chest') {
    const armorCat = itemTemplate.armor_category;
    if (slotDef.accepts?.armorCategory && armorCat !== slotDef.accepts.armorCategory) {
       // Currently we allow any armor in chest, but could be specific
    }
  }

  // Weapon Handedness (simplified for now, full logic would need character state)
  if (kind === 'weapon') {
    const isTwoHanded = itemTemplate.properties?.some((p: any) => p.index === 'two-handed');
    if (isTwoHanded && slotId === 'off_hand') {
      return { canEquip: false, reason: 'Two-handed weapons cannot be equipped in the off-hand' };
    }
  }

  return { canEquip: true };
};
