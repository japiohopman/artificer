import { create } from 'zustand';
import { getPackContents } from '../lib/itemPacks';
import { playSlotSound } from '../services/storageService';
import { evaluateSlotCompatibility } from '../lib/equipmentCompatibility';

interface MoveLocation {
  type: 'equip_slot' | 'inventory_slot' | 'backpack' | 'container_slot';
  slotId?: string;
  slotIndex?: number;
  containerId?: string;
}

interface InventoryState {
  isInventoryOpen: boolean;
  isInventoryMenuOpen: boolean;
  partyInventory: any[];
  partyVehicles: any[];
  partyStats: {
    memberCount: number;
    baseCapacityPerMember: number;
    vehicleCapacityBonus: number;
    currencyWeightPerCoin: number;
  };

  // Actions
  setIsInventoryOpen: (isOpen: boolean) => void;
  setIsInventoryMenuOpen: (isOpen: boolean) => void;
  addToBackpack: (item: any) => void;
  removeFromBackpack: (indexOrItemId: any) => void;
  equipItem: (itemOrItemId: any, slotId: string) => void;
  unequipItem: (slotId: string) => void;
  moveItem: (params: { source: MoveLocation; target: MoveLocation; item: any; characterId?: string }) => void;
  updatePartyStats: (stats: Partial<InventoryState['partyStats']>) => void;
  transferItem: (params: { sourceId: string; targetId: string; itemId: string }) => void;
  addToPartyInventory: (item: any) => void;
  removeFromPartyInventory: (itemId: string) => void;
  addVehicle: (vehicle: any) => void;
  removeVehicle: (index: number) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  isInventoryOpen: false,
  isInventoryMenuOpen: false,
  partyInventory: [],
  partyVehicles: [],
  partyStats: {
    memberCount: 6,
    baseCapacityPerMember: 150,
    vehicleCapacityBonus: 0,
    currencyWeightPerCoin: 0.02,
  },

  setIsInventoryOpen: (isInventoryOpen) => set({ isInventoryOpen }),
  setIsInventoryMenuOpen: (isInventoryMenuOpen) => set({ isInventoryMenuOpen }),

  addToBackpack: (item) => {
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { activeCharacterId, characters } = useCharacterStore.getState();
      const packContents = getPackContents(item.index || item.name);
      const itemsToAdd = packContents 
        ? packContents.map(c => ({ index: c.template, name: c.template, quantity: c.quantity }))
        : [item];

      useCharacterStore.setState({
        characters: characters.map(char => {
          if (char.id !== activeCharacterId) return char;
          
          const updatedChar = { ...char };
          if (char.saveVersion === 2) {
            const items = { ...(char.items || {}) };
            const containers = { ...(char.containers || {}) };
            const backpack = Object.values(containers).find(c => c.type === 'backpack');
            if (!backpack) return char;

            itemsToAdd.forEach(toAdd => {
              const template = toAdd.index || toAdd.name;
              const existingId = backpack.slots.find(s => s.itemId && items[s.itemId].template === template)?.itemId;
              
              if (existingId) {
                items[existingId] = { ...items[existingId], quantity: (items[existingId].quantity || 1) + (toAdd.quantity || 1) };
              } else {
                const newId = crypto.randomUUID();
                items[newId] = { id: newId, template, quantity: toAdd.quantity || 1, addedAt: Date.now() };
                const slot = backpack.slots.find(s => s.itemId === null);
                if (slot) slot.itemId = newId;
              }
            });
            return { ...updatedChar, items, containers };
          }

          const newBackpack = [...char.backpack];
          itemsToAdd.forEach(toAdd => {
            const existingItemIndex = newBackpack.findIndex(i => (i.index && i.index === toAdd.index) || (i.name === toAdd.name));
            if (existingItemIndex > -1) {
              const existingItem = { ...newBackpack[existingItemIndex] };
              existingItem.quantity = (existingItem.quantity || 1) + (toAdd.quantity || 1);
              newBackpack[existingItemIndex] = existingItem;
            } else {
              newBackpack.push({ ...toAdd, id: crypto.randomUUID(), quantity: toAdd.quantity || 1 });
            }
          });
          return { ...updatedChar, backpack: newBackpack };
        })
      });
    });
  },

  removeFromBackpack: (indexOrItemId) => {
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { activeCharacterId, characters } = useCharacterStore.getState();
      useCharacterStore.setState({
        characters: characters.map(char => {
          if (char.id !== activeCharacterId) return char;

          if (char.saveVersion === 2) {
            const itemId = indexOrItemId as any;
            const items = { ...(char.items || {}) };
            const containers = { ...(char.containers || {}) };
            const backpack = Object.values(containers).find(c => c.type === 'backpack');
            if (!backpack) return char;

            backpack.slots = backpack.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
            delete items[itemId];
            return { ...char, items, containers };
          }
          return {
            ...char,
            backpack: char.backpack.filter((item, i) => {
              if (typeof indexOrItemId === 'number') return i !== indexOrItemId;
              return item.id !== indexOrItemId;
            })
          };
        })
      });
    });
  },

  equipItem: (itemOrItemId, slotId) => {
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { activeCharacterId, characters } = useCharacterStore.getState();
      const newCharacters = characters.map(char => {
        if (char.id !== activeCharacterId) return char;
        
        if (char.saveVersion === 2) {
          const itemId = typeof itemOrItemId === 'string' ? itemOrItemId : itemOrItemId?.id;
          if (!itemId) return char;

          // Require canonical ItemInstance from char.items[itemId]
          const itemInstance = char.items?.[itemId];
          if (!itemInstance) return char;

          // Resolve currently equipped items for compatibility check
          const currentEquipped: Record<string, any> = {};
          char.equipment?.slots?.forEach((s: any) => {
            if (s.itemId && char.items?.[s.itemId]) {
              currentEquipped[s.id] = char.items[s.itemId];
            }
          });

          // Enforce domain equipment slot compatibility
          const comp = evaluateSlotCompatibility(itemInstance, slotId as any, currentEquipped, char.ruleset);
          if (comp === 'INVALID') {
            return char;
          }

          const equipment = {
            ...char.equipment!,
            slots: char.equipment!.slots.map(s => ({ ...s }))
          };
          const containers: Record<string, any> = {};
          Object.entries(char.containers || {}).forEach(([cId, container]: [string, any]) => {
            containers[cId] = {
              ...container,
              slots: container.slots.map((s: any) => ({ ...s }))
            };
          });

          const backpack = Object.values(containers).find((c: any) => c.type === 'backpack');
          if (!backpack) return char;
          
          const targetSlot = equipment.slots.find(s => s.id === slotId);
          if (!targetSlot) return char;

          // Check if item is already equipped in another slot
          const existingEquipSlot = equipment.slots.find(s => s.itemId === itemId);

          // Check if item is in backpack
          const bagSlotIdx = backpack.slots.findIndex((s: any) => s.itemId === itemId);

          if (!existingEquipSlot && bagSlotIdx === -1) {
            return char; // Item instance is not in equipment or backpack
          }

          const targetOccupantId = targetSlot.itemId;

          // Atomic check: If target is occupied and we need an empty backpack slot to displace targetOccupantId
          if (targetOccupantId && targetOccupantId !== itemId) {
            // If item was in backpack, bagSlotIdx will become free; otherwise we need an empty slot
            const hasSlotForDisplaced = bagSlotIdx !== -1 || backpack.slots.some((s: any) => s.itemId === null);
            if (!hasSlotForDisplaced) {
              return char; // Full backpack: cannot displace occupant without losing item
            }
          }

          // Clear original source placement (if previously in an equipment slot)
          if (existingEquipSlot) {
            existingEquipSlot.itemId = null;
          }

          // Clear original source placement in backpack
          if (bagSlotIdx !== -1) {
            backpack.slots[bagSlotIdx].itemId = null;
          }

          // If target was occupied, place displaced occupant in backpack (preferring bagSlotIdx if freed)
          if (targetOccupantId && targetOccupantId !== itemId) {
            if (bagSlotIdx !== -1) {
              backpack.slots[bagSlotIdx].itemId = targetOccupantId;
            } else {
              const emptyBagSlot = backpack.slots.find((s: any) => s.itemId === null);
              if (emptyBagSlot) {
                emptyBagSlot.itemId = targetOccupantId;
              }
            }
          }

          targetSlot.itemId = itemId;
          playSlotSound();
          return { ...char, equipment, containers };
        }

        const item = itemOrItemId;
        let newBackpack = char.backpack.filter(i => i.id !== item.id);
        const newInventory = { ...char.inventory };
        const itemSlots = Array.isArray(item.slot) ? item.slot : [slotId];
        
        itemSlots.forEach((s: any) => {
          const existingItem = newInventory[s];
          if (existingItem) {
            const existingSlots = Array.isArray(existingItem.slot) ? existingItem.slot : [s];
            existingSlots.forEach((es: any) => delete newInventory[es]);
            if (!newBackpack.find(i => i.id === existingItem.id)) {
              newBackpack.push(existingItem);
            }
          }
        });

        itemSlots.forEach((s: any) => {
          newInventory[s] = item;
        });

        playSlotSound();
        return { ...char, inventory: newInventory, backpack: newBackpack };
      });
      useCharacterStore.setState({ characters: newCharacters });
    });
  },

  unequipItem: (slotId) => {
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { activeCharacterId, characters } = useCharacterStore.getState();
      const activeChar = characters.find(c => c.id === activeCharacterId);
      if (!activeChar) return;

      if (activeChar.saveVersion === 2) {
          useCharacterStore.setState({
            characters: characters.map(c => {
              if (c.id !== activeCharacterId) return c;
              const equipment = { ...c.equipment! };
              const containers = { ...c.containers! };
              const backpack = Object.values(containers).find(con => con.type === 'backpack')!;
              
              const slot = equipment.slots.find(s => s.id === slotId);
              if (!slot || !slot.itemId) return c;

              const itemId = slot.itemId;
              slot.itemId = null;

              const emptyBagSlot = backpack.slots.find(s => s.itemId === null);
              if (emptyBagSlot) emptyBagSlot.itemId = itemId;

              return { ...c, equipment, containers };
            })
          });
          return;
      }

      const item = activeChar.inventory[slotId];
      if (!item) return;

      const newCharacters = characters.map(char => {
        if (char.id !== activeCharacterId) return char;
        const newInventory = { ...char.inventory };
        const itemSlots = Array.isArray(item.slot) ? item.slot : [slotId];
        itemSlots.forEach((s: any) => delete newInventory[s]);
        return { ...char, inventory: newInventory, backpack: [...char.backpack, item] };
      });
      useCharacterStore.setState({ characters: newCharacters });
    });
  },

  moveItem: ({ source, target, item, characterId }) => {
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { activeCharacterId, characters } = useCharacterStore.getState();
      const targetCharId = characterId || activeCharacterId;

      useCharacterStore.setState({
        characters: characters.map(char => {
          if (char.id !== targetCharId) return char;

          if (char.saveVersion === 2) {
            const itemId = item.id;
            const itemInstance = char.items?.[itemId];

            // 1. Source Location Verification: Verify source actually contains itemId
            if (!itemInstance) {
              return char; // Item does not exist in character.items
            }

            if (source.type === 'equip_slot' && source.slotId) {
              const srcEquipSlot = char.equipment?.slots?.find((s: any) => s.id === source.slotId);
              if (!srcEquipSlot || srcEquipSlot.itemId !== itemId) {
                return char; // Forged or mismatched equip_slot source
              }
            } else if (source.type === 'container_slot' && source.containerId && source.slotIndex !== undefined) {
              const srcContainer = char.containers?.[source.containerId];
              if (!srcContainer || !srcContainer.slots[source.slotIndex] || srcContainer.slots[source.slotIndex].itemId !== itemId) {
                return char; // Forged or mismatched container_slot source
              }
            } else if (source.type === 'inventory_slot' && source.slotIndex !== undefined) {
              const backpack = Object.values(char.containers || {}).find((c: any) => c.type === 'backpack');
              if (!backpack || !backpack.slots[source.slotIndex] || backpack.slots[source.slotIndex].itemId !== itemId) {
                return char; // Forged or mismatched inventory_slot source
              }
            } else if (source.type === 'backpack') {
              const backpack = Object.values(char.containers || {}).find((c: any) => c.type === 'backpack');
              const containsItem = backpack?.slots.some((s: any) => s.itemId === itemId);
              if (!containsItem) {
                return char; // Forged or mismatched backpack source
              }
            }

            // Resolve currently equipped items for domain compatibility evaluation
            const currentEquipped: Record<string, any> = {};
            char.equipment?.slots?.forEach((s: any) => {
              if (s.itemId && char.items?.[s.itemId]) {
                currentEquipped[s.id] = char.items[s.itemId];
              }
            });

            // 2. Enforce domain equipment slot compatibility when target is an equip slot
            if (target.type === 'equip_slot' && target.slotId) {
              const comp = evaluateSlotCompatibility(itemInstance, target.slotId as any, currentEquipped, char.ruleset);
              if (comp === 'INVALID') {
                return char;
              }
            }

            // Deep immutable copy of equipment and containers
            const equipment = {
              ...char.equipment!,
              slots: char.equipment!.slots.map(s => ({ ...s }))
            };
            const containers: Record<string, any> = {};
            Object.entries(char.containers || {}).forEach(([cId, container]: [string, any]) => {
              containers[cId] = {
                ...container,
                slots: container.slots.map((s: any) => ({ ...s }))
              };
            });

            const backpack = Object.values(containers).find((c: any) => c.type === 'backpack');
            if (!backpack) return char;

            // Target 1: Equipment Slot
            if (target.type === 'equip_slot' && target.slotId) {
              const targetEquipSlot = equipment.slots.find(s => s.id === target.slotId);
              if (!targetEquipSlot) return char;

              const occupantId = targetEquipSlot.itemId;

              // Validate occupant compatibility if swapping into a source equipment slot
              if (occupantId && source.type === 'equip_slot' && source.slotId) {
                const occupantItem = char.items?.[occupantId];
                const occupantComp = evaluateSlotCompatibility(occupantItem, source.slotId as any, {}, char.ruleset);
                if (occupantComp === 'INVALID') return char;
              }

              // Clear item from source location
              if (source.type === 'equip_slot' && source.slotId) {
                const srcSlot = equipment.slots.find((s: any) => s.id === source.slotId);
                if (srcSlot) srcSlot.itemId = occupantId;
              } else if (source.type === 'container_slot' && source.containerId && source.slotIndex !== undefined) {
                const srcContainer = containers[source.containerId];
                if (srcContainer?.slots[source.slotIndex]) {
                  srcContainer.slots[source.slotIndex].itemId = occupantId;
                }
              } else if (source.type === 'inventory_slot' && source.slotIndex !== undefined) {
                if (backpack.slots[source.slotIndex]) {
                  backpack.slots[source.slotIndex].itemId = occupantId;
                }
              } else {
                backpack.slots = backpack.slots.map((s: any) => s.itemId === itemId ? { ...s, itemId: occupantId } : s);
              }

              targetEquipSlot.itemId = itemId;
              playSlotSound();
              return { ...char, equipment, containers };
            }

            // Target 1.5: Nested Container Slot
            if (target.type === 'container_slot' && target.containerId && target.slotIndex !== undefined) {
              const targetContainer = containers[target.containerId];
              if (!targetContainer || target.slotIndex < 0 || target.slotIndex >= targetContainer.slots.length) return char;

              const occupantId = targetContainer.slots[target.slotIndex].itemId;

              // Clear item from source location and place occupant
              if (source.type === 'equip_slot' && source.slotId) {
                const srcSlot = equipment.slots.find(s => s.id === source.slotId);
                if (srcSlot) srcSlot.itemId = occupantId;
              } else if (source.type === 'container_slot' && source.containerId && source.slotIndex !== undefined) {
                const srcContainer = containers[source.containerId];
                if (srcContainer?.slots[source.slotIndex]) {
                  srcContainer.slots[source.slotIndex].itemId = occupantId;
                }
              } else if (source.type === 'inventory_slot' && source.slotIndex !== undefined) {
                if (backpack.slots[source.slotIndex]) {
                  backpack.slots[source.slotIndex].itemId = occupantId;
                }
              }

              targetContainer.slots[target.slotIndex].itemId = itemId;
              playSlotSound();
              return { ...char, equipment, containers };
            }

            // Target 2: Specific Inventory Slot or Backpack
            if (target.type === 'inventory_slot' && target.slotIndex !== undefined) {
              const targetIndex = target.slotIndex;
              if (targetIndex < 0 || targetIndex >= backpack.slots.length) return char;

              const occupantId = backpack.slots[targetIndex].itemId;

              // Validate occupant compatibility if swapping into a source equipment slot
              if (occupantId && source.type === 'equip_slot' && source.slotId) {
                const occupantItem = char.items?.[occupantId];
                const occupantComp = evaluateSlotCompatibility(occupantItem, source.slotId as any, char.inventory || {}, char.ruleset);
                if (occupantComp === 'INVALID') {
                  // If occupant is not compatible with source equipment slot, unequip occupant to open backpack slot
                  const emptyBagSlot = backpack.slots.find((s: any, idx: number) => s.itemId === null && idx !== targetIndex);
                  if (emptyBagSlot) {
                    emptyBagSlot.itemId = occupantId;
                  }
                  const srcSlot = equipment.slots.find((s: any) => s.id === source.slotId);
                  if (srcSlot) srcSlot.itemId = null;
                  backpack.slots[targetIndex].itemId = itemId;
                  playSlotSound();
                  return { ...char, equipment, containers };
                }
              }

              // Move / Swap
              if (source.type === 'equip_slot' && source.slotId) {
                const srcSlot = equipment.slots.find((s: any) => s.id === source.slotId);
                if (srcSlot) srcSlot.itemId = occupantId;
              } else if (source.type === 'inventory_slot' && source.slotIndex !== undefined) {
                if (backpack.slots[source.slotIndex]) {
                  backpack.slots[source.slotIndex].itemId = occupantId;
                }
              }

              backpack.slots[targetIndex].itemId = itemId;
              playSlotSound();
              return { ...char, equipment, containers };
            }

            // Fallback unequip to first open backpack slot
            if (source.type === 'equip_slot' && source.slotId) {
              const srcSlot = equipment.slots.find(s => s.id === source.slotId);
              if (srcSlot) srcSlot.itemId = null;
              const emptySlot = backpack.slots.find((s: any) => s.itemId === null);
              if (emptySlot) emptySlot.itemId = itemId;
              playSlotSound();
              return { ...char, equipment, containers };
            }

            return char;
          }

          // V1 Compatibility Branch
          if (target.type === 'equip_slot' && target.slotId) {
            get().equipItem(item, target.slotId);
            return useCharacterStore.getState().characters.find(c => c.id === targetCharId) || char;
          }

          if (source.type === 'equip_slot' && source.slotId) {
            get().unequipItem(source.slotId);
            return useCharacterStore.getState().characters.find(c => c.id === targetCharId) || char;
          }

          return char;
        })
      });
    });
  },

  updatePartyStats: (stats) => set((state) => ({
    partyStats: { ...state.partyStats, ...stats }
  })),

  transferItem: ({ sourceId, targetId, itemId }) => {
    const state = get();
    import('./useCharacterStore').then(({ useCharacterStore }) => {
      const { characters } = useCharacterStore.getState();
      if (sourceId === targetId) return;

      let itemToMove: any = null;
      let newCharacters = [...characters];
      let newPartyInventory = [...state.partyInventory];

      if (sourceId === 'party') {
        itemToMove = newPartyInventory.find(i => i.id === itemId);
        newPartyInventory = newPartyInventory.filter(i => i.id !== itemId);
      } else {
        const charIndex = newCharacters.findIndex(c => c.id === sourceId);
        if (charIndex !== -1) {
          const char = newCharacters[charIndex];
          if (char.saveVersion === 2) {
            const itemInstance = { ...char.items?.[itemId] };
            if (itemInstance) {
              const equipment = { ...char.equipment! };
              const containers = { ...char.containers! };
              equipment.slots = equipment.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
              Object.values(containers).forEach(c => {
                c.slots = c.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
              });
              const newItems = { ...char.items };
              delete newItems[itemId];
              newCharacters[charIndex] = { ...char, equipment, containers, items: newItems };
              itemToMove = itemInstance;
            }
          } else {
            itemToMove = char.backpack.find(i => i.id === itemId);
            newCharacters[charIndex] = {
              ...char,
              backpack: char.backpack.filter(i => i.id !== itemId)
            };
          }
        }
      }

      if (!itemToMove) return;

      if (targetId === 'party') {
        const existingInTargetIndex = newPartyInventory.findIndex(i => (i.index && i.index === (itemToMove.index || itemToMove.template)) || (i.name === itemToMove.name));
        if (existingInTargetIndex > -1) {
          const existingItem = { ...newPartyInventory[existingInTargetIndex] };
          existingItem.quantity = (existingItem.quantity || 1) + (itemToMove.quantity || 1);
          newPartyInventory[existingInTargetIndex] = existingItem;
        } else {
          newPartyInventory.push(itemToMove);
        }
      } else {
        const charIndex = newCharacters.findIndex(c => c.id === targetId);
        if (charIndex !== -1) {
          const char = { ...newCharacters[charIndex] };
          if (char.saveVersion === 2) {
            const items = { ...(char.items || {}) };
            const containers = { ...(char.containers || {}) };
            const backpack = Object.values(containers).find(c => c.type === 'backpack');
            if (backpack) {
              const existingId = backpack.slots.find(s => s.itemId && items[s.itemId].template === (itemToMove.template || itemToMove.index))?.itemId;
              if (existingId) {
                items[existingId] = { ...items[existingId], quantity: (items[existingId].quantity || 1) + (itemToMove.quantity || 1) };
              } else {
                const newId = itemId.includes('_') ? itemId : `${itemToMove.template || itemToMove.index}_${crypto.randomUUID()}`;
                items[newId] = { ...itemToMove, id: newId, template: itemToMove.template || itemToMove.index, quantity: itemToMove.quantity || 1, addedAt: Date.now() };
                const slot = backpack.slots.find(s => s.itemId === null);
                if (slot) slot.itemId = newId;
              }
              char.items = items;
              char.containers = containers;
            }
          } else {
            const newBackpack = [...char.backpack];
            const existingInTargetIndex = newBackpack.findIndex(i => (i.index && i.index === (itemToMove.index || itemToMove.template)) || (i.name === itemToMove.name));
            if (existingInTargetIndex > -1) {
              const existingItem = { ...newBackpack[existingInTargetIndex] };
              existingItem.quantity = (existingItem.quantity || 1) + (itemToMove.quantity || 1);
              newBackpack[existingInTargetIndex] = existingItem;
            } else {
              newBackpack.push(itemToMove);
            }
            char.backpack = newBackpack;
          }
          newCharacters[charIndex] = char;
        }
      }
      set({ partyInventory: newPartyInventory });
      useCharacterStore.setState({ characters: newCharacters });
    });
  },

  addToPartyInventory: (item) => set((state) => {
    const newInventory = [...state.partyInventory];
    const existingIndex = newInventory.findIndex(i => (i.index && i.index === item.index) || (i.name === item.name));
    if (existingIndex > -1) {
      const existingItem = { ...newInventory[existingIndex] };
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      newInventory[existingIndex] = existingItem;
    } else {
      newInventory.push({ ...item, id: crypto.randomUUID(), quantity: item.quantity || 1 });
    }
    return { partyInventory: newInventory };
  }),

  removeFromPartyInventory: (itemId) => set((state) => ({
    partyInventory: state.partyInventory.filter(i => i.id !== itemId)
  })),

  addVehicle: (vehicle) => set((state) => ({
    partyVehicles: [...state.partyVehicles, { ...vehicle, id: crypto.randomUUID() }]
  })),

  removeVehicle: (index) => set((state) => ({
    partyVehicles: state.partyVehicles.filter((_, i) => i !== index)
  })),
}));
