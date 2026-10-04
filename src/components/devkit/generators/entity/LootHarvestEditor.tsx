import React from 'react';
import { GameIcon } from '../../../../game_icons';

interface LootHarvestEditorProps {
  editingItem: any;
  updateField: (field: string, value: any) => void;
  playClickSound: () => void;
}

export const LootHarvestEditor: React.FC<LootHarvestEditorProps> = ({
  editingItem,
  updateField,
  playClickSound,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
      {/* Monster Parts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <GameIcon name="magic_effect" size={12} color="currentColor" /> HARVEST_NODES
          </label>
          <button
            onClick={() => {
              const current = editingItem.item_drops || [];
              updateField('item_drops', [...current, { name: 'New Part', rarity: 'Common', quantity: '1', type: 'material' }]);
            }}
            className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/10 hover:bg-dragon-red hover:text-white transition-all uppercase font-bold"
            title="Add Harvest Node"
          >
            + Add Node
          </button>
        </div>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          {editingItem.item_drops?.filter((d: any) => d.type === 'material').map((drop: any, i: number) => (
            <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group/drop">
              <input
                type="text"
                list="materials-datalist"
                title="Harvest Node Name"
                value={drop.name}
                onChange={(e) => {
                  const newDrops = [...(editingItem.item_drops || [])];
                  const realIdx = newDrops.indexOf(drop);
                  newDrops[realIdx] = { ...drop, name: e.target.value };
                  updateField('item_drops', newDrops);
                }}
                className="flex-1 bg-transparent border-none text-[11px] text-white/80 p-0 focus:outline-none font-bold"
                placeholder="Component identifier..."
              />
              <input
                type="text"
                title="Harvest Node Quantity"
                value={drop.quantity}
                onChange={(e) => {
                  const newDrops = [...(editingItem.item_drops || [])];
                  const realIdx = newDrops.indexOf(drop);
                  newDrops[realIdx] = { ...drop, quantity: e.target.value };
                  updateField('item_drops', newDrops);
                }}
                className="w-12 bg-black/20 border border-white/10 text-[10px] text-white/40 p-1 rounded text-center"
                placeholder="QTY"
              />
              <button
                onClick={() => {
                  const newDrops = (editingItem.item_drops || []).filter((d: any) => d !== drop);
                  updateField('item_drops', newDrops);
                }}
                className="text-white/20 hover:text-dragon-red opacity-0 group-hover/drop:opacity-100 transition-all"
                title="Delete Harvest Node"
              >
                <GameIcon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Loot Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <GameIcon name="coins" size={12} color="currentColor" /> LOOT_RESOURCES
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const current = editingItem.item_drops || [];
                updateField('item_drops', [...current, { name: 'gp', rarity: 'Common', quantity: '1d10', type: 'currency' }]);
                playClickSound();
              }}
              className="text-[9px] bg-yellow-600/10 text-yellow-600/60 px-2 py-0.5 rounded border border-yellow-600/20 hover:bg-yellow-600 hover:text-white transition-all uppercase font-bold"
              title="Add Gold Pieces to Loot"
            >
              + GP
            </button>
            <button
              onClick={() => {
                const current = editingItem.item_drops || [];
                updateField('item_drops', [...current, { name: 'New Item', rarity: 'Common', quantity: '1', type: 'equipment' }]);
                playClickSound();
              }}
              className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/10 hover:bg-dragon-red hover:text-white transition-all uppercase font-bold"
              title="Add Item to Loot"
            >
              + Add Item
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          {editingItem.item_drops?.filter((d: any) => d.type !== 'material').map((drop: any, i: number) => (
            <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group/drop">
              <select
                title="Loot Type Select"
                value={drop.type || 'currency'}
                onChange={(e) => {
                  const newDrops = [...(editingItem.item_drops || [])];
                  const realIdx = newDrops.indexOf(drop);
                  newDrops[realIdx] = { ...drop, type: e.target.value as any };
                  updateField('item_drops', newDrops);
                }}
                className="bg-black/20 border border-white/10 text-[9px] text-white/40 p-1 rounded focus:outline-none"
              >
                <option value="currency">CUR</option>
                <option value="equipment">EQP</option>
              </select>
              <input
                type="text"
                list={drop.type === 'equipment' ? 'equipment-datalist' : undefined}
                title="Loot Item Name"
                value={drop.name}
                onChange={(e) => {
                  const newDrops = [...(editingItem.item_drops || [])];
                  const realIdx = newDrops.indexOf(drop);
                  newDrops[realIdx] = { ...drop, name: e.target.value };
                  updateField('item_drops', newDrops);
                }}
                className="flex-1 bg-transparent border-none text-[11px] text-white/80 p-0 focus:outline-none font-bold"
                placeholder="Asset SKU..."
              />
              <input
                type="text"
                title="Loot Quantity"
                value={drop.quantity}
                onChange={(e) => {
                  const newDrops = [...(editingItem.item_drops || [])];
                  const realIdx = newDrops.indexOf(drop);
                  newDrops[realIdx] = { ...drop, quantity: e.target.value };
                  updateField('item_drops', newDrops);
                }}
                className="w-12 bg-black/20 border border-white/10 text-[10px] text-white/40 p-1 rounded text-center"
                placeholder="QTY"
              />
              <button
                onClick={() => {
                  const newDrops = (editingItem.item_drops || []).filter((d: any) => d !== drop);
                  updateField('item_drops', newDrops);
                }}
                className="text-white/20 hover:text-dragon-red opacity-0 group-hover/drop:opacity-100 transition-all"
                title="Delete Loot Item"
              >
                <GameIcon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
