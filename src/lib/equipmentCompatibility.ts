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

/**
 * Determines whether a character is proficient with a given equipped or target item (weapon, armor, shield).
 */
export function isProficientWithEquipment(character: any, item: any): boolean {
  if (!character || !item) return true;

  const meta = resolveItemMetadata(item, character.ruleset);
  if (!meta) return true;

  const kind = (meta.kind || meta._type || meta.type || '').toLowerCase();
  const category = (meta.equipment_category?.index || meta.equipment_category?.name || meta.category || '').toLowerCase();
  const armorCat = (meta.armor_category || '').toLowerCase();
  const weaponCat = (meta.weapon_category || '').toLowerCase();
  const name = (meta.name || meta.index || meta.template || '').toLowerCase();

  const isWeapon = kind === 'weapon' || weaponCat || category.includes('weapon') ||
    name.includes('sword') || name.includes('dagger') || name.includes('bow') || name.includes('axe') || name.includes('mace') || name.includes('spear');
  const isShield = kind === 'shield' || armorCat === 'shield' || name.includes('shield');
  const isArmor = (kind === 'armor' || armorCat || category.includes('armor')) && !isShield;

  if (!isWeapon && !isArmor && !isShield) return true;

  // Extract character proficiencies (normalized)
  const rawProfs: string[] = [];
  if (Array.isArray(character.proficiencies)) {
    character.proficiencies.forEach((p: any) => {
      if (typeof p === 'string') rawProfs.push(p.toLowerCase());
      else if (p && typeof p === 'object') {
        if (p.name) rawProfs.push(String(p.name).toLowerCase());
        if (p.index) rawProfs.push(String(p.index).toLowerCase());
      }
    });
  }

  // Also include base class proficiencies
  const charClass = (character.class || '').toLowerCase();
  if (['fighter', 'paladin'].includes(charClass)) {
    rawProfs.push('all armor', 'shields', 'simple weapons', 'martial weapons', 'light armor', 'medium armor', 'heavy armor');
  } else if (charClass === 'barbarian' || charClass === 'ranger') {
    rawProfs.push('shields', 'simple weapons', 'martial weapons', 'light armor', 'medium armor');
  } else if (['cleric', 'artificer'].includes(charClass)) {
    rawProfs.push('shields', 'simple weapons', 'light armor', 'medium armor');
  } else if (charClass === 'druid') {
    rawProfs.push('shields', 'simple weapons', 'light armor', 'medium armor');
  } else if (['rogue', 'bard'].includes(charClass)) {
    rawProfs.push('light armor', 'simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords');
  } else if (charClass === 'monk') {
    rawProfs.push('simple weapons', 'shortswords');
  } else if (charClass === 'warlock') {
    rawProfs.push('light armor', 'simple weapons');
  } else if (['wizard', 'sorcerer'].includes(charClass)) {
    rawProfs.push('daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows', 'crossbows, light');
  }

  // 1. Shield Check
  if (isShield) {
    return rawProfs.some(p => p.includes('shield'));
  }

  // 2. Armor Check
  if (isArmor) {
    if (armorCat.includes('light')) {
      return rawProfs.some(p => p.includes('light armor') || p === 'light');
    }
    if (armorCat.includes('medium')) {
      return rawProfs.some(p => p.includes('medium armor') || p === 'medium');
    }
    if (armorCat.includes('heavy')) {
      return rawProfs.some(p => p.includes('heavy armor') || p === 'heavy');
    }
    // If no specific armor category (e.g., clothes / robes), no proficiency required
    return true;
  }

  // 3. Weapon Check
  if (isWeapon) {
    if (weaponCat.includes('simple')) {
      if (rawProfs.some(p => p.includes('simple weapon') || p.includes('simple weapons') || p === 'simple')) return true;
    }
    if (weaponCat.includes('martial')) {
      if (rawProfs.some(p => p.includes('martial weapon') || p.includes('martial weapons') || p === 'martial')) return true;
    }

    // Specific weapon matching
    const normalizedName = name.replace(/_/g, ' ').replace(/-/g, ' ');
    return rawProfs.some(p => {
      const cleanP = p.replace(/_/g, ' ').replace(/-/g, ' ');
      return cleanP.includes(normalizedName) || normalizedName.includes(cleanP);
    });
  }

  return true;
}
