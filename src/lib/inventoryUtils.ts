
import { ItemInstance, InventoryContainer, InventorySlot, EQUIPMENT_SLOT_CATALOG, ItemKind } from '../types/inventory';
import { Character } from '../store/useCharacterStore';
import { calculateCurrencyWeight } from './currencyUtils';

/**
 * Calculates total carrying weight for a character including equipped items, backpack items, and currency.
 */
export function calculateCharacterWeight(character: Character | undefined): number {
  if (!character) return 0;

  const parseWeight = (weight: any): number => {
    if (!weight) return 0;
    if (typeof weight === 'number') return weight;
    const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
    return weightMatch ? parseFloat(weightMatch[0]) : 0;
  };

  const calculateItemWeight = (item: any): number => {
    if (!item) return 0;
    const rawWeight = item.weight ?? item.weight_lbs ?? item.metadata?.weight ?? item.template?.weight ?? 0;
    return parseWeight(rawWeight) * (item.quantity || 1);
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
