import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../src/store/useUIStore';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useInventoryStore } from '../src/store/useInventoryStore';
import {
  getAvailableItemActions,
  validateItemStillExists,
  ActionMenuItem
} from '../src/components/character/inventory/InventoryItemActionMenu';

describe('Inventory Item Action Menu v1 — Unit & Integration Tests', () => {
  beforeEach(() => {
    useUIStore.setState({
      itemActionMenu: null,
      inspectingItem: null
    });
    useInventoryStore.setState({
      partyInventory: [
        { id: 'party-potion-1', name: 'Health Potion', kind: 'consumable', quantity: 3 }
      ]
    });
    useCharacterStore.setState({
      activeCharacterId: 'char-1',
      characters: [
        {
          id: 'char-1',
          name: 'Hero Fighter',
          saveVersion: 1,
          backpack: [
            { id: 'item-longsword-1', name: 'Longsword', kind: 'weapon', _type: 'equipment', slot: 'main_hand' },
            { id: 'item-ration-1', name: 'Rations', kind: 'consumable' }
          ],
          inventory: {
            main_hand: { id: 'item-equipped-sword-1', name: 'Equipped Sword', kind: 'weapon', _type: 'equipment', slot: 'main_hand' }
          }
        },
        {
          id: 'char-2',
          name: 'Mage Companion',
          saveVersion: 1,
          backpack: [],
          inventory: {}
        }
      ]
    });
  });

  describe('UI Store Action Menu State', () => {
    it('sets and clears active item action menu state', () => {
      const item = { id: 'item-longsword-1', name: 'Longsword' };
      useUIStore.getState().setItemActionMenu({
        item,
        sourceId: 'char-1',
        position: { x: 100, y: 200 }
      });

      const state = useUIStore.getState().itemActionMenu;
      expect(state).not.toBeNull();
      expect(state?.item.id).toBe('item-longsword-1');
      expect(state?.position).toEqual({ x: 100, y: 200 });

      useUIStore.getState().setItemActionMenu(null);
      expect(useUIStore.getState().itemActionMenu).toBeNull();
    });

    it('ensures only one contextual action menu is active at a time', () => {
      const item1 = { id: 'item-1', name: 'First Item' };
      const item2 = { id: 'item-2', name: 'Second Item' };

      useUIStore.getState().setItemActionMenu({
        item: item1,
        sourceId: 'char-1',
        position: { x: 50, y: 50 }
      });

      useUIStore.getState().setItemActionMenu({
        item: item2,
        sourceId: 'char-2',
        position: { x: 300, y: 400 }
      });

      const activeMenu = useUIStore.getState().itemActionMenu;
      expect(activeMenu?.item.id).toBe('item-2');
      expect(activeMenu?.position).toEqual({ x: 300, y: 400 });
    });
  });

  describe('Item Availability & Action Determination Model', () => {
    it('exposes Equip action for unequipped equippable items', () => {
      const unequippedSword = { id: 'item-longsword-1', name: 'Longsword', kind: 'weapon', _type: 'equipment' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      const actions = getAvailableItemActions(
        unequippedSword,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const actionIds = actions.map(a => a.id);
      expect(actionIds).toContain('equip');
      expect(actionIds).not.toContain('unequip');
      expect(actionIds).toContain('inspect');
      expect(actionIds).toContain('send_to');
      expect(actionIds).toContain('drop');
    });

    it('exposes Unequip action for currently equipped items', () => {
      const equippedSword = { id: 'item-equipped-sword-1', name: 'Equipped Sword', kind: 'weapon' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      const actions = getAvailableItemActions(
        equippedSword,
        'char-1',
        'main_hand',
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const actionIds = actions.map(a => a.id);
      expect(actionIds).toContain('unequip');
      expect(actionIds).not.toContain('equip');
    });

    it('does not expose Equip/Unequip for non-equippable items', () => {
      const ration = { id: 'item-ration-1', name: 'Rations', kind: 'consumable', _type: 'consumable' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      const actions = getAvailableItemActions(
        ration,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const actionIds = actions.map(a => a.id);
      expect(actionIds).not.toContain('equip');
      expect(actionIds).not.toContain('unequip');
      expect(actionIds).toContain('inspect');
      expect(actionIds).toContain('drop');
    });

    it('marks Drop action as destructive', () => {
      const item = { id: 'item-ration-1', name: 'Rations' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      const actions = getAvailableItemActions(
        item,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const dropAction = actions.find(a => a.id === 'drop');
      expect(dropAction).toBeDefined();
      expect(dropAction?.destructive).toBe(true);
    });

    it('filters valid Send To destinations dynamically', () => {
      const item = { id: 'item-ration-1', name: 'Rations' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      const actionsForChar1 = getAvailableItemActions(
        item,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const sendToActionChar1 = actionsForChar1.find(a => a.id === 'send_to');
      expect(sendToActionChar1).toBeDefined();
      expect(sendToActionChar1?.submenuItems).toEqual([
        { id: 'party', label: 'Shared Armory', icon: 'package' },
        { id: 'char-2', label: 'Mage Companion', icon: 'user' }
      ]);

      const actionsForParty = getAvailableItemActions(
        item,
        'party',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const sendToActionParty = actionsForParty.find(a => a.id === 'send_to');
      expect(sendToActionParty?.submenuItems).toEqual([
        { id: 'char-1', label: 'Hero Fighter', icon: 'user' },
        { id: 'char-2', label: 'Mage Companion', icon: 'user' }
      ]);
    });
  });

  describe('Stale Reference Validation', () => {
    it('validates existing items in character backpack', () => {
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;
      const item = { id: 'item-longsword-1' };

      const exists = validateItemStillExists(item, 'char-1', undefined, characters, partyInv);
      expect(exists).toBe(true);
    });

    it('validates existing items in equipped slot', () => {
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;
      const item = { id: 'item-equipped-sword-1' };

      const exists = validateItemStillExists(item, 'char-1', 'main_hand', characters, partyInv);
      expect(exists).toBe(true);
    });

    it('detects missing/stale item references cleanly', () => {
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;
      const staleItem = { id: 'deleted-item-999' };

      const existsInChar = validateItemStillExists(staleItem, 'char-1', undefined, characters, partyInv);
      const existsInParty = validateItemStillExists(staleItem, 'party', undefined, characters, partyInv);

      expect(existsInChar).toBe(false);
      expect(existsInParty).toBe(false);
    });
  });

  describe('Canonical Action Routing', () => {
    it('routes Inspect action to setInspectingItem in useUIStore', () => {
      const item = { id: 'item-longsword-1', name: 'Longsword' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      let inspectCalled = false;
      const actions = getAvailableItemActions(
        item,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {
            useUIStore.getState().setInspectingItem({
              item,
              sourceId: 'char-1',
              itemId: item.id
            });
            inspectCalled = true;
          },
          onDrop: () => {},
          onSendTo: () => {}
        }
      );

      const inspectAction = actions.find(a => a.id === 'inspect');
      inspectAction?.handler();

      expect(inspectCalled).toBe(true);
      expect(useUIStore.getState().inspectingItem?.item.id).toBe('item-longsword-1');
    });

    it('routes Send To action to transferItem in useInventoryStore', async () => {
      const item = { id: 'item-longsword-1', name: 'Longsword' };
      const characters = useCharacterStore.getState().characters;
      const partyInv = useInventoryStore.getState().partyInventory;

      let transferredTarget: string | undefined;
      const actions = getAvailableItemActions(
        item,
        'char-1',
        undefined,
        characters,
        partyInv,
        {
          onEquip: () => {},
          onUnequip: () => {},
          onInspect: () => {},
          onDrop: () => {},
          onSendTo: (targetId) => {
            transferredTarget = targetId;
            useInventoryStore.getState().transferItem({
              sourceId: 'char-1',
              targetId,
              itemId: item.id
            });
          }
        }
      );

      const sendToAction = actions.find(a => a.id === 'send_to');
      sendToAction?.handler('char-2');

      expect(transferredTarget).toBe('char-2');

      // Wait for async transferItem import resolution
      await new Promise(r => setTimeout(r, 20));

      const updatedChars = useCharacterStore.getState().characters;
      const char2Backpack = updatedChars.find(c => c.id === 'char-2')?.backpack;
      expect(char2Backpack.some(i => i.id === 'item-longsword-1')).toBe(true);
    });
  });
});
