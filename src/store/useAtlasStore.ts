import { create } from 'zustand';
import { 
  fetchMonsterList, fetchMonsterData, fetchMonsterCategories, fetchMonsterCategoryMapping,
  fetchMaterialsList, fetchMaterialData, fetchMaterialCategoryMapping, fetchMaterialCategories,
  fetchEquipmentList, fetchEquipmentData, fetchEquipmentCategoryMapping, fetchEquipmentCategories,
  fetchMagicItemList, fetchMagicItemData,
  fetchNPCList, fetchNPCData,
  fetchTransportList, fetchTransportData
} from '../services/storageService';

export type ExplorerTab = 'enemies' | 'materials' | 'equipment' | 'key' | 'books' | 'spells' | 'transport';

interface AtlasState {
  monstersList: { name: string; index: string; rarity?: string; type?: string; challenge_rating?: string }[];
  monsterCategories: { name: string; index: string; monsters: any[] }[];
  monsterCategoryMapping: Record<string, string>;
  materialsList: { name: string; index: string }[];
  materialCategories: { name: string; index: string; materials: any[] }[];
  materialCategoryMapping: Record<string, string>;
  equipmentList: { name: string; index: string }[];
  keyItemsList: { name: string; index: string }[];
  booksList: { name: string; index: string }[];
  spellsList: { name: string; index: string }[];
  spellCategories: { name: string; index: string; spells: any[] }[];
  spellCategoryMapping: Record<string, string>;
  equipmentCategories: { name: string; index: string; equipment: any[] }[];
  equipmentCategoryMapping: Record<string, string>;
  transportList: { name: string; index: string }[];
  transportCategories: { name: string; index: string; transport: any[] }[];
  transportCategoryMapping: Record<string, string>;
  isLoadingList: boolean;
  selectedItem: any | null;
  isLoadingItem: boolean;

  // Actions
  loadList: (tab: ExplorerTab) => Promise<void>;
  loadAllLists: () => Promise<void>;
  selectItem: (index: string, tab: ExplorerTab) => Promise<void>;
  updateSelectedItem: (item: any) => void;
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  monstersList: [],
  monsterCategories: [],
  monsterCategoryMapping: {},
  materialsList: [],
  materialCategories: [],
  materialCategoryMapping: {},
  equipmentList: [],
  keyItemsList: [],
  booksList: [],
  spellsList: [],
  spellCategories: [],
  spellCategoryMapping: {},
  equipmentCategories: [],
  equipmentCategoryMapping: {},
  transportList: [],
  transportCategories: [],
  transportCategoryMapping: {},
  isLoadingList: false,
  selectedItem: null,
  isLoadingItem: false,

  loadList: async (tab) => {
    set({ isLoadingList: true });
    try {
      if (tab === 'enemies') {
        const [list, categories, mapping] = await Promise.all([
          fetchMonsterList(),
          fetchMonsterCategories(),
          fetchMonsterCategoryMapping()
        ]);
        
        const richList = list.map(item => {
          const categoryItem = categories
            .flatMap(c => c.monsters || [])
            .find(m => m.index === item.index);
          return categoryItem ? { ...item, ...categoryItem } : item;
        });

        set({ 
          monstersList: richList as any, 
          monsterCategories: categories,
          monsterCategoryMapping: mapping
        });
      } else if (tab === 'materials') {
        const [list, categories] = await Promise.all([
          fetchMaterialsList(),
          fetchMaterialCategories()
        ]);
        set({ materialsList: list as any, materialCategories: categories });
      } else if (tab === 'equipment') {
        const [list, magicList, categories] = await Promise.all([
          fetchEquipmentList(),
          fetchMagicItemList(),
          fetchEquipmentCategories()
        ]);
        const combined = [...list, ...magicList];
        const groupedMap = new Map<string, any>();
        
        combined.forEach(item => {
          const baseIndex = item.index.replace(/_\d$/, '');
          const tierMatch = item.index.match(/_(\d)$/);
          const tier = tierMatch ? parseInt(tierMatch[1]) : 0;
          
          if (!groupedMap.has(baseIndex)) {
            groupedMap.set(baseIndex, { ...item, index: baseIndex, versions: {} });
          }
          
          const group = groupedMap.get(baseIndex);
          group.versions[tier] = item;
          
          if (tier === 0 || !group.name.includes('+')) {
            const versions = group.versions;
            Object.assign(group, { ...item, index: baseIndex, versions });
          }
        });
        
        const unique = Array.from(groupedMap.values());

        const enrichedCategories = categories.map(cat => {
          const catEquipmentIndices = cat.equipment || [];
          const resolvedEquipment: any[] = [];
          let totalAssets = 0;

          catEquipmentIndices.forEach((itemOrIndex: any) => {
            const itemIndex = typeof itemOrIndex === 'object' ? (itemOrIndex.index || itemOrIndex.name) : itemOrIndex;
            if (!itemIndex) return;

            const group = groupedMap.get(itemIndex);
            if (group) {
              totalAssets += Object.keys(group.versions).length;
              resolvedEquipment.push(group);
            } else {
              totalAssets += 1;
              const name = typeof itemOrIndex === 'object' ? (itemOrIndex.name || itemOrIndex.index) : itemOrIndex;
              resolvedEquipment.push({ index: itemIndex, name: name });
            }
          });

          return { ...cat, totalAssets, equipment: resolvedEquipment };
        });

        set({ equipmentList: unique as any, equipmentCategories: enrichedCategories });
      } else if (tab === 'key') {
        set({ keyItemsList: [
          { name: 'Ancient Relic', index: 'ancient-relic' },
          { name: 'Dragon Key', index: 'dragon-key' },
          { name: 'Mysterious Map', index: 'mysterious-map' }
        ]});
      } else if (tab === 'books') {
        set({ booksList: [
          { id: 't-lore', title: 'Tome of Ancient Lore', index: 'tome-lore', language: 'common', author: 'Archmage Kaelen', type: 'book', description: 'A dusty volume containing basic magical theory.' },
          { id: 'aj-1', title: 'Journal of the Artificer', index: 'artificer-journal', language: 'common', author: 'Unknown', type: 'scroll', description: 'Scattered notes about soul-binding and gear modification.' },
          { id: 'ab-1', title: 'Bestiary of the Arcane', index: 'arcane-bestiary', language: 'common', author: 'Huntress Vira', type: 'atlas', description: 'Field notes on creatures affected by the rift.' },
          { id: 'ap-1', title: 'Abyssal Prophecies', index: 'abyssal-prophecies', language: 'abyssal', author: 'The Mad Cultist', type: 'book', description: 'The whispers of the void are written here. Only those who speak the tongue of demons can decode the secrets of the dark.' }
        ] as any});
      } else if (tab === 'spells') {
        const { fetchSpellList, fetchMagicSchools } = await import('../services/storageService');
        const [list, schools] = await Promise.all([
          fetchSpellList(),
          fetchMagicSchools()
        ]);
        
        const mapping: Record<string, string> = {};
        const spellsBySchool: Record<string, any[]> = {};
        list.forEach(spell => {
          const schoolRef = spell.school;
          const schoolIndex = typeof schoolRef === 'string' ? schoolRef.toLowerCase() : (schoolRef?.index || schoolRef?.name?.toLowerCase() || 'unknown');
          
          if (!spellsBySchool[schoolIndex]) {
            spellsBySchool[schoolIndex] = [];
          }
          spellsBySchool[schoolIndex].push(spell);
          mapping[spell.index] = typeof schoolRef === 'string' ? schoolRef : (schoolRef?.name || schoolIndex);
        });

        const enrichedSchools = schools.map(school => {
          const schoolSpells = spellsBySchool[school.index] || [];
          return { ...school, spells: schoolSpells };
        });

        Object.keys(spellsBySchool).forEach(schoolIndex => {
          if (!enrichedSchools.find(s => s.index === schoolIndex)) {
            enrichedSchools.push({
              name: schoolIndex.charAt(0).toUpperCase() + schoolIndex.slice(1),
              index: schoolIndex,
              spells: spellsBySchool[schoolIndex]
            });
          }
        });

        set({ spellsList: list, spellCategories: enrichedSchools as any, spellCategoryMapping: mapping });
      } else if (tab === 'transport') {
        const list = await fetchTransportList();
        set({ transportList: list as any });
      }
    } finally {
      set({ isLoadingList: false });
    }
  },

  loadAllLists: async () => {
    set({ isLoadingList: true });
    try {
      const [
        monsters, monsterCategories, monsterMapping,
        materials, materialCategories, materialMapping, 
        equipment, magicItems, categories, mapping,
      ] = await Promise.all([
        fetchMonsterList(),
        fetchMonsterCategories(),
        fetchMonsterCategoryMapping(),
        fetchMaterialsList(),
        fetchMaterialCategories(),
        fetchMaterialCategoryMapping(),
        fetchEquipmentList(),
        fetchMagicItemList(),
        fetchEquipmentCategories(),
        fetchEquipmentCategoryMapping(),
      ]);
      const combinedEquipment = [...equipment, ...magicItems];
      const groupedMap = new Map<string, any>();
      
      combinedEquipment.forEach(item => {
        const baseIndex = item.index.replace(/_\d$/, '');
        const tierMatch = item.index.match(/_(\d)$/);
        const tier = tierMatch ? parseInt(tierMatch[1]) : 0;
        
        if (!groupedMap.has(baseIndex)) {
          groupedMap.set(baseIndex, { ...item, index: baseIndex, versions: {} });
        }
        
        const group = groupedMap.get(baseIndex);
        group.versions[tier] = item;
        
        if (tier === 0 || !group.name.includes('+')) {
          const versions = group.versions;
          Object.assign(group, { ...item, index: baseIndex, versions });
        }
      });
      const uniqueEquipment = Array.from(groupedMap.values());

      const enrichedEquipmentCategories = categories.map(cat => {
        const catEquipmentIndices = cat.equipment || [];
        const resolvedEquipment: any[] = [];
        let totalAssets = 0;

        catEquipmentIndices.forEach((itemOrIndex: any) => {
          const itemIndex = typeof itemOrIndex === 'object' ? (itemOrIndex.index || itemOrIndex.name) : itemOrIndex;
          if (!itemIndex) return;

          const group = groupedMap.get(itemIndex);
          if (group) {
            totalAssets += Object.keys(group.versions).length;
            resolvedEquipment.push(group);
          } else {
            totalAssets += 1;
            const name = typeof itemOrIndex === 'object' ? (itemOrIndex.name || itemOrIndex.index) : itemOrIndex;
            resolvedEquipment.push({ index: itemIndex, name: name });
          }
        });

        return { ...cat, totalAssets, equipment: resolvedEquipment };
      });

      const enrichedMaterialCategories = materialCategories.map(cat => {
        const catMaterialIndices = cat.materials || [];
        const resolvedMaterials: any[] = [];
        catMaterialIndices.forEach((itemOrIndex: any) => {
          const itemIndex = typeof itemOrIndex === 'object' ? (itemOrIndex.index || itemOrIndex.name) : itemOrIndex;
          if (!itemIndex) return;

          const mat = materials.find((m: any) => m.index === itemIndex);
          if (mat) {
            resolvedMaterials.push(mat);
          } else {
            const name = typeof itemOrIndex === 'object' ? (itemOrIndex.name || itemOrIndex.index) : itemOrIndex;
            resolvedMaterials.push({ index: itemIndex, name: name });
          }
        });
        return { ...cat, totalAssets: catMaterialIndices.length, materials: resolvedMaterials };
      });

      const richMonsters = monsters.map(item => {
        const categoryItem = monsterCategories
          .flatMap(c => c.monsters || [])
          .find(m => m.index === item.index);
        return categoryItem ? { ...item, ...categoryItem } : item;
      });

      set({ 
        monstersList: richMonsters as any, 
        monsterCategories: monsterCategories,
        monsterCategoryMapping: monsterMapping,
        materialsList: materials as any, 
        materialCategories: enrichedMaterialCategories,
        materialCategoryMapping: materialMapping,
        equipmentList: uniqueEquipment as any,
        equipmentCategories: enrichedEquipmentCategories,
        equipmentCategoryMapping: mapping,
      });
    } finally {
      set({ isLoadingList: false });
    }
  },

  selectItem: async (index, tab) => {
    set({ isLoadingItem: true });
    try {
      let data = null;
      if (tab === 'enemies') {
        data = await fetchMonsterData(index);
      } else if (tab === 'materials') {
        data = await fetchMaterialData(index);
      } else if (tab === 'equipment') {
        data = await fetchEquipmentData(index);
        if (!data) {
          data = await fetchMagicItemData(index);
        }
      } else if (tab === 'key') {
        const mockKeys: Record<string, any> = {
          'ancient-relic': { name: 'Ancient Relic', index: 'ancient-relic', desc: ['A glowing artifact from a forgotten era.'], isKeyItem: true, weight: 2, imageUrl: 'https://picsum.photos/seed/relic/400/600' },
          'dragon-key': { name: 'Dragon Key', index: 'dragon-key', desc: ['A heavy iron key shaped like a dragon.'], isKeyItem: true, weight: 1, imageUrl: 'https://picsum.photos/seed/key/400/600' },
          'mysterious-map': { name: 'Mysterious Map', index: 'mysterious-map', desc: ['A tattered map showing hidden paths.'], isKeyItem: true, weight: 0.5, imageUrl: 'https://picsum.photos/seed/map/400/600' }
        };
        data = mockKeys[index];
      } else if (tab === 'books') {
        const mockBooks: Record<string, any> = {
          'tome-lore': { name: 'Tome of Ancient Lore', index: 'tome-lore', desc: ['A thick book filled with forgotten history.'], isBook: true, weight: 5, imageUrl: 'https://picsum.photos/seed/book1/400/600' },
          'artificer-journal': { name: 'Journal of the Artificer', index: 'artificer-journal', desc: ['Personal notes on magical inventions.'], isBook: true, weight: 2, imageUrl: 'https://picsum.photos/seed/book2/400/600' },
          'arcane-bestiary': { name: 'Bestiary of the Arcane', index: 'arcane-bestiary', desc: ['A guide to magical creatures.'], isBook: true, weight: 4, imageUrl: 'https://picsum.photos/seed/book3/400/600' }
        };
        data = mockBooks[index];
      } else if (tab === 'spells') {
        const { fetchSpellData } = await import('../services/storageService');
        data = await fetchSpellData(index);
      } else if (tab === 'transport') {
        data = await fetchTransportData(index);
      }
      
      if (data) {
        set({ selectedItem: { ...data, _type: tab } });
      }
    } finally {
      set({ isLoadingItem: false });
    }
  },

  updateSelectedItem: (item) => {
    set({ selectedItem: item });
    get().loadAllLists();
  }
}));
