import React, { useEffect, useState } from 'react';
import { useStore, ExplorerTab } from '../../store/useStore';
import { GameIcon, GameIconName } from '../../game_icons';
import { cn } from '../../lib/utils';
import { playClickSound } from '../../services/storageService';
import { MonsterCard } from '../atlas/MonsterCard';
import { MaterialCard } from '../atlas/MaterialCard';
import { EquipmentCard } from '../atlas/EquipmentCard';
import { SpellCard } from '../atlas/SpellCard';

export const AssetExplorer: React.FC = () => {
  const {
    explorerTab, setExplorerTab,
    monsterCategories, materialCategories, equipmentCategories, transportList, spellsList, spellCategories, keyItemsList, booksList,
    isLoadingList, loadList,
    searchQuery, setSearchQuery,
    selectedItem, selectItem
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadList();
  }, [explorerTab]);

  const itemList = explorerTab === 'enemies' 
    ? (selectedCategory ? monsterCategories.find(c => c.index === selectedCategory)?.monsters || [] : monsterCategories)
    : explorerTab === 'materials' 
    ? (selectedCategory ? materialCategories.find(c => c.index === selectedCategory)?.materials || [] : materialCategories)
    : explorerTab === 'equipment'
    ? (selectedCategory ? equipmentCategories.find(c => c.index === selectedCategory)?.equipment || [] : equipmentCategories)
    : explorerTab === 'transport' ? transportList
    : explorerTab === 'spells' ? (selectedCategory ? spellCategories.find(c => c.index === selectedCategory)?.spells || [] : spellCategories)
    : explorerTab === 'key' ? keyItemsList : booksList;

  const filteredList = itemList.filter((m: any) => {
    if (!searchQuery) return true;
    const name = (m.name || m.index || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full bg-[#111] text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-dragon-red">Registry_Explorer</h2>
        </div>
        <div className="flex flex-wrap p-2 gap-1 border-b border-white/10">
          {[
            { id: 'enemies', icon: 'bestiary' },
            { id: 'materials', icon: 'materials' },
            { id: 'spells', icon: 'spells' },
            { id: 'equipment', icon: 'package' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setExplorerTab(tab.id as ExplorerTab);
                setSelectedCategory(null);
                playClickSound();
              }}
              className={cn(
                "p-2 rounded transition-all",
                explorerTab === tab.id ? "bg-dragon-red text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              <GameIcon name={tab.icon as GameIconName} size={16} />
            </button>
          ))}
        </div>
        <div className="p-3">
            <input 
              type="text"
              placeholder="Filter assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-dragon-red"
            />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoadingList ? (
            <div className="flex justify-center p-8 opacity-20"><GameIcon name="refresh" className="animate-spin" /></div>
          ) : (
            filteredList.map((item: any, idx: number) => (
              <button
                key={`${item.index}-${idx}`}
                onClick={() => {
                   if (!selectedCategory && (explorerTab === 'enemies' || explorerTab === 'materials' || explorerTab === 'equipment' || explorerTab === 'spells')) {
                     setSelectedCategory(item.index);
                   } else {
                     selectItem(item.index);
                   }
                   playClickSound();
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                  selectedItem?.index === item.index ? "bg-dragon-red text-white" : "hover:bg-white/10 text-white/40"
                )}
              >
                {item.name || item.index}
              </button>
            ))
          )}
          {selectedCategory && (
            <button 
                onClick={() => setSelectedCategory(null)}
                className="w-full mt-4 p-2 text-[9px] font-black uppercase text-center border border-white/10 hover:bg-white/5 text-white/40"
            >
                [BACK_TO_CATEGORIES]
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#0a0a0a]">
        <div className="max-w-md w-full scale-110 origin-top">
          {selectedItem ? (
             <div className="space-y-8">
               <div className="bg-dragon-red/10 border border-dragon-red/30 p-2 rounded text-center">
                 <span className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Asset_Manifest_Valid</span>
               </div>
               
               {explorerTab === 'enemies' && <MonsterCard monster={selectedItem} />}
               {explorerTab === 'materials' && <MaterialCard material={selectedItem} />}
               {explorerTab === 'equipment' && <EquipmentCard equipment={selectedItem} />}
               {explorerTab === 'spells' && <SpellCard spell={selectedItem} />}

               <div className="text-[9px] font-mono text-white/20 text-center uppercase tracking-widest">
                 Index: {selectedItem.index} | Last_Sync: {selectedItem.last_updated || 'Unknown'}
               </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
              <GameIcon name="save_data" size={128} />
              <p className="text-sm font-black uppercase tracking-[0.5em]">No_Asset_Selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
