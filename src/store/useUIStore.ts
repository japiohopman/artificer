import { create } from 'zustand';

export type ExplorerTab = 'enemies' | 'materials' | 'equipment' | 'key' | 'books' | 'spells' | 'transport' | 'gods';

interface UIState {
  // Navigation
  gameMode: 'exploration' | 'combat';
  activeBottomHub: 'chat' | 'legend' | 'actions';
  viewMode: 'combat' | 'collection';
  currentView: string;
  explorerTab: ExplorerTab;
  isDevKitOpen: boolean;
  isExplorerOpen: boolean;
  isJournalOpen: boolean;
  isWorldPanelOpen: boolean;
  isCharacterPanelOpen: boolean;
  activeCharacterTab: 'equipment' | 'inventory' | 'stats' | 'logistics' | 'party';
  dynamicNavButtons: any[]; 
  isAdvancedRollerOpen: boolean;
  chatExpanded: boolean;
  isEditingSubMap: boolean;
  isInsideSubMap: boolean;
  isMapLegendOpen: boolean;
  isMapPanEnabled: boolean;
  isGridVisible: boolean;
  selectedDiceTheme: string;
  selectedDiceColor: string;

  // Loading State
  isLoading: boolean;
  loadingMessage: string;
  loadingArt: string | null;
  
  // App UI State
  isProfileMenuOpen: boolean;
  isMonsterProfileOpen: boolean;
  isTransportProfileOpen: boolean;
  isCharacterCreatorOpen: boolean;
  isCharacterSpellbookOpen: boolean;
  isSettingsOpen: boolean;
  isGameOver: boolean;
  searchQuery: string;

  // Targeting State
  isTargeting: boolean;
  targetingAction: any | null;
  
  // Focus View
  focusedItem: any | null;
  inspectingItem: { 
    item: any; 
    sourceId: string; 
    index?: number; 
    itemId?: string;
    slot?: string;
  } | null;
  itemActionMenu: {
    item: any;
    sourceId: string;
    index?: number;
    slot?: string;
    position: { x: number; y: number };
  } | null;

  // Actions
  setViewMode: (mode: 'combat' | 'collection') => void;
  setIsGameOver: (isOpen: boolean) => void;
  setCurrentView: (view: string) => void;
  setExplorerTab: (tab: ExplorerTab) => void;
  setIsDevKitOpen: (isOpen: boolean) => void;
  setIsExplorerOpen: (isOpen: boolean) => void;
  setIsJournalOpen: (isOpen: boolean) => void;
  setIsWorldPanelOpen: (isOpen: boolean) => void;
  setIsCharacterPanelOpen: (isOpen: boolean) => void;
  setActiveCharacterTab: (tab: 'equipment' | 'inventory' | 'stats' | 'logistics' | 'party') => void;
  setDynamicNavButtons: (buttons: any[]) => void;
  setIsAdvancedRollerOpen: (isOpen: boolean) => void;
  setChatExpanded: (expanded: boolean) => void;
  setIsEditingSubMap: (isEditing: boolean) => void;
  setIsInsideSubMap: (isInside: boolean) => void;
  setIsMapLegendOpen: (isOpen: boolean) => void;
  setIsMapPanEnabled: (isEnabled: boolean) => void;
  setIsGridVisible: (isVisible: boolean) => void;
  setSelectedDiceTheme: (theme: string) => void;
  setSelectedDiceColor: (color: string) => void;
  setIsLoading: (isLoading: boolean, message?: string, art?: string) => void;
  
  setSearchQuery: (query: string) => void;
  setGameMode: (mode: 'exploration' | 'combat') => void;
  setActiveBottomHub: (hub: 'chat' | 'legend' | 'actions') => void;
  setFocusedItem: (item: any | null) => void;
  setInspectingItem: (data: { item: any; sourceId: string; index?: number; itemId?: string; slot?: string; } | null) => void;
  setItemActionMenu: (menu: { item: any; sourceId: string; index?: number; slot?: string; position: { x: number; y: number } } | null) => void;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  setIsMonsterProfileOpen: (isOpen: boolean) => void;
  setIsTransportProfileOpen: (isOpen: boolean) => void;
  setIsCharacterCreatorOpen: (isOpen: boolean) => void;
  setIsCharacterSpellbookOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsTargeting: (isTargeting: boolean) => void;
  setTargetingAction: (action: any | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  gameMode: 'exploration',
  activeBottomHub: 'chat',
  viewMode: 'collection',
  currentView: 'world',
  explorerTab: 'enemies',
  isDevKitOpen: false,
  isExplorerOpen: true,
  isJournalOpen: false,
  isWorldPanelOpen: false,
  isCharacterPanelOpen: false,
  activeCharacterTab: 'equipment',
  dynamicNavButtons: [],
  isAdvancedRollerOpen: false,
  chatExpanded: false,
  isEditingSubMap: false,
  isInsideSubMap: false,
  isMapLegendOpen: false,
  isMapPanEnabled: true,
  isGridVisible: true,
  selectedDiceTheme: 'default',
  selectedDiceColor: '#8b0000',

  isLoading: false,
  loadingMessage: 'Loading...',
  loadingArt: null,

  isProfileMenuOpen: false,
  isMonsterProfileOpen: false,
  isTransportProfileOpen: false,
  isCharacterCreatorOpen: false,
  isCharacterSpellbookOpen: false,
  isSettingsOpen: false,
  isGameOver: false,
  searchQuery: '',

  isTargeting: false,
  targetingAction: null,
  
  focusedItem: null,
  inspectingItem: null,
  itemActionMenu: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setGameMode: (gameMode) => set({ gameMode }),
  setActiveBottomHub: (activeBottomHub) => set({ activeBottomHub }),
  setCurrentView: (currentView) => set({ currentView }),
  setExplorerTab: (explorerTab) => {
    set({ explorerTab });
    // Note: loadList should be called from useAtlasStore if needed, or by the component
  },
  setIsDevKitOpen: (isDevKitOpen) => set({ isDevKitOpen }),
  setIsExplorerOpen: (isExplorerOpen) => set({ isExplorerOpen }),
  setIsJournalOpen: (isJournalOpen) => set({ isJournalOpen }),
  setIsWorldPanelOpen: (isWorldPanelOpen) => set({ isWorldPanelOpen }),
  setIsCharacterPanelOpen: (isCharacterPanelOpen) => set({ isCharacterPanelOpen }),
  setActiveCharacterTab: (activeCharacterTab) => set({ activeCharacterTab }),
  setDynamicNavButtons: (dynamicNavButtons) => set({ dynamicNavButtons }),
  setIsAdvancedRollerOpen: (isAdvancedRollerOpen) => set({ isAdvancedRollerOpen }),
  setChatExpanded: (chatExpanded) => set({ chatExpanded }),
  setIsEditingSubMap: (isEditingSubMap) => set({ isEditingSubMap }),
  setIsInsideSubMap: (isInsideSubMap) => set({ isInsideSubMap }),
  setIsMapLegendOpen: (isMapLegendOpen) => set({ isMapLegendOpen }),
  setIsMapPanEnabled: (isMapPanEnabled) => set({ isMapPanEnabled }),
  setIsGridVisible: (isGridVisible) => set({ isGridVisible }),
  setSelectedDiceTheme: (selectedDiceTheme) => set({ selectedDiceTheme }),
  setSelectedDiceColor: (selectedDiceColor) => set({ selectedDiceColor }),
  setIsLoading: (isLoading, message = 'Loading...', art = undefined) => set({ isLoading, loadingMessage: message, loadingArt: art || null }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFocusedItem: (focusedItem) => set({ focusedItem }),
  setInspectingItem: (inspectingItem) => set({ inspectingItem }),
  setItemActionMenu: (itemActionMenu) => set({ itemActionMenu }),
  setIsProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  setIsMonsterProfileOpen: (isMonsterProfileOpen) => set({ isMonsterProfileOpen }),
  setIsTransportProfileOpen: (isTransportProfileOpen) => set({ isTransportProfileOpen }),
  setIsCharacterCreatorOpen: (isCharacterCreatorOpen) => set({ isCharacterCreatorOpen }),
  setIsCharacterSpellbookOpen: (isCharacterSpellbookOpen) => set({ isCharacterSpellbookOpen }),
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setIsGameOver: (isGameOver) => set({ isGameOver }),
  setIsTargeting: (isTargeting) => set({ isTargeting }),
  setTargetingAction: (targetingAction) => set({ targetingAction }),
}));

if (typeof window !== 'undefined') {
  (window as any).useUIStore = useUIStore;
}
