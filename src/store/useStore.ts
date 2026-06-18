import { create } from 'zustand';
import { useAtlasStore, ExplorerTab } from './useAtlasStore';

export type { ExplorerTab };
export type { UserProfile } from './useAuthStore';

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface AppState {
  // Navigation
  currentView: string;
  explorerTab: ExplorerTab;
  isDevKitOpen: boolean;
  isExplorerOpen: boolean;
  isWorldPanelOpen: boolean;
  isCharacterPanelOpen: boolean;
  dynamicNavButtons: any[]; 
  isAdvancedRollerOpen: boolean;
  isInventoryMenuOpen: boolean;
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
  isJournalOpen: boolean;
  
  searchQuery: string;
  
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

  // Game flow
  isGameStarted: boolean;
  setIsGameStarted: (started: boolean) => void;

  // Actions
  setCurrentView: (view: string) => void;
  setExplorerTab: (tab: ExplorerTab) => void;
  setIsDevKitOpen: (isOpen: boolean) => void;
  setIsExplorerOpen: (isOpen: boolean) => void;
  setIsWorldPanelOpen: (isOpen: boolean) => void;
  setIsCharacterPanelOpen: (isOpen: boolean) => void;
  setDynamicNavButtons: (buttons: any[]) => void;
  setIsAdvancedRollerOpen: (isOpen: boolean) => void;
  setChatExpanded: (expanded: boolean) => void;
  setIsInventoryMenuOpen: (isOpen: boolean) => void;
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
  setIsJournalOpen: (isOpen: boolean) => void;
  
  rollDice: (label: string, modifier: number, dieType?: number) => void;
  rollDice3D: (notation: string, label: string, theme?: string, color?: string) => Promise<void>;
  removeRoll: (id: string) => void;
  clearRoll: () => void;
  setIsDiceReady: (isReady: boolean) => void;
  
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;

  addToPreview: (item: any) => void;
  removeFromPreview: (index: number) => void;
  clearPreview: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentView: 'world',
  explorerTab: 'enemies',
  isDevKitOpen: false,
  isExplorerOpen: true,
  isWorldPanelOpen: false,
  isCharacterPanelOpen: false,
  dynamicNavButtons: [],
  isAdvancedRollerOpen: false,
  isInventoryMenuOpen: false,
  chatExpanded: false,
  isEditingSubMap: false,
  isInsideSubMap: false,
  selectedDiceTheme: 'default',
  selectedDiceColor: '#8b0000',

  isGameStarted: false,
  searchQuery: '',

  focusedItem: null,
  inspectingItem: null,
  
  isProfileMenuOpen: false,
  isMonsterProfileOpen: false,
  isTransportProfileOpen: false,
  isCharacterCreatorOpen: false,
  isCharacterSpellbookOpen: false,
  isJournalOpen: false,

  activeCards: [],
  logs: [],
  isDiceReady: false,
  recentRolls: [],

  setCurrentView: (currentView) => set({ currentView }),
  setExplorerTab: (explorerTab) => {
    set({ explorerTab });
    useAtlasStore.getState().loadList(explorerTab);
  },
  setIsDevKitOpen: (isDevKitOpen) => set({ isDevKitOpen }),
  setIsExplorerOpen: (isExplorerOpen) => set({ isExplorerOpen }),
  setIsWorldPanelOpen: (isWorldPanelOpen) => set({ isWorldPanelOpen }),
  setIsCharacterPanelOpen: (isCharacterPanelOpen) => set({ isCharacterPanelOpen }),
  setDynamicNavButtons: (dynamicNavButtons) => set({ dynamicNavButtons }),
  setIsAdvancedRollerOpen: (isAdvancedRollerOpen) => set({ isAdvancedRollerOpen }),
  setChatExpanded: (chatExpanded) => set({ chatExpanded }),
  setIsInventoryMenuOpen: (isInventoryMenuOpen) => set({ isInventoryMenuOpen }),
  setIsEditingSubMap: (isEditing: boolean) => set({ isEditingSubMap: isEditing }),
  setIsInsideSubMap: (isInside: boolean) => set({ isInsideSubMap: isInside }),
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
  setIsJournalOpen: (isJournalOpen) => set({ isJournalOpen }),
  
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

  addLog: (message, type = 'info') => set((state) => ({
    logs: [{
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now()
    }, ...state.logs].slice(0, 50)
  })),

  clearLogs: () => set({ logs: [] }),

  addToPreview: (item) => set((state) => ({ 
    activeCards: [...state.activeCards, { ...item }]
  })),

  removeFromPreview: (index) => set((state) => ({
    activeCards: state.activeCards.filter((_, i) => i !== index)
  })),

  clearPreview: () => set({ activeCards: [] }),
}));
