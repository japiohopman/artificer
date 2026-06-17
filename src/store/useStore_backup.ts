import { create } from 'zustand';
import { AudioLayer, LayerState } from '../types/audio.ts';
import { 
  fetchMonsterList, fetchMonsterData, fetchMonsterCategories, fetchMonsterCategoryMapping,
  fetchMaterialsList, fetchMaterialData, fetchMaterialCategoryMapping, fetchMaterialCategories,
  fetchEquipmentList, fetchEquipmentData, fetchEquipmentCategoryMapping, fetchEquipmentCategories,
  fetchMagicItemList, fetchMagicItemData,
  fetchNPCList, fetchNPCData,
  fetchTransportList, fetchTransportData
} from '../services/storageService';

export type ExplorerTab = 'enemies' | 'materials' | 'equipment' | 'key' | 'books' | 'spells' | 'transport';

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'lorekeeper' | 'traveler';
  createdAt?: any;
  bio?: string;
  settings?: {
    displayRealName?: boolean;
    notificationsEnabled?: boolean;
  };
}

interface AppState {
  // Navigation
  viewMode: 'combat' | 'collection';
  currentView: string;
  explorerTab: ExplorerTab;
  isDevKitOpen: boolean;
  isExplorerOpen: boolean;
  isWorldPanelOpen: boolean;
  isCharacterPanelOpen: boolean;
  dynamicNavButtons: any[]; 
  isAdvancedRollerOpen: boolean;
  chatExpanded: boolean;
  isEditingSubMap: boolean;
  isInsideSubMap: boolean;
  selectedDiceTheme: string;
  selectedDiceColor: string;
  
  // App UI State
  isProfileMenuOpen: boolean;
  isMonsterProfileOpen: boolean;
  isTransportProfileOpen: boolean;
  isCharacterCreatorOpen: boolean;
  isCharacterSpellbookOpen: boolean;
  
  // Collections
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
  isLoadingSaves: boolean;
  searchQuery: string;
  selectedItem: any | null;
  isLoadingItem: boolean;
  
  // Focus View
  focusedItem: any | null;
  inspectingItem: { 
    item: any; 
    sourceId: string; 
    index?: number; 
    itemId?: string;
    slot?: string;
  } | null;
  
  // Simulator
  activeCards: any[];

  // Logs
  logs: LogEntry[];

  // Dice Rolls
  isDiceReady: boolean;
  recentRolls: any[];

  // Audio Mixer
  layerStates: Record<AudioLayer, LayerState>;
  isMusicPlaying: boolean;

  // Hue Lighting (Arcane Ambiance)
  hueState: {
    enabled: boolean;
    connected: boolean;
    brightness: number;
    color: string;
    scene: string;
    isSyncing: boolean;
  };

  // Game flow
  isGameStarted: boolean;
  setIsGameStarted: (started: boolean) => void;

  // Audio Actions
  updateLayerVolume: (layerId: AudioLayer, volume: number) => void;
  toggleLayerMute: (layerId: AudioLayer) => void;
  toggleLayerSolo: (layerId: AudioLayer) => void;
  stopAllAudio: () => void;
  setMusicPlaying: (isPlaying: boolean) => void;

  // Hue Actions
  setHueState: (updates: Partial<AppState['hueState']>) => void;

  // Auth State
  user: any | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: any | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setAuthReady: (isReady: boolean) => void;

  // Actions
  setViewMode: (mode: 'combat' | 'collection') => void;
  setCurrentView: (view: string) => void;
  setExplorerTab: (tab: ExplorerTab) => void;
  setIsDevKitOpen: (isOpen: boolean) => void;
  setIsExplorerOpen: (isOpen: boolean) => void;
  setIsWorldPanelOpen: (isOpen: boolean) => void;
  setIsCharacterPanelOpen: (isOpen: boolean) => void;
  setDynamicNavButtons: (buttons: any[]) => void;
  setIsAdvancedRollerOpen: (isOpen: boolean) => void;
  setChatExpanded: (expanded: boolean) => void;
  setIsEditingSubMap: (isEditing: boolean) => void;
  setIsInsideSubMap: (isInside: boolean) => void;
  setSelectedDiceTheme: (theme: string) => void;
  setSelectedDiceColor: (color: string) => void;
  
  setSearchQuery: (query: string) => void;
  setFocusedItem: (item: any | null) => void;
  setInspectingItem: (data: { item: any; sourceId: string; index?: number; itemId?: string; slot?: string; } | null) => void;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  setIsMonsterProfileOpen: (isOpen: boolean) => void;
  setIsTransportProfileOpen: (isOpen: boolean) => void;
  setIsCharacterCreatorOpen: (isOpen: boolean) => void;
  setIsCharacterSpellbookOpen: (isOpen: boolean) => void;
  
  rollDice: (label: string, modifier: number, dieType?: number) => void;
  rollDice3D: (notation: string, label: string, theme?: string, color?: string) => Promise<void>;
  removeRoll: (id: string) => void;
  clearRoll: () => void;
  setIsDiceReady: (isReady: boolean) => void;
  
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;

  // Audio Actions
  playSound: (soundId: string) => void;

  // Async Actions
  loadList: (tab?: ExplorerTab) => Promise<void>;
  loadAllLists: () => Promise<void>;
  selectItem: (index: string) => Promise<void>;
  addToPreview: (item: any) => void;
  removeFromPreview: (index: number) => void;
  clearPreview: () => void;
  updateSelectedItem: (item: any) => void;
}

export const useStore = create<AppState>((set, get) => ({
  viewMode: 'collection',
  currentView: 'world',
  explorerTab: 'enemies',
  isDevKitOpen: false,
  isExplorerOpen: true,
  isWorldPanelOpen: false,
  isCharacterPanelOpen: false,
  dynamicNavButtons: [],
  isAdvancedRollerOpen: false,
  chatExpanded: false,
  isEditingSubMap: false,
  isInsideSubMap: false,
  selectedDiceTheme: 'default',
  selectedDiceColor: '#8b0000',

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
  isLoadingSaves: false,
  isGameStarted: false,
  searchQuery: '',

  // Audio Mixer
  isMusicPlaying: false,
  layerStates: {
    1: { volume: 0.8, isMuted: false, isSolo: false, isPlaying: false },
    2: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    3: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    4: { volume: 0.7, isMuted: false, isSolo: false, isPlaying: false },
    5: { volume: 1.0, isMuted: false, isSolo: false, isPlaying: false },
    6: { volume: 0.6, isMuted: false, isSolo: false, isPlaying: false },
    7: { volume: 0.6, isMuted: false, isSolo: false, isPlaying: false },
    8: { volume: 1.0, isMuted: false, isSolo: false, isPlaying: false },
    9: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    10: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    11: { volume: 0.4, isMuted: false, isSolo: false, isPlaying: false },
  },

  // Hue Lighting
  hueState: {
    enabled: false,
    connected: false,
    brightness: 100,
    color: '#ffffff',
    scene: 'default',
    isSyncing: false
  },

  selectedItem: null,
  isLoadingItem: false,
  focusedItem: null,
  inspectingItem: null,
  
  isProfileMenuOpen: false,
  isMonsterProfileOpen: false,
  isTransportProfileOpen: false,
  isCharacterCreatorOpen: false,
  isCharacterSpellbookOpen: false,

  user: null,
  userProfile: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  updateUserProfile: async (updates) => {
    const { user, userProfile } = get();
    if (!user) return;

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null
      }));
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  
  activeCards: [],
  logs: [],
  isDiceReady: false,
  recentRolls: [],

  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentView: (currentView) => set({ currentView }),
  setExplorerTab: (explorerTab) => {
    set({ explorerTab, selectedItem: null });
    get().loadList(explorerTab);
  },
  setIsDevKitOpen: (isDevKitOpen) => set({ isDevKitOpen }),
  setIsExplorerOpen: (isExplorerOpen) => set({ isExplorerOpen }),
  setIsWorldPanelOpen: (isWorldPanelOpen) => set({ isWorldPanelOpen }),
  setIsCharacterPanelOpen: (isCharacterPanelOpen) => set({ isCharacterPanelOpen }),
  setDynamicNavButtons: (dynamicNavButtons) => set({ dynamicNavButtons }),
  setIsAdvancedRollerOpen: (isAdvancedRollerOpen) => set({ isAdvancedRollerOpen }),
  setChatExpanded: (chatExpanded) => set({ chatExpanded }),
  setIsEditingSubMap: (isEditingSubMap) => set({ isEditingSubMap }),
  setIsInsideSubMap: (isInsideSubMap) => set({ isInsideSubMap }),
  setSelectedDiceTheme: (selectedDiceTheme) => set({ selectedDiceTheme }),
  setSelectedDiceColor: (selectedDiceColor) => set({ selectedDiceColor }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFocusedItem: (focusedItem) => set({ focusedItem }),
  setInspectingItem: (inspectingItem) => set({ inspectingItem }),
  setIsProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  setIsMonsterProfileOpen: (isMonsterProfileOpen) => set({ isMonsterProfileOpen }),
  setIsTransportProfileOpen: (isTransportProfileOpen) => set({ isTransportProfileOpen }),
  setIsCharacterCreatorOpen: (isCharacterCreatorOpen) => set({ isCharacterCreatorOpen }),
  setIsCharacterSpellbookOpen: (isCharacterSpellbookOpen) => set({ isCharacterSpellbookOpen }),
  
  rollDice: (label, modifier, dieType = 20) => {
    import('../dice_roller/diceService').then(({ diceService }) => {
      const notation = `1d${dieType}${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
      const result = diceService.rollBackground(notation, label);
      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
    });
  },

  rollDice3D: async (notation, label, theme, color) => {
    const { diceService } = await import('../dice_roller/diceService');
    const { selectedDiceTheme, selectedDiceColor } = get();
    try {
      const result = await diceService.roll3D(notation, label, theme || selectedDiceTheme, color || selectedDiceColor);
      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
      
      // Auto-clear 3D dice after a delay
      setTimeout(() => {
        diceService.clear();
      }, 5000);
    } catch (error) {
      console.error("3D Roll failed, falling back to background", error);
      const result = diceService.rollBackground(notation, label);
      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
    }
  },

  removeRoll: (id) => set((state) => ({
    recentRolls: state.recentRolls.filter(r => r.id !== id)
  })),

  clearRoll: () => {
    set({ recentRolls: [] });
    import('../dice_roller/diceService').then(({ diceService }) => {
      diceService.clear();
    });
  },
  setIsDiceReady: (isDiceReady) => set({ isDiceReady }),
  
  setIsGameStarted: (isGameStarted) => set({ isGameStarted }),

  // Audio Actions
  playSound: (soundId) => {
    console.log(`[useStore] Playing sound: ${soundId}`);
  },

  updateLayerVolume: (layerId, volume) => set((state) => {
    const newState = {
      layerStates: {
        ...state.layerStates,
        [layerId]: { ...state.layerStates[layerId], volume }
      }
    };
    // Sync with sound engine
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerVolume(layerId, volume);
    });
    return newState;
  }),

  toggleLayerMute: (layerId) => set((state) => {
    const isMuted = !state.layerStates[layerId].isMuted;
    const newState = {
      layerStates: {
        ...state.layerStates,
        [layerId]: { ...state.layerStates[layerId], isMuted }
      }
    };
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerMute(layerId, isMuted);
    });
    return newState;
  }),

  toggleLayerSolo: (layerId) => set((state) => {
    const isSolo = !state.layerStates[layerId].isSolo;
    const newLayerStates = { ...state.layerStates };
    newLayerStates[layerId] = { ...newLayerStates[layerId], isSolo };
    
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerSolo(layerId, isSolo);
    });
    
    return { layerStates: newLayerStates };
  }),

  stopAllAudio: () => {
    set({ isMusicPlaying: false });
    import('../services/soundService').then(({ soundService }) => {
      soundService.stopAll();
    });
  },

  setMusicPlaying: (isMusicPlaying) => set({ isMusicPlaying }),

  setHueState: (updates) => set((state) => ({
    hueState: { ...state.hueState, ...updates }
  })),

  addLog: (message, type = 'info') => set((state) => ({
    logs: [{
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now()
    }, ...state.logs].slice(0, 50)
  })),

  clearLogs: () => set({ logs: [] }),

  loadList: async (tab) => {
    const targetTab = tab || get().explorerTab;
    set({ isLoadingList: true });
    try {
      if (targetTab === 'enemies') {
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
      } else if (targetTab === 'materials') {
        const [list, categories] = await Promise.all([
          fetchMaterialsList(),
          fetchMaterialCategories()
        ]);
        set({ materialsList: list as any, materialCategories: categories });
      } else if (targetTab === 'equipment') {
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
      } else if (targetTab === 'key') {
        set({ keyItemsList: [
          { name: 'Ancient Relic', index: 'ancient-relic' },
          { name: 'Dragon Key', index: 'dragon-key' },
          { name: 'Mysterious Map', index: 'mysterious-map' }
        ]});
      } else if (targetTab === 'books') {
        set({ booksList: [
          { id: 't-lore', title: 'Tome of Ancient Lore', index: 'tome-lore', language: 'common', author: 'Archmage Kaelen', type: 'book', description: 'A dusty volume containing basic magical theory.' },
          { id: 'aj-1', title: 'Journal of the Artificer', index: 'artificer-journal', language: 'common', author: 'Unknown', type: 'scroll', description: 'Scattered notes about soul-binding and gear modification.' },
          { id: 'ab-1', title: 'Bestiary of the Arcane', index: 'arcane-bestiary', language: 'common', author: 'Huntress Vira', type: 'atlas', description: 'Field notes on creatures affected by the rift.' },
          { id: 'ap-1', title: 'Abyssal Prophecies', index: 'abyssal-prophecies', language: 'abyssal', author: 'The Mad Cultist', type: 'book', description: 'The whispers of the void are written here. Only those who speak the tongue of demons can decode the secrets of the dark.' }
        ] as any});
      } else if (targetTab === 'spells') {
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
      } else if (targetTab === 'transport') {
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
        npcList
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
        fetchNPCList()
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

        catEquipmentIndices.forEach((itemIndex: string) => {
          const group = groupedMap.get(itemIndex);
          if (group) {
            totalAssets += Object.keys(group.versions).length;
            resolvedEquipment.push(group);
          } else {
            totalAssets += 1;
            resolvedEquipment.push({ index: itemIndex, name: itemIndex });
          }
        });

        return { ...cat, totalAssets, equipment: resolvedEquipment };
      });

      const enrichedMaterialCategories = materialCategories.map(cat => {
        const catMaterialIndices = cat.materials || [];
        const resolvedMaterials: any[] = [];
        catMaterialIndices.forEach((itemIndex: string) => {
          const mat = materials.find((m: any) => m.index === itemIndex);
          if (mat) resolvedMaterials.push(mat);
          else resolvedMaterials.push({ index: itemIndex, name: itemIndex });
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

  selectItem: async (index: string) => {
    const { explorerTab } = get();
    set({ isLoadingItem: true });
    try {
      let data = null;
      if (explorerTab === 'enemies') {
        data = await fetchMonsterData(index);
      } else if (explorerTab === 'materials') {
        data = await fetchMaterialData(index);
      } else if (explorerTab === 'equipment') {
        data = await fetchEquipmentData(index);
        if (!data) {
          data = await fetchMagicItemData(index);
        }
      } else if (explorerTab === 'key') {
        const mockKeys: Record<string, any> = {
          'ancient-relic': { name: 'Ancient Relic', index: 'ancient-relic', desc: ['A glowing artifact from a forgotten era.'], isKeyItem: true, weight: 2, imageUrl: 'https://picsum.photos/seed/relic/400/600' },
          'dragon-key': { name: 'Dragon Key', index: 'dragon-key', desc: ['A heavy iron key shaped like a dragon.'], isKeyItem: true, weight: 1, imageUrl: 'https://picsum.photos/seed/key/400/600' },
          'mysterious-map': { name: 'Mysterious Map', index: 'mysterious-map', desc: ['A tattered map showing hidden paths.'], isKeyItem: true, weight: 0.5, imageUrl: 'https://picsum.photos/seed/map/400/600' }
        };
        data = mockKeys[index];
      } else if (explorerTab === 'books') {
        const mockBooks: Record<string, any> = {
          'tome-lore': { name: 'Tome of Ancient Lore', index: 'tome-lore', desc: ['A thick book filled with forgotten history.'], isBook: true, weight: 5, imageUrl: 'https://picsum.photos/seed/book1/400/600' },
          'artificer-journal': { name: 'Journal of the Artificer', index: 'artificer-journal', desc: ['Personal notes on magical inventions.'], isBook: true, weight: 2, imageUrl: 'https://picsum.photos/seed/book2/400/600' },
          'arcane-bestiary': { name: 'Bestiary of the Arcane', index: 'arcane-bestiary', desc: ['A guide to magical creatures.'], isBook: true, weight: 4, imageUrl: 'https://picsum.photos/seed/book3/400/600' }
        };
        data = mockBooks[index];
      } else if (explorerTab === 'spells') {
        const { fetchSpellData } = await import('../services/storageService');
        data = await fetchSpellData(index);
      } else if (explorerTab === 'transport') {
        data = await fetchTransportData(index);
      }
      
      if (data) {
        set({ selectedItem: { ...data, _type: explorerTab } });
      }
    } finally {
      set({ isLoadingItem: false });
    }
  },

  addToPreview: (item) => set((state) => ({ 
    activeCards: [...state.activeCards, { ...item }],
    viewMode: 'combat'
  })),

  removeFromPreview: (index) => set((state) => ({
    activeCards: state.activeCards.filter((_, i) => i !== index)
  })),

  clearPreview: () => set({ activeCards: [] }),

  updateSelectedItem: (item) => {
    set({ selectedItem: item });
    get().loadList();
  }
}));
