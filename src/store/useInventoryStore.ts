import { create } from 'zustand';
import { getPackContents } from '../lib/itemPacks';
import { playSlotSound } from '../services/storageService';

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
    // Note: Needs access to useCharacterStore to find activeCharacterId
    // For now we'll rely on the caller to provide it or use a cross-store pattern
    // Alternatively, we can use useCharacterStore.getState()
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
          return { ...char, backpack: char.backpack.filter((_, i) => i === indexOrItemId ? false : true) };
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
          const itemId = typeof itemOrItemId === 'string' ? itemOrItemId : itemOrItemId.id;
          const equipment = { ...char.equipment! };
          const containers = { ...char.containers! };
          const backpack = Object.values(containers).find(c => c.type === 'backpack')!;
          
          const targetSlot = equipment.slots.find(s => s.id === slotId);
          if (!targetSlot) return char;

          if (targetSlot.itemId) {
            const emptyBagSlot = backpack.slots.find(s => s.itemId === null);
            if (emptyBagSlot) emptyBagSlot.itemId = targetSlot.itemId;
          }

          backpack.slots = backpack.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
          targetSlot.itemId = itemId;
          playSlotSound();
          return { ...char, equipment, containers };
        }

        const item = itemOrItemId;
        let newBackpack = char.backpack.filter(i => i.id !== item.id);
        const newInventory = { ...char.inventory };
        const itemSlots = Array.isArray(item.slot) ? item.slot : [slotId];
        
        itemSlots.forEach(s => {
          const existingItem = newInventory[s];
          if (existingItem) {
            const existingSlots = Array.isArray(existingItem.slot) ? existingItem.slot : [s];
            existingSlots.forEach(es => delete newInventory[es]);
            if (!newBackpack.find(i => i.id === existingItem.id)) {
              newBackpack.push(existingItem);
            }
          }
        });

        itemSlots.forEach(s => {
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
        itemSlots.forEach(s => delete newInventory[s]);
        return { ...char, inventory: newInventory, backpack: [...char.backpack, item] };
      });
      useCharacterStore.setState({ characters: newCharacters });
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
