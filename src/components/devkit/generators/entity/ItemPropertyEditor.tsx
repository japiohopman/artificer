import React from 'react';
import { GameIcon } from '../../../../game_icons';
import { BACKGROUND_CONFIGS } from '../../../../lib/backgroundConfigs';

interface ItemPropertyEditorProps {
  activeGenerator: 'monsters' | 'materials' | 'equipment';
  editingItem: any;
  setEditingItem: (item: any) => void;
  updateField: (field: string, value: any) => void;
  selectedMonsterCategory: string;
  setSelectedMonsterCategory: (cat: string) => void;
  equipmentCategories: string[];
  materialCategories: string[];
  generateDescription: () => void;
  formatCost: (cost: any) => string;
  parseCost: (val: string) => any;
}

export const ItemPropertyEditor: React.FC<ItemPropertyEditorProps> = ({
  activeGenerator,
  editingItem,
  setEditingItem,
  updateField,
  selectedMonsterCategory,
  setSelectedMonsterCategory,
  equipmentCategories,
  materialCategories,
  generateDescription,
  formatCost,
  parseCost,
}) => {
  const backgroundTypes = BACKGROUND_CONFIGS;

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset Rarity</label>
          <select
            title="Asset Rarity Select"
            value={editingItem.rarity || 'Common'}
            onChange={(e) => updateField('rarity', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors cursor-pointer"
          >
            {['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'].map(r => (
              <option key={r} value={r} className="bg-[#1a1a1a]">{r}</option>
            ))}
          </select>
        </div>

        {activeGenerator === 'monsters' && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Target Category</label>
            <select
              title="Target Monster Category Select"
              value={selectedMonsterCategory}
              onChange={(e) => setSelectedMonsterCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors cursor-pointer"
            >
              {['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead', 'misc'].map(cat => (
                <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        )}

        {activeGenerator !== 'monsters' && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset_Tier [0-3]</label>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(t => {
                const index = editingItem.index || '';
                return (
                  <button
                    key={t}
                    title={t === 0 ? 'Base Tier' : `Tier ${t}`}
                    onClick={() => {
                      const baseIndex = index.replace(/_\d$/, '');
                      const newIndex = t === 0 ? baseIndex : `${baseIndex}_${t}`;
                      const newRarity = t === 0 ? 'Common' : t === 1 ? 'Uncommon' : t === 2 ? 'Rare' : 'Very Rare';

                      let newName = editingItem.name || '';
                      newName = newName.replace(/, \+\d$/, '');
                      if (t > 0) newName = `${newName}, +${t}`;

                      setEditingItem({
                        ...editingItem,
                        index: newIndex,
                        name: newName,
                        rarity: newRarity
                      });
                    }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                      (index.endsWith(`_${t}`) || (t === 0 && !index.match(/_\d$/)))
                        ? 'bg-dragon-red border-dragon-red text-white'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {t === 0 ? 'BASE' : `T_${t}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeGenerator === 'monsters' && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">XP_VALUE</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
              <input
                type="number"
                title="XP Value"
                value={editingItem.xp || 0}
                onChange={(e) => updateField('xp', parseInt(e.target.value) || 0)}
                className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
              />
              <div className="px-2 text-[9px] text-white/20 font-bold border-l border-white/10 uppercase">PTS</div>
            </div>
          </div>
        )}

        {activeGenerator !== 'monsters' && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Material_Cost</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
              <input
                type="text"
                title="Material Cost"
                value={formatCost(editingItem.cost)}
                onChange={(e) => updateField('cost', parseCost(e.target.value))}
                className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
                placeholder="e.g. 10 gp"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Habitat Map</label>
          <select
            title="Habitat Map Select"
            value={editingItem.background_type || 'land_forest'}
            onChange={(e) => updateField('background_type', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all cursor-pointer"
          >
            {backgroundTypes.flatMap(b => [
              <option key={b.id} value={b.id} className="bg-[#1a1a1a]">{b.label} [MAIN]</option>,
              ...[1, 2, 3, 4].map(v => (
                <option key={`${b.id}${v}`} value={`${b.id}${v}`} className="bg-[#1a1a1a]">{b.label} [V_{v}]</option>
              ))
            ])}
          </select>
        </div>
      </div>

      {activeGenerator !== 'monsters' && (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">ITEM_WEIGHT</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
                  <input
                    type="text"
                    title="Item Weight"
                    value={editingItem.weight || ''}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
                    placeholder="e.g. 1 lb."
                  />
                  <div className="px-2 text-[9px] text-white/20 font-bold border-l border-white/10 uppercase">LBS</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset Group</label>
                <select
                  title="Asset Group Select"
                  value={editingItem.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors"
                >
                  <option value="" className="bg-[#1a1a1a]">UNASSIGNED</option>
                  {(activeGenerator === 'equipment' ? equipmentCategories : materialCategories).map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeGenerator === 'equipment' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Socket_Slots</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateField('slot', ['main-hand', 'off-hand'])}
                      className="text-[8px] text-dragon-red hover:text-red-400 font-bold uppercase transition-colors"
                      title="Set as 2-Handed Slot"
                    >
                      [SET_2H]
                    </button>
                    <button
                      onClick={() => updateField('slot', ['main-hand'])}
                      className="text-[8px] text-dragon-red hover:text-red-400 font-bold uppercase transition-colors"
                      title="Set as 1-Handed Slot"
                    >
                      [SET_1H]
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 border border-white/5 rounded min-h-[80px]">
                  {[
                    'head', 'neck', 'chest', 'back', 'waist',
                    'main-hand', 'off-hand', 'hands', 'legs', 'feet',
                    'ring-1', 'ring-2', 'focus', 'tool', 'extra', 'ammo'
                  ].map(slot => {
                    const currentSlots = Array.isArray(editingItem.slot) ? editingItem.slot : (editingItem.slot ? [editingItem.slot] : []);
                    const isSelected = currentSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        title={`Toggle ${slot.replace('-', '_')} slot`}
                        onClick={() => {
                          const newSlots = isSelected
                            ? currentSlots.filter((s: string) => s !== slot)
                            : [...currentSlots, slot];
                          updateField('slot', newSlots);
                        }}
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all border ${
                          isSelected
                            ? 'bg-dragon-red/20 border-dragon-red text-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.2)]'
                            : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                        }`}
                      >
                        {slot.replace('-', '_')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Lore_Description</label>
              <button
                onClick={generateDescription}
                className="text-[9px] text-dragon-red flex items-center gap-1 hover:text-red-400 font-bold uppercase"
                title="Execute AI Lore Generation"
              >
                <GameIcon name="identity" size={10} color="currentColor" /> Execute_Gen
              </button>
            </div>
            <textarea
              value={Array.isArray(editingItem.desc) ? editingItem.desc.join('\n') : (editingItem.desc || '')}
              onChange={(e) => updateField('desc', e.target.value.split('\n'))}
              className="flex-1 min-h-[120px] bg-white/5 border border-white/10 p-3 text-[11px] text-white/70 rounded focus:outline-none focus:border-dragon-red/50 transition-colors font-sans leading-relaxed resize-none custom-scrollbar"
              placeholder="// Enter metadata description..."
              title="Lore Description Textarea"
            />
          </div>
        </div>
      )}
    </>
  );
};
