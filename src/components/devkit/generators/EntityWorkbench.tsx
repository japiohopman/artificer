import React, { useState, useEffect } from 'react';
import { scrapeMonsterWiki, parseRawMonsterText, generateLore } from '../../../../services/ai/monsterService';
import { generateItemDescription } from '../../../../services/ai/itemService';
import { generateVisualPrompt } from '../../../../services/ai/imageService';
import {
  commitFile, fetchMonsterData, fetchMaterialData, fetchEquipmentData, fetchMagicItemData,
  playSuccessSound, playFailSound, playClickSound, updateMonsterCategory
} from '../../../../services/storageService';
import { useAtlasStore } from '../../../../store/useAtlasStore';
import { GameIcon } from '../../../../game_icons';

import { HierarchyExplorerDrawer } from './entity/HierarchyExplorerDrawer';
import { WikiScraperHeader } from './entity/WikiScraperHeader';
import { LoreBinderSection } from './entity/LoreBinderSection';
import { MechanicalStatEditor } from './entity/MechanicalStatEditor';
import { ItemPropertyEditor } from './entity/ItemPropertyEditor';
import { LootHarvestEditor } from './entity/LootHarvestEditor';
import { SynthesisSection } from './entity/SynthesisSection';

interface EntityWorkbenchProps {
  activeGenerator: 'monsters' | 'materials' | 'equipment';
  initialMonster?: any | null;
  onMonsterUpdated?: (monster: any) => void;
}

export const EntityWorkbench: React.FC<EntityWorkbenchProps> = ({
  activeGenerator,
  initialMonster,
  onMonsterUpdated
}) => {
  const {
    monstersList, materialsList, equipmentList,
    equipmentCategories: storeEquipmentCategories, materialCategories: storeMaterialCategories,
    loadAllLists, missingAssets
  } = useAtlasStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(initialMonster || null);
  const [itemDataMap, setItemDataMap] = useState<Record<string, any>>({});
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checklist, setChecklist] = useState({
    jsonExists: false,
    wikiExists: false,
    promptReady: false,
    imageGenerated: false,
    bgReady: false,
    xpReady: false,
    isMissingAsset: false
  });
  const [tierStatuses, setTierStatuses] = useState<any[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [customWikiUrl, setCustomWikiUrl] = useState<string>('');
  const [wikiTab, setWikiTab] = useState<'editor' | 'raw'>('editor');
  const [ripperText, setRipperText] = useState<string>('');
  const [isParsingRipper, setIsParsingRipper] = useState<boolean>(false);
  const [selectedMonsterCategory, setSelectedMonsterCategory] = useState<string>('beast');

  const safeString = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.name || val.value || val.index || "";
    }
    return String(val);
  };

  const equipmentCategories = [
    "Adventuring Gear", "Ammunition", "Arcane Foci", "Armor", "Artisan's Tools",
    "Druidic Foci", "Equipment Packs", "Gaming Sets", "Heavy Armor", "Holy Symbols",
    "Kits", "Land Vehicles", "Light Armor", "Martial Melee Weapons", "Martial Ranged Weapons",
    "Martial Weapons", "Medium Armor", "Melee Weapons", "Mounts and Other Animals",
    "Mounts and Vehicles", "Musical Instruments", "Other Tools", "Potion", "Ranged Weapons",
    "Ring", "Rod", "Scroll", "Shields", "Simple Melee Weapons", "Simple Ranged Weapons",
    "Simple Weapons", "Staff", "Standard Gear", "Tack Harness and Drawn Vehicles",
    "Tools", "Wand", "Waterborne Vehicles", "Weapon", "Wondrous Items"
  ];

  const materialCategories = [
    "Consumables", "Herbs", "Oils", "Monster Parts", "Common Materials",
    "Raw Materials", "Refined Materials", "Bundled Materials"
  ];

  useEffect(() => {
    setSelectedCategory(null);
  }, [activeGenerator]);

  useEffect(() => {
    if (initialMonster) {
      const itemWithDefaults = {
        ...initialMonster,
        background_type: initialMonster.background_type || 'land_forest'
      };
      setEditingItem(itemWithDefaults);
      runChecks(itemWithDefaults);
    }
  }, [initialMonster]);

  const runChecks = async (item: any) => {
    if (!item || !item.index) return;
    setIsChecking(true);

    let currentList: any[] = [];
    if (activeGenerator === 'monsters') currentList = monstersList;
    else if (activeGenerator === 'materials') currentList = materialsList;
    else if (activeGenerator === 'equipment') {
      currentList = useAtlasStore.getState().equipmentList;
    }

    const jsonExists = currentList.some(m => m.index === item.index);
    const wikiExists = !!item.lore || !!item.wikiData || !!item.desc;
    const bgExists = activeGenerator === 'monsters' ? !!item.background_type : true;
    const xpExists = activeGenerator === 'monsters' ? (item.xp !== undefined && item.xp > 0) : true;

    const missingCategory = activeGenerator === 'monsters' ? 'enemy' :
                          (activeGenerator === 'materials' ? 'materials' :
                          (item.rarity && item.rarity !== 'Common' ? 'magic_items' : 'equipment'));

    const isMissing = missingAssets[missingCategory]?.some(a =>
      a.toLowerCase().includes(item.index.toLowerCase()) ||
      (item.name && a.toLowerCase().includes(item.name.toLowerCase()))
    );

    setChecklist(prev => ({
      ...prev,
      jsonExists,
      wikiExists,
      promptReady: !!prompt,
      imageGenerated: !!item.imageUrl,
      bgReady: bgExists,
      xpReady: xpExists,
      isMissingAsset: !!isMissing
    }));

    if (item.versions) {
      const statuses = Object.keys(item.versions).map(t => {
        const v = item.versions[t];
        return {
          tier: parseInt(t),
          index: v.index,
          name: v.name,
          jsonExists: !!v.imageUrl || true,
          imageGenerated: !!v.imageUrl
        };
      });
      setTierStatuses(statuses);
    } else {
      setTierStatuses([]);
    }

    setIsChecking(false);
  };

  const generateDescription = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const category = activeGenerator === 'materials' ? 'Materials' : (editingItem.category || 'Equipment');
      const subCategory = activeGenerator === 'materials' ? editingItem.material_sub_category : undefined;
      const desc = await generateItemDescription(editingItem.name || '', category, subCategory);
      if (desc) {
        updateField('desc', [desc]);
        setChecklist(prev => ({ ...prev, wikiExists: true }));
      }
    } finally {
      setIsChecking(false);
    }
  };

  const formatCost = (cost: any) => {
    if (!cost) return '';
    if (typeof cost === 'string') return cost;
    if (typeof cost === 'object') {
      return `${cost.quantity || 0} ${cost.unit || 'gp'}`;
    }
    return String(cost);
  };

  const parseCost = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length >= 2) {
      const quantity = parseInt(parts[0]);
      const unit = parts[1];
      if (!isNaN(quantity)) {
        return { quantity, unit };
      }
    }
    return value;
  };

  const scrapeWiki = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const wikiUrl = customWikiUrl || `https://forgottenrealms.fandom.com/wiki/${editingItem.name?.replace(/\s+/g, '_')}`;
      setCustomWikiUrl(wikiUrl);

      if (activeGenerator === 'monsters') {
        const result = await scrapeMonsterWiki(editingItem.name || '', wikiUrl);
        if (result) {
          updateField('lore', result.lore);
          updateField('wikiData', result.wikiData);
          setChecklist(prev => ({ ...prev, wikiExists: true }));
        }
      } else {
        const lore = await generateLore(
          editingItem.name || '',
          editingItem.type || editingItem.category || 'Material',
          editingItem.size,
          editingItem.alignment,
          editingItem.subtype,
          wikiUrl
        );
        if (lore) {
          updateField('desc', [lore]);
          setChecklist(prev => ({ ...prev, wikiExists: true }));
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const generatePrompt = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const category = activeGenerator === 'monsters' ? 'monsters' :
                      activeGenerator === 'materials' ? 'materials' : 'equipment';
      const newPrompt = await generateVisualPrompt(editingItem, category);
      if (newPrompt) {
        setPrompt(newPrompt);
        setChecklist(prev => ({ ...prev, promptReady: true }));
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.name) return;

    setIsChecking(true);
    try {
      const now = new Date();
      const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
      const index = editingItem.index;

      let category = activeGenerator === 'monsters' ? 'enemies' :
                     activeGenerator === 'materials' ? 'materials' :
                     activeGenerator === 'equipment' ? 'equipment' : '';

      if (activeGenerator === 'equipment' &&
          (String(editingItem.category).toLowerCase().includes('wondrous') ||
           (editingItem.rarity && editingItem.rarity !== 'Common'))) {
        category = 'magic_items';
      }

      let jsonPath = `public/assets/atlas/${category}/json/${index}.json`;

      if (category === 'equipment') {
        try {
          const indexRes = await fetch('/assets/atlas/equipment/index.json');
          if (indexRes.ok) {
            const equipmentIndex = await indexRes.json();
            const entry = equipmentIndex.find((e: any) => e.index === index);
            if (entry && entry.json_path) {
              let cleanPath = entry.json_path;
              if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
              if (!cleanPath.startsWith('public/')) cleanPath = 'public/' + cleanPath;
              jsonPath = cleanPath;
            } else {
              const { getRulesetVersionFolder } = await import('../../../../services/storageService');
              jsonPath = `public/assets/atlas/equipment/json/${getRulesetVersionFolder()}/${index}.json`;
            }
          }
        } catch (e) {
          console.error("Error resolving equipment subfolder from index:", e);
        }
      }

      let finalImageUrl = editingItem.imageUrl;
      if (editingItem.imageUrl?.startsWith('data:image/')) {
        const base64Data = editingItem.imageUrl.split(',')[1];

        const categoriesWithImagesFolder = ['magic_items', 'equipment', 'enemies', 'materials'];
        const imagePath = categoriesWithImagesFolder.includes(category)
          ? `public/assets/atlas/${category}/images/${index}.webp`
          : `public/assets/atlas/${category}/${index}.webp`;

        const imageSuccess = await commitFile(imagePath, base64Data, true);
        if (!imageSuccess) {
          throw new Error(`Failed to commit image file to ${imagePath}`);
        }

        finalImageUrl = categoriesWithImagesFolder.includes(category)
          ? `/assets/atlas/${category}/images/${index}.webp`
          : `/assets/atlas/${category}/${index}.webp`;
      }

      let lorePath: string | null = null;
      if (activeGenerator === 'monsters' && (editingItem.lore || editingItem.wikiData)) {
        lorePath = `/assets/atlas/enemies/enemies_wiki/${index}.json`;

        const wikiDataToSave = {
          name: editingItem.name,
          lore: editingItem.lore,
          wikiData: editingItem.wikiData,
          bakedAt: Date.now()
        };

        const wikiJsonPath = `public/assets/atlas/enemies/enemies_wiki/${index}.json`;
        await commitFile(wikiJsonPath, JSON.stringify(wikiDataToSave, null, 2));
      }

      const itemToSave = {
        ...editingItem,
        imageUrl: finalImageUrl,
        lore: lorePath || editingItem.lore,
        last_updated: dateStr,
        updated_at: now.toISOString()
      };

      const jsonSuccess = await commitFile(
        jsonPath,
        JSON.stringify(itemToSave, null, 2)
      );

      if (!jsonSuccess) {
        throw new Error("Failed to commit JSON file.");
      }

      if (activeGenerator === 'monsters' && selectedMonsterCategory) {
        await updateMonsterCategory(selectedMonsterCategory, index, editingItem.name);
      }

      setEditingItem(itemToSave);
      setItemDataMap(prev => ({ ...prev, [itemToSave.index!]: itemToSave }));
      onMonsterUpdated?.(itemToSave);
      playSuccessSound();
      alert(`${activeGenerator.slice(0, -1)} asset successfully baked to repository!`);
    } catch (err) {
      console.error(err);
      playFailSound();
      alert(`Bake failed: ${err instanceof Error ? err.message : "Unknown error"}. Check console for details.`);
    } finally {
      setIsChecking(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingItem((prev: any) => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <HierarchyExplorerDrawer
        activeGenerator={activeGenerator}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        monstersList={monstersList}
        materialsList={materialsList}
        equipmentList={equipmentList}
        storeMaterialCategories={storeMaterialCategories}
        storeEquipmentCategories={storeEquipmentCategories}
        loadAllLists={loadAllLists}
        itemDataMap={itemDataMap}
        setItemDataMap={setItemDataMap}
        runChecks={runChecks}
        tierStatuses={tierStatuses}
        checklist={checklist}
        handleSave={handleSave}
        scrapeWiki={scrapeWiki}
        generateDescription={generateDescription}
        generatePrompt={generatePrompt}
        safeString={safeString}
      />

      {/* Right Panel: Code Workspace */}
      <div className="flex-1 flex flex-col bg-[#1a1a1a] relative">
        {editingItem ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-dragon-red/10 rounded border border-dragon-red/20 text-dragon-red">
                  {activeGenerator === 'monsters' ? <GameIcon name="identity" size={16} color="currentColor" /> :
                   activeGenerator === 'materials' ? <GameIcon name="magic_effect" size={16} color="currentColor" /> :
                   <GameIcon name="package" size={16} color="currentColor" />}
                </div>
                <div>
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{editingItem.index}</div>
                  <div className="text-sm font-bold text-white uppercase tracking-tight">{safeString(editingItem.name)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-dragon-red text-white text-[10px] font-bold rounded hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                  title="Deploy Changes to Repository"
                >
                  <GameIcon name="save_data" size={12} color="currentColor" /> DEPLOY_CHANGES
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <WikiScraperHeader
                ripperText={ripperText}
                setRipperText={setRipperText}
                isParsingRipper={isParsingRipper}
                setIsParsingRipper={setIsParsingRipper}
                customWikiUrl={customWikiUrl}
                setCustomWikiUrl={setCustomWikiUrl}
                isChecking={isChecking}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                setSelectedMonsterCategory={setSelectedMonsterCategory}
                scrapeWiki={scrapeWiki}
                parseRawMonsterText={parseRawMonsterText}
                playClickSound={playClickSound}
                playSuccessSound={playSuccessSound}
                playFailSound={playFailSound}
              />

              {activeGenerator === 'monsters' && (
                <LoreBinderSection
                  editingItem={editingItem}
                  updateField={updateField}
                  wikiTab={wikiTab}
                  setWikiTab={setWikiTab}
                />
              )}

              {activeGenerator === 'monsters' && (
                <MechanicalStatEditor
                  editingItem={editingItem}
                  updateField={updateField}
                />
              )}

              <ItemPropertyEditor
                activeGenerator={activeGenerator}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                updateField={updateField}
                selectedMonsterCategory={selectedMonsterCategory}
                setSelectedMonsterCategory={setSelectedMonsterCategory}
                equipmentCategories={equipmentCategories}
                materialCategories={materialCategories}
                generateDescription={generateDescription}
                formatCost={formatCost}
                parseCost={parseCost}
              />

              {activeGenerator === 'monsters' && (
                <LootHarvestEditor
                  editingItem={editingItem}
                  updateField={updateField}
                  playClickSound={playClickSound}
                />
              )}

              <SynthesisSection
                activeGenerator={activeGenerator}
                editingItem={editingItem}
                updateField={updateField}
                prompt={prompt}
                setPrompt={setPrompt}
                generatePrompt={generatePrompt}
                setChecklist={setChecklist}
                playClickSound={playClickSound}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-6">
            <GameIcon name="console" size={80} color="currentColor" strokeWidth={1} />
            <div className="text-center space-y-2">
              <p className="font-bold tracking-[0.3em] uppercase text-sm">Awaiting_Entry_Signal</p>
              <p className="text-[10px] text-white/5 max-w-[240px]">Select an asset from the project hierarchy to initialize initialization protocols.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
