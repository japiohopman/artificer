import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { useAtlasStore, ExplorerTab } from '../../store/useAtlasStore';
import { useWorldStore, SavedLocation } from '../../store/useWorldStore';
import { useGameStore } from '../../store/useGameStore';
import { GameIcon, GameIconName } from '../../game_icons';
import { cn } from '../../lib/utils';
import { playClickSound } from '../../services/storageService';
import { REGION_METADATA, REGION_PATH_REGISTRY } from '../../data/regions';
import { searchExplorerItems, ExplorerDomain, ExplorerItem } from '../../domain/explorer/explorerSearch';

import { MonsterCard } from '../atlas/MonsterCard';
import { MaterialCard } from '../atlas/MaterialCard';
import { EquipmentCard } from '../atlas/EquipmentCard';
import { SpellCard } from '../atlas/SpellCard';
import { GodCard } from '../atlas/GodCard';

export interface ExplorerProps {
  initialDomain?: ExplorerDomain;
}

export const Explorer: React.FC<ExplorerProps> = ({ initialDomain }) => {
  const { searchQuery, setSearchQuery, explorerTab, setExplorerTab } = useUIStore();
  const { ruleset } = useGameStore();

  const {
    monstersList, monsterCategories, monsterCategoryMapping,
    materialsList, materialCategories, materialCategoryMapping,
    equipmentList, equipmentCategories, equipmentCategoryMapping,
    transportList, spellsList, spellCategories, spellCategoryMapping,
    keyItemsList, booksList, godsList,
    isLoadingList, loadList,
    selectedItem, selectItem
  } = useAtlasStore();

  const { savedLocations, setInspectedLocation, inspectedLocation } = useWorldStore();

  const [activeDomain, setActiveDomain] = useState<ExplorerDomain>(initialDomain || (explorerTab as ExplorerDomain) || 'enemies');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Sync domain tab changes with UI store and trigger Atlas loading
  useEffect(() => {
    if (activeDomain !== 'locations') {
      setExplorerTab(activeDomain as ExplorerTab);
      loadList(activeDomain as ExplorerTab);
    }
  }, [activeDomain]);

  // Aggregate items for Explorer searching and browsing
  const explorerItems = useMemo<ExplorerItem[]>(() => {
    if (activeDomain === 'locations') {
      const locationItems: ExplorerItem[] = savedLocations.map(loc => ({
        id: loc.id,
        index: loc.id,
        name: loc.name,
        domain: 'locations',
        category: loc.region || loc.category || 'Location',
        description: loc.description,
        tags: [loc.category, loc.region || 'uncategorized'].filter(Boolean) as string[],
        raw: { ...loc, isCategory: false }
      }));

      // Also map regions as browsable items
      const regionItems: ExplorerItem[] = Object.entries(REGION_METADATA).map(([id, meta]) => ({
        id: `region-${id}`,
        index: id,
        name: meta.name,
        domain: 'locations',
        category: 'Region',
        description: meta.description,
        tags: ['region'],
        raw: { ...meta, id: `region-${id}`, isRegion: true, regionId: id, isCategory: false }
      }));

      return [...regionItems, ...locationItems];
    }

    const hasCategories = (
      activeDomain === 'enemies' ||
      activeDomain === 'materials' ||
      activeDomain === 'equipment' ||
      activeDomain === 'spells'
    );

    const isGlobalSearch = Boolean(searchQuery.trim());

    // Global domain search or browsing within a selected category or domain without categories
    if (isGlobalSearch || selectedCategory || !hasCategories) {
      let assetList: any[] = [];
      if (activeDomain === 'enemies') {
        assetList = monstersList.length > 0
          ? monstersList
          : monsterCategories.flatMap(c => c.monsters || []);
      } else if (activeDomain === 'materials') {
        assetList = materialsList.length > 0
          ? materialsList
          : materialCategories.flatMap(c => c.materials || []);
      } else if (activeDomain === 'equipment') {
        assetList = equipmentList.length > 0
          ? equipmentList
          : equipmentCategories.flatMap(c => c.equipment || []);
      } else if (activeDomain === 'spells') {
        assetList = spellsList.length > 0
          ? spellsList
          : spellCategories.flatMap(c => c.spells || []);
      } else if (activeDomain === 'transport') {
        assetList = transportList;
      } else if (activeDomain === 'gods') {
        assetList = godsList;
      } else if (activeDomain === 'key') {
        assetList = keyItemsList;
      } else {
        assetList = booksList;
      }

      // Filter by selectedCategory when browsing within a category (and no search query)
      if (selectedCategory && !isGlobalSearch) {
        if (activeDomain === 'enemies') {
          const cat = monsterCategories.find(c => c.index === selectedCategory);
          const catIndices = new Set((cat?.monsters || []).map(m => m.index));
          assetList = assetList.filter(item => catIndices.has(item.index));
        } else if (activeDomain === 'materials') {
          const cat = materialCategories.find(c => c.index === selectedCategory);
          const catIndices = new Set((cat?.materials || []).map(m => m.index));
          assetList = assetList.filter(item => catIndices.has(item.index));
        } else if (activeDomain === 'equipment') {
          const cat = equipmentCategories.find(c => c.index === selectedCategory);
          const catIndices = new Set((cat?.equipment || []).map(e => typeof e === 'object' ? e.index : e));
          assetList = assetList.filter(item => catIndices.has(item.index));
        } else if (activeDomain === 'spells') {
          const cat = spellCategories.find(c => c.index === selectedCategory);
          const catIndices = new Set((cat?.spells || []).map(s => s.index));
          assetList = assetList.filter(item => catIndices.has(item.index));
        }
      }

      return assetList.map(item => {
        let catName = selectedCategory || item.category;
        if (!catName) {
          if (activeDomain === 'enemies') catName = monsterCategoryMapping[item.index];
          else if (activeDomain === 'materials') catName = materialCategoryMapping[item.index];
          else if (activeDomain === 'equipment') catName = equipmentCategoryMapping[item.index];
          else if (activeDomain === 'spells') catName = spellCategoryMapping[item.index];
        }

        return {
          id: item.id || item.index || item.name,
          index: item.index || item.id || item.name,
          name: item.name || item.title || item.index,
          domain: activeDomain,
          category: catName,
          type: item.type,
          description: item.description || (Array.isArray(item.desc) ? item.desc.join(' ') : item.desc),
          rulesetContext: item.rulesetContext,
          raw: { ...item, isCategory: false }
        };
      });
    }

    // Browsing category hierarchy at domain root when no search query is present
    let categoriesList: any[] = [];
    if (activeDomain === 'enemies') categoriesList = monsterCategories;
    else if (activeDomain === 'materials') categoriesList = materialCategories;
    else if (activeDomain === 'equipment') categoriesList = equipmentCategories;
    else if (activeDomain === 'spells') categoriesList = spellCategories;

    return categoriesList.map(cat => ({
      id: cat.index,
      index: cat.index,
      name: cat.name || cat.index,
      domain: activeDomain,
      category: 'Category',
      raw: { ...cat, isCategory: true }
    }));
  }, [
    activeDomain, selectedCategory, searchQuery, savedLocations,
    monstersList, monsterCategories, monsterCategoryMapping,
    materialsList, materialCategories, materialCategoryMapping,
    equipmentList, equipmentCategories, equipmentCategoryMapping,
    spellsList, spellCategories, spellCategoryMapping,
    transportList, godsList, keyItemsList, booksList
  ]);

  // Execute deterministic search
  const searchResults = useMemo(() => {
    return searchExplorerItems(explorerItems, searchQuery, {
      domainFilter: activeDomain,
      rulesetFilter: ruleset
    });
  }, [explorerItems, searchQuery, activeDomain, ruleset]);

  const handleDomainSelect = (domain: ExplorerDomain) => {
    playClickSound();
    setActiveDomain(domain);
    setSelectedCategory(null);
    setSelectedRegion(null);
  };

  const handleItemSelect = (item: ExplorerItem) => {
    playClickSound();
    if (item.domain === 'locations') {
      if (item.raw.isRegion) {
        setSelectedRegion(item.raw.regionId);
        const meta = REGION_METADATA[item.raw.regionId];
        if (meta && meta.focalPoint) {
          setInspectedLocation({
            id: `region-${item.raw.regionId}`,
            name: meta.name,
            category: 'Region',
            description: meta.description,
            coordinates: { y: meta.focalPoint[0], x: meta.focalPoint[1] },
            image: null
          });
        }
      } else {
        setInspectedLocation(item.raw as SavedLocation);
      }
    } else if (item.raw.isCategory) {
      setSelectedCategory(item.index);
    } else {
      selectItem(item.index, activeDomain as ExplorerTab);
    }
  };

  const handleRegionClick = (regionId: string) => {
    playClickSound();
    setSelectedRegion(regionId === selectedRegion ? null : regionId);

    const meta = REGION_METADATA[regionId];
    if (meta && meta.focalPoint) {
      setInspectedLocation({
        id: `region-${regionId}`,
        name: meta.name,
        category: 'Region',
        description: meta.description,
        coordinates: { y: meta.focalPoint[0], x: meta.focalPoint[1] },
        image: null
      });
    }
  };

  return (
    <div className="flex h-full w-full bg-[#111] text-white overflow-hidden font-mono select-none">
      {/* Sidebar Navigation */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#161616] shrink-0">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-dragon-red flex items-center gap-2">
            <GameIcon name="save_data" size={14} /> Explorer_v2
          </h2>
          <span className="text-[9px] px-2 py-0.5 rounded bg-dragon-red/20 text-dragon-red border border-dragon-red/30 font-bold">
            {ruleset}
          </span>
        </div>

        {/* Domain Tabs Bar */}
        <div className="grid grid-cols-5 p-2 gap-1 border-b border-white/10 bg-black/20">
          {[
            { id: 'enemies', icon: 'bestiary', label: 'Enemies' },
            { id: 'materials', icon: 'materials', label: 'Materials' },
            { id: 'equipment', icon: 'package', label: 'Equipment' },
            { id: 'spells', icon: 'spells', label: 'Spells' },
            { id: 'gods', icon: 'lore', label: 'Gods' },
            { id: 'locations', icon: 'map', label: 'World' },
            { id: 'transport', icon: 'shield', label: 'Transport' },
            { id: 'key', icon: 'save_data', label: 'Key Items' },
            { id: 'books', icon: 'book', label: 'Books' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleDomainSelect(tab.id as ExplorerDomain)}
              className={cn(
                "p-2 rounded transition-all flex flex-col items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider",
                activeDomain === tab.id
                  ? "bg-dragon-red text-white shadow-lg"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              )}
              title={tab.label}
            >
              <GameIcon name={tab.icon as GameIconName} size={14} />
              <span className="truncate max-w-full">{tab.label.slice(0, 5)}</span>
            </button>
          ))}
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3 border-b border-white/5 bg-white/[0.02]">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeDomain}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 pl-8 text-xs font-mono focus:outline-none focus:border-dragon-red text-white placeholder-white/20"
            />
            <GameIcon name="refresh" size={12} className="absolute left-2.5 top-2.5 text-white/30" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[10px] text-white/40 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Item List / Categories */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoadingList ? (
            <div className="flex justify-center p-8 opacity-20">
              <GameIcon name="refresh" className="animate-spin" size={24} />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-6 text-center text-xs text-white/20 font-mono uppercase">
              No results found
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = activeDomain === 'locations'
                ? inspectedLocation?.id === item.id || inspectedLocation?.id === `region-${item.index}`
                : selectedItem?.index === item.index;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleItemSelect(item)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between group",
                    isSelected
                      ? "bg-dragon-red text-white"
                      : "hover:bg-white/10 text-white/40 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.category && (
                    <span className="text-[8px] opacity-40 font-mono tracking-normal ml-2 shrink-0">
                      [{item.category}]
                    </span>
                  )}
                </button>
              );
            })
          )}

          {selectedCategory && !searchQuery.trim() && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full mt-4 p-2 text-[9px] font-black uppercase text-center border border-white/10 hover:bg-white/5 text-white/40 transition-all"
            >
              [BACK_TO_CATEGORIES]
            </button>
          )}
        </div>
      </div>

      {/* Main Preview / Inspector Surface */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#0a0a0a] relative">
        {activeDomain === 'locations' ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* SVG Map of Faerun Regions */}
            <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
              <svg viewBox="0 0 1600 1070" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {Object.entries(REGION_PATH_REGISTRY).map(([id, path]) => (
                  <path
                    key={id}
                    d={path}
                    onClick={() => handleRegionClick(id)}
                    className={cn(
                      "cursor-pointer transition-all duration-500 hover:fill-dragon-red/40",
                      selectedRegion === id
                        ? "fill-dragon-red/60 stroke-dragon-red stroke-2"
                        : "fill-white/5 stroke-white/10"
                    )}
                  />
                ))}
              </svg>

              {/* Selected Region / Location Overlay Info */}
              {inspectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 p-6 bg-black/90 border border-white/10 backdrop-blur rounded-lg shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-dragon-red uppercase tracking-tighter">
                      {inspectedLocation.name}
                    </h3>
                    <span className="text-[9px] font-mono text-white/40 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {inspectedLocation.category || 'Location'}
                    </span>
                  </div>
                  {inspectedLocation.description && (
                    <p className="text-xs text-white/70 leading-relaxed font-sans italic mb-4">
                      {inspectedLocation.description}
                    </p>
                  )}
                  {inspectedLocation.coordinates && (
                    <div className="flex gap-4 text-[9px] text-white/30 uppercase tracking-widest font-mono">
                      <div>X: {inspectedLocation.coordinates.x ?? 0}</div>
                      <div>Y: {inspectedLocation.coordinates.y ?? 0}</div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl origin-top py-4">
            {selectedItem ? (
              <div className="space-y-6">
                <div className="bg-dragon-red/10 border border-dragon-red/30 p-2 rounded text-center">
                  <span className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">
                    Asset_Manifest_Valid // Domain: {activeDomain}
                  </span>
                </div>

                {activeDomain === 'enemies' && <MonsterCard monster={selectedItem} />}
                {activeDomain === 'materials' && <MaterialCard material={selectedItem} />}
                {activeDomain === 'equipment' && <EquipmentCard equipment={selectedItem} />}
                {activeDomain === 'spells' && <SpellCard spell={selectedItem} />}
                {activeDomain === 'gods' && <GodCard god={selectedItem} />}

                {(activeDomain === 'key' || activeDomain === 'books' || activeDomain === 'transport') && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded space-y-4">
                    <h3 className="text-lg font-bold text-dragon-red uppercase">{selectedItem.name}</h3>
                    <p className="text-xs text-white/70 font-sans leading-relaxed">
                      {selectedItem.desc ? (Array.isArray(selectedItem.desc) ? selectedItem.desc.join(' ') : selectedItem.desc) : 'No detail description recorded.'}
                    </p>
                  </div>
                )}

                <div className="text-[9px] font-mono text-white/20 text-center uppercase tracking-widest">
                  Index: {selectedItem.index || selectedItem.id} | Context: {ruleset}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 py-32">
                <GameIcon name="save_data" size={96} />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No_Entity_Selected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
