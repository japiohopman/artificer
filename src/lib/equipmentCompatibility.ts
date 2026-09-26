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

  const isWeapon = kind === 'weapon' || Boolean(weaponCat) || category.includes('weapon');
  const isShield = kind === 'shield' || armorCat === 'shield' || category.includes('shield');
  const isArmor = (kind === 'armor' || Boolean(armorCat) || category.includes('armor')) && !isShield;

  switch (slotId) {
    case 'head': {
      const isValid = kind === 'head' || (category.includes('head') && !category.includes('adventuring')) || index.includes('helm') || index.includes('circlet');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'neck': {
      const isValid = kind === 'neck' || (category.includes('neck') && !category.includes('adventuring')) || index.includes('amulet') || index.includes('necklace');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'chest': {
      const isValid = isArmor || Boolean(armorCat) || (category.includes('armor') && !category.includes('adventuring')) || index.includes('cuirass');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'back': {
      const isValid = kind === 'back' || (category.includes('back') && !category.includes('adventuring')) || index.includes('cloak') || index.includes('cape');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'hands': {
      const isValid = kind === 'hands' || (category.includes('hands') && !category.includes('adventuring')) || index.includes('gloves') || index.includes('gauntlets');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'feet': {
      const isValid = kind === 'feet' || (category.includes('feet') && !category.includes('adventuring')) || index.includes('boots');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'main_hand': {
      const isValid = isWeapon;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'off_hand': {
      const isTwoHanded = meta.properties?.some((p: any) => (p.index || p.name || p) === 'two-handed');
      if (isTwoHanded) return 'INVALID';
      const isValid = isShield || isWeapon;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'ring_1':
    case 'ring_2': {
      const isValid = kind === 'ring' || (category.includes('ring') && !category.includes('adventuring'));
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'focus': {
      const isValid = kind === 'focus' || (category.includes('focus') && !category.includes('adventuring')) || index.includes('wand') || index.includes('druidic_focus') || index.includes('holy_symbol') || index.includes('spellbook') || index.includes('component_pouch');
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'clothes': {
      const isValid = (kind === 'clothes' || category.includes('clothing') || category.includes('clothes') || index.includes('clothes') || index.includes('costume') || index.includes('robe')) && !isWeapon;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'acc_1':
    case 'acc_2':
    case 'acc_3':
    case 'acc_4': {
      const isValid = (kind === 'trinket' || kind === 'accessory' || category.includes('trinket') || category.includes('accessory') || index.includes('trinket') || index.includes('amulet') || index.includes('gem')) && !isWeapon && !isArmor;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'tool_1':
    case 'tool_2':
    case 'tool_3':
    case 'tool_4':
    case 'tool_5': {
      const isValid = (kind === 'tool' || category.includes('tool') || index.includes('tool') || index.includes('kit') || index.includes('supplies')) && !isWeapon && !isArmor;
      return isValid ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    case 'extra':
    case 'quick_1' as any:
    case 'quick_2' as any:
    case 'quick_3' as any:
    case 'quick_4' as any: {
      // Weapons and Armor MUST NOT be accepted into quick / extra slots
      if (isWeapon || isArmor || isShield) return 'INVALID';

      const isConsumable = kind === 'consumable' || category.includes('potion') || category.includes('scroll') || category.includes('vial') || category.includes('poison') || category.includes('consumable') || index.includes('potion') || index.includes('scroll') || index.includes('flask') || index.includes('vial') || index.includes('poison') || index.includes('elixir') || index.includes('salve');
      const isTrapOrThrowable = kind === 'trap' || kind === 'throwable' || kind === 'utility' || index.includes('caltrops') || index.includes('ball_bearings') || index.includes('ball-bearings') || index.includes('hunting_trap') || index.includes('hunting-trap') || index.includes('oil') || index.includes('acid') || index.includes('alchemist') || index.includes('holy_water') || index.includes('holy-water') || index.includes('tinderbox') || index.includes('dynamite') || index.includes('bomb') || index.includes('smokebomb');
      const isQuickUtility = kind === 'adventuring_gear' || category.includes('adventuring_gear') || category.includes('adventuring-gear') || isConsumable || isTrapOrThrowable;

      return isQuickUtility ? (isOccupied ? 'REPLACE' : 'VALID') : 'INVALID';
    }
    default:
      // Unknown / unsupported slot IDs fail closed
      return 'INVALID';
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
 * Determines whether a character is proficient with a given equipped or target item (weapon, armor, shield)
 * using the character's canonical proficiency data and canonical Atlas equipment metadata.
 */
export function isProficientWithEquipment(character: any, item: any): boolean {
  if (!character || !item) return true;

  const meta = resolveItemMetadata(item, character.ruleset);
  if (!meta) return true;

  const kind = (meta.kind || meta._type || meta.type || '').toLowerCase();
  const categoryIndex = (meta.equipment_category?.index || meta.equipment_category?.name || meta.category || '').toLowerCase();
  const armorCat = (meta.armor_category || '').toLowerCase();
  const weaponCat = (meta.weapon_category || '').toLowerCase();

  const isWeapon = kind === 'weapon' || Boolean(weaponCat) || categoryIndex.includes('weapon');
  const isShield = kind === 'shield' || armorCat === 'shield' || categoryIndex.includes('shield');
  const isArmor = (kind === 'armor' || Boolean(armorCat) || categoryIndex.includes('armor')) && !isShield;

  if (!isWeapon && !isArmor && !isShield) return true;

  // Extract and normalize character proficiencies
  const rawProfs: string[] = [];
  if (Array.isArray(character.proficiencies)) {
    character.proficiencies.forEach((p: any) => {
      if (typeof p === 'string') {
        rawProfs.push(p.toLowerCase().trim());
      } else if (p && typeof p === 'object') {
        if (p.name) rawProfs.push(String(p.name).toLowerCase().trim());
        if (p.index) rawProfs.push(String(p.index).toLowerCase().trim());
      }
    });
  }

  // 1. Shield Check
  if (isShield) {
    return rawProfs.some(p => p.includes('shield'));
  }

  // 2. Armor Check
  if (isArmor) {
    if (!armorCat) return true;
    if (armorCat.includes('light')) {
      return rawProfs.some(p => p.includes('light armor') || p.includes('light_armor') || p === 'light');
    }
    if (armorCat.includes('medium')) {
      return rawProfs.some(p => p.includes('medium armor') || p.includes('medium_armor') || p === 'medium');
    }
    if (armorCat.includes('heavy')) {
      return rawProfs.some(p => p.includes('heavy armor') || p.includes('heavy_armor') || p === 'heavy');
    }
    return true;
  }

  // 3. Weapon Check
  if (isWeapon) {
    if (weaponCat.includes('simple')) {
      if (rawProfs.some(p => p.includes('simple weapon') || p.includes('simple_weapon') || p === 'simple')) return true;
    }
    if (weaponCat.includes('martial')) {
      if (rawProfs.some(p => p.includes('martial weapon') || p.includes('martial_weapon') || p === 'martial')) return true;
    }

    // Specific weapon match from Atlas metadata index/name
    const itemIndex = (meta.index || meta.template || meta.id || '').toLowerCase().trim();
    const itemName = (meta.name || '').toLowerCase().trim();

    return rawProfs.some(p => {
      const cleanP = p.replace(/_/g, ' ').replace(/-/g, ' ');
      const cleanIndex = itemIndex.replace(/_/g, ' ').replace(/-/g, ' ');
      const cleanName = itemName.replace(/_/g, ' ').replace(/-/g, ' ');

      return (
        (cleanIndex && (cleanP.includes(cleanIndex) || cleanIndex.includes(cleanP))) ||
        (cleanName && (cleanP.includes(cleanName) || cleanName.includes(cleanP)))
      );
    });
  }

  return true;
}
