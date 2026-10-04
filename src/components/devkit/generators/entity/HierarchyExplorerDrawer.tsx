import React from 'react';
import { GameIcon } from '../../../../game_icons';

interface HierarchyExplorerDrawerProps {
  activeGenerator: 'monsters' | 'materials' | 'equipment';
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  editingItem: any | null;
  setEditingItem: (item: any) => void;
  monstersList: any[];
  materialsList: any[];
  equipmentList: any[];
  storeMaterialCategories: any[];
  storeEquipmentCategories: any[];
  loadAllLists: () => void;
  itemDataMap: Record<string, any>;
  setItemDataMap: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  runChecks: (item: any) => void;
  tierStatuses: any[];
  checklist: Record<string, boolean>;
  handleSave: () => void;
  scrapeWiki: () => void;
  generateDescription: () => void;
  generatePrompt: () => void;
  safeString: (val: any) => string;
}

export const HierarchyExplorerDrawer: React.FC<HierarchyExplorerDrawerProps> = ({
  activeGenerator,
  selectedCategory,
  setSelectedCategory,
  editingItem,
  setEditingItem,
  monstersList,
  materialsList,
  equipmentList,
  storeMaterialCategories,
  storeEquipmentCategories,
  loadAllLists,
  itemDataMap,
  setItemDataMap,
  runChecks,
  tierStatuses,
  checklist,
  handleSave,
  scrapeWiki,
  generateDescription,
  generatePrompt,
  safeString,
}) => {
  return (
    <div className="w-64 border-r border-white/5 flex flex-col bg-[#1e1e1e]">
      <div className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-between">
        <span>Hierarchy Explorer</span>
        <GameIcon
          name="refresh"
          size={12}
          color="currentColor"
          className="hover:rotate-180 transition-transform cursor-pointer"
          onClick={loadAllLists}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Item Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {(activeGenerator === 'equipment' || activeGenerator === 'materials') && selectedCategory ? 'Current Scope' : 'Root Selection'}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const skeleton = {
                    name: 'New Entity',
                    index: 'new-entity',
                    size: 'Medium',
                    type: activeGenerator === 'monsters' ? 'Humanoid' : 'Misc',
                    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                    rarity: 'Common',
                    challenge_rating: '1',
                    actions: [],
                    special_abilities: []
                  };
                  setEditingItem(skeleton);
                }}
                className="p-1 px-2 bg-dragon-red/10 border border-dragon-red/30 rounded text-[9px] font-bold text-dragon-red hover:bg-dragon-red hover:text-white transition-all uppercase tracking-tighter"
                title="Create New Entity Manifestation"
                aria-label="Create New Entity Manifestation"
              >
                + NEW
              </button>
              {(activeGenerator === 'equipment' || activeGenerator === 'materials') && selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[9px] font-bold text-dragon-red uppercase tracking-widest hover:text-white transition-colors"
                  title="Go back to categories"
                >
                  ../back
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/5 rounded overflow-hidden">
              {(activeGenerator === 'monsters' ? monstersList :
                activeGenerator === 'materials' && !selectedCategory ? storeMaterialCategories :
                activeGenerator === 'materials' && selectedCategory ? (storeMaterialCategories.find(c => c.index === selectedCategory)?.materials || []) :
                activeGenerator === 'equipment' && !selectedCategory ? storeEquipmentCategories :
                activeGenerator === 'equipment' && selectedCategory ? (storeEquipmentCategories.find(c => c.index === selectedCategory)?.equipment || []) :
                []).map((mOrIndex: any, i: number) => {
                  let m = mOrIndex;
                  if (typeof mOrIndex === 'string') {
                    if (activeGenerator === 'equipment') {
                      m = equipmentList.find(e => e.index === mOrIndex) || { index: mOrIndex, name: mOrIndex };
                    } else if (activeGenerator === 'materials') {
                      m = materialsList.find(e => e.index === mOrIndex) || { index: mOrIndex, name: mOrIndex };
                    }
                  }

                  const isSelected = editingItem?.index === m.index || (editingItem?.index?.startsWith(m.index + '_'));

                  return (
                  <button
                    key={`${m.index}-${i}`}
                    title={safeString(m.name)}
                    onClick={async () => {
                      if ((activeGenerator === 'equipment' || activeGenerator === 'materials') && !selectedCategory) {
                        setSelectedCategory(m.index);
                        return;
                      }

                      let data = itemDataMap[m.index];
                      if (!data) {
                        const { fetchMonsterData, fetchMaterialData, fetchEquipmentData, useAtlasStore } = await import('../../../../services/storageService').then(s => ({
                          fetchMonsterData: s.fetchMonsterData,
                          fetchMaterialData: s.fetchMaterialData,
                          fetchEquipmentData: s.fetchEquipmentData,
                          useAtlasStore: import('../../../../store/useAtlasStore').then(a => a.useAtlasStore)
                        }));

                        if (activeGenerator === 'monsters') data = await fetchMonsterData(m.index);
                        else if (activeGenerator === 'materials') data = await fetchMaterialData(m.index);
                        else if (activeGenerator === 'equipment') data = await fetchEquipmentData(m.index);

                        if (data) {
                          const atlasStore = (await useAtlasStore)();
                          if (activeGenerator === 'equipment' && !data.category) {
                            const mapping = atlasStore.equipmentCategoryMapping;
                            if (mapping[m.index]) data.category = mapping[m.index];
                          }
                          if (activeGenerator === 'materials' && !data.category) {
                            const mapping = atlasStore.materialCategoryMapping;
                            if (mapping[m.index]) data.category = mapping[m.index];
                          }
                          setItemDataMap(prev => ({ ...prev, [m.index]: data }));
                        }
                      }

                      if (data) {
                        const itemWithDefaults = {
                          ...data,
                          background_type: data.background_type || 'land_forest',
                          versions: m.versions
                        };
                        setEditingItem(itemWithDefaults);
                        runChecks(itemWithDefaults);
                      }
                    }}
                    className={`text-left px-3 py-1.5 transition-all flex items-center gap-2 group ${
                      isSelected
                        ? 'bg-dragon-red/20 text-white'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                      <GameIcon name="save_data" size={10} color={isSelected ? "#8B0000" : "currentColor"} className={isSelected ? '' : 'opacity-30'} />
                      <span className="truncate text-[10px] font-bold uppercase">{safeString(m.name)}</span>
                      {m.versions && Object.keys(m.versions).length > 1 && (
                        <span className="text-[8px] bg-dragon-red/10 text-dragon-red px-1 rounded border border-dragon-red/10 shrink-0">
                          {Object.keys(m.versions).length}_V
                        </span>
                      )}
                    </div>
                    {(activeGenerator === 'equipment' || activeGenerator === 'materials') && !selectedCategory && (
                      <span className="text-[9px] opacity-40 ml-auto">{m.totalAssets || (m.equipment?.length || m.materials?.length || 0)}</span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

      {/* Operational Status / Checklist */}
      <div className="p-3 border-t border-white/5 bg-black/20 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Operational Integrity</div>
          {tierStatuses.length > 0 && (
            <div className="flex gap-1.5">
              {tierStatuses.map(s => (
                <button
                  key={s.tier}
                  onClick={async () => {
                    let data = itemDataMap[s.index];
                    if (!data) {
                      const { fetchEquipmentData, fetchMagicItemData } = await import('../../../../services/storageService');
                      data = await fetchEquipmentData(s.index);
                      if (!data) data = await fetchMagicItemData(s.index);
                      if (data) setItemDataMap(prev => ({ ...prev, [s.index]: data }));
                    }
                    if (data) {
                      setEditingItem({ ...data, background_type: data.background_type || 'land_forest', versions: editingItem.versions });
                      runChecks({ ...data, versions: editingItem.versions });
                    }
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all border ${
                    s.imageGenerated
                      ? 'bg-green-500 border-green-400/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  } ${editingItem?.index === s.index ? 'ring-2 ring-dragon-red ring-offset-1 ring-offset-[#1a1a1a] scale-110' : ''}`}
                  title={`${s.name} ${s.imageGenerated ? '[IMAGE_OK]' : '[IMAGE_MISSING]'}`}
                  aria-label={`${s.name} ${s.imageGenerated ? '[IMAGE_OK]' : '[IMAGE_MISSING]'}`}
                />
              ))}
            </div>
          )}
        </div>
        {[
          { key: 'jsonExists', label: 'FS_JSON', id: 1 },
          { key: 'wikiExists', label: 'MD_WIKI', id: 2 },
          { key: 'promptReady', label: 'AI_PRMPT', id: 3 },
          { key: 'imageGenerated', label: 'GEN_IMG', id: 4 },
          { key: 'bgReady', label: 'BG_STAT', id: 5 },
          { key: 'isMissingAsset', label: 'MISSING', id: 6 }
        ].map(step => (
          <div key={step.id} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${checklist[step.key as keyof typeof checklist] ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
              <span className={`${checklist[step.key as keyof typeof checklist] ? 'text-white/80' : 'text-white/20'}`}>{step.label}</span>
            </div>
            {step.key === 'isMissingAsset' ? (
              checklist[step.key as keyof typeof checklist] ? (
                <span className="text-dragon-red font-bold animate-pulse">[MISSING]</span>
              ) : (
                <span className="text-green-500 font-bold">[OK]</span>
              )
            ) : checklist[step.key as keyof typeof checklist] ? (
              <span className="text-green-500 font-bold">[OK]</span>
            ) : (
              <span className="text-dragon-red animate-pulse cursor-pointer hover:underline" onClick={step.key === 'jsonExists' ? handleSave : step.key === 'wikiExists' ? (activeGenerator === 'monsters' ? scrapeWiki : generateDescription) : step.key === 'promptReady' ? generatePrompt : undefined}>[FIX]</span>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
