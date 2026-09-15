import { EquipmentSlotId } from './equipmentConstants';

/**
 * Checks if a given item is compatible with a target equipment slot.
 */
export function isItemCompatibleWithSlot(item: any, slotId: EquipmentSlotId): boolean {
  if (!item) return false;

  const kind = (item.kind || item._type || item.type || '').toLowerCase();
  const itemSlot = (item.slot || '').toLowerCase();

  switch (slotId) {
    case 'head':
      return kind === 'head' || itemSlot === 'head' || kind === 'helm' || kind === 'hat';
    case 'neck':
      return kind === 'neck' || itemSlot === 'neck' || kind === 'amulet' || kind === 'necklace';
    case 'chest':
      return kind === 'armor' || kind === 'chest' || itemSlot === 'chest' || kind === 'robe';
    case 'back':
      return kind === 'back' || itemSlot === 'back' || kind === 'cloak' || kind === 'cape';
    case 'hands':
      return kind === 'hands' || itemSlot === 'hands' || kind === 'gloves' || kind === 'gauntlets';
    case 'feet':
      return kind === 'feet' || itemSlot === 'feet' || kind === 'boots' || kind === 'shoes';
    case 'main_hand':
      return kind === 'weapon' || itemSlot === 'main_hand' || kind === 'melee' || kind === 'ranged';
    case 'off_hand':
      return kind === 'shield' || kind === 'weapon' || itemSlot === 'off_hand';
    case 'ring_1':
    case 'ring_2':
      return kind === 'ring' || itemSlot === 'ring' || itemSlot === 'ring_1' || itemSlot === 'ring_2';
    case 'focus':
      return kind === 'focus' || kind === 'spellcasting' || itemSlot === 'focus' || kind === 'wand' || kind === 'staff' || kind === 'symbol';
    default:
      // Utility / accessory side/bottom slots
      return true;
  }
}
