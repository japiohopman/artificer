import { EquipmentSlotId } from './equipmentConstants';
import { getCachedEquipment } from '../services/storageService';

export type CompatibilityResult = 'VALID' | 'INVALID' | 'REPLACE';

/**
 * Resolves the full template data for an item or item instance.
 */
export function resolveItemMetadata(item: any, ruleset?: '2014' | '2024'): any {
  if (!item) return null;
  const templateId = item.template || item.index || (typeof item === 'string' ? item : null);
  const cached = templateId ? getCachedEquipment(templateId, ruleset) : null;
  return {
    ...cached,
    ...item
  };
}

/**
 * Evaluates compatibility between an item instance and a target equipment slot or ammunition slot.
 */
export function evaluateSlotCompatibility(
  item: any,
  slotId: EquipmentSlotId | 'ammunition' | 'ammo',
  equippedItems: Record<string, any> = {},
  ruleset?: '2014' | '2024'
): CompatibilityResult {
  if (!item) return 'INVALID';

  const meta = resolveItemMetadata(item, ruleset);
  const kind = (meta.kind || meta._type || meta.type || '').toLowerCase();
  const category = (meta.equipment_category?.index || meta.category || '').toLowerCase();
  const armorCat = (meta.armor_category || '').toLowerCase();
  const weaponCat = (meta.weapon_category || '').toLowerCase();
  const index = (meta.index || meta.template || meta.id || '').toLowerCase();

  const isOccupied = Boolean(equippedItems[slotId]);

  if (slotId === 'ammunition' || slotId === 'ammo') {
    const isAmmo = kind === 'ammunition' || category.includes('ammunition') || index.includes('arrow') || index.includes('bolt') || index.includes('needle');
    if (!isAmmo) return 'INVALID';

    // Verify compatibility with equipped main_hand weapon if present
    const mainHandItem = equippedItems.main_hand;
    if (mainHandItem) {
      const mainMeta = resolveItemMetadata(mainHandItem, ruleset);
      const mainIndex = (mainMeta?.index || mainMeta?.template || '').toLowerCase();

      const isBow = mainIndex.includes('bow') && !mainIndex.includes('crossbow');
      const isCrossbow = mainIndex.includes('crossbow');

      if (isBow && !index.includes('arrow')) return 'INVALID';
      if (isCrossbow && !index.includes('bolt')) return 'INVALID';
    }

    return isOccupied ? 'REPLACE' : 'VALID';
  }

  switch (slotId) {
    case 'head': {
      const isValid = kind === 'head' || category.includes('head') || index.includes('helm') || index.includes('hat') || index.includes('circlet');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'neck': {
      const isValid = kind === 'neck' || category.includes('neck') || index.includes('amulet') || index.includes('necklace');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'chest': {
      const isValid = kind === 'armor' || armorCat || category.includes('armor') || index.includes('robe') || index.includes('clothes');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'back': {
      const isValid = kind === 'back' || category.includes('back') || index.includes('cloak') || index.includes('cape');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'hands': {
      const isValid = kind === 'hands' || category.includes('hands') || index.includes('gloves') || index.includes('gauntlets');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'feet': {
      const isValid = kind === 'feet' || category.includes('feet') || index.includes('boots') || index.includes('shoes');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'main_hand': {
      const isValid = kind === 'weapon' || weaponCat || category.includes('weapon');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'off_hand': {
      const isShield = kind === 'shield' || armorCat === 'shield' || index.includes('shield');
      const isOffhandWeapon = kind === 'weapon' || weaponCat || category.includes('weapon');
      const isTwoHanded = meta.properties?.some((p: any) => p.index === 'two-handed');
      if (isTwoHanded) return 'INVALID';
      const isValid = isShield || isOffhandWeapon;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'ring_1':
    case 'ring_2': {
      const isValid = kind === 'ring' || category.includes('ring') || index.includes('ring');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'focus': {
      const isValid = kind === 'focus' || category.includes('focus') || index.includes('wand') || index.includes('staff') || index.includes('symbol') || index.includes('spellbook');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    default:
      return isOccupied ? 'REPLACE' : 'VALID';
  }
}

/**
 * Checks if a given item is compatible with a target equipment slot.
 */
export function isItemCompatibleWithSlot(
  item: any,
  slotId: EquipmentSlotId | 'ammunition' | 'ammo',
  equippedItems: Record<string, any> = {},
  ruleset?: '2014' | '2024'
): boolean {
  const result = evaluateSlotCompatibility(item, slotId, equippedItems, ruleset);
  return result === 'VALID' || result === 'REPLACE';
}
