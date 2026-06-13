
import { Character } from '../store/useCharacterStore';
import { ItemInstance, InventoryContainer, InventorySlot } from '../types/inventory';
import { generateInstanceId, deriveItemKind, createDefaultEquipment, createDefaultBackpack } from './inventoryUtils';

/**
 * Migrates a Character from v1 (inventory/backpack) to v2 (items/containers/equipment)
 */
export const migrateCharacterV1ToV2 = (character: Character): Character => {
  if (character.saveVersion && character.saveVersion >= 2) {
    return character;
  }

  const items: Record<string, ItemInstance> = character.items || {};
  const containers: Record<string, InventoryContainer> = character.containers || {};

  // Create default containers if they don't exist
  if (!character.equipment) {
    character.equipment = createDefaultEquipment(character.id);
  }

  const backpackId = `backpack_${character.id}`;
  if (!containers[backpackId]) {
    containers[backpackId] = createDefaultBackpack(character.id);
  }

  const backpack = containers[backpackId];
  const equipment = character.equipment;

  // Helper to add item to registry and find a slot
  const addItem = (itemTemplate: any, targetSlots: InventorySlot[]) => {
    const templateId = itemTemplate.index || itemTemplate.id || 'unknown';
    const instanceId = generateInstanceId(templateId);

    const instance: ItemInstance = {
      id: instanceId,
      template: templateId,
      quantity: itemTemplate.quantity || 1,
      addedAt: Date.now(),
      kind: deriveItemKind(itemTemplate),
      isMagic: itemTemplate.rarity && itemTemplate.rarity !== 'Common'
    };

    items[instanceId] = instance;

    // Find first empty slot in target slots
    const emptySlot = targetSlots.find(s => s.itemId === null);
    if (emptySlot) {
      emptySlot.itemId = instanceId;
    }
  };

  // 1. Migrate Backpack (v1 array)
  if (Array.isArray(character.backpack)) {
    character.backpack.forEach(item => {
      addItem(item, backpack.slots);
    });
  }

  // 2. Migrate Inventory (v1 object)
  if (character.inventory && typeof character.inventory === 'object') {
    Object.entries(character.inventory).forEach(([slotId, item]) => {
      if (!item) return;

      // Map legacy slot IDs to v2
      let v2SlotId = slotId.replace('-', '_');
      if (v2SlotId === 'main_hand' || v2SlotId === 'off_hand' || v2SlotId === 'chest' || v2SlotId === 'head' ||
          v2SlotId === 'hands' || v2SlotId === 'feet' || v2SlotId === 'back' || v2SlotId === 'neck' ||
          v2SlotId === 'belt' || v2SlotId === 'ranged' || v2SlotId === 'ammo') {

        // Check if slot already has something (legacy might have multiple keys for same slot)
        const slot = equipment.slots.find(s => s.id === v2SlotId);
        if (slot && !slot.itemId) {
           addItem(item, [slot]);
        } else {
           // If slot busy or not found, put in backpack
           addItem(item, backpack.slots);
        }
      } else {
        // Unknown slot, put in backpack
        addItem(item, backpack.slots);
      }
    });
  }

  return {
    ...character,
    saveVersion: 2,
    items,
    containers,
    equipment,
    // Clear legacy fields but keep them optional for type compatibility if needed
    inventory: {},
    backpack: []
  };
};
