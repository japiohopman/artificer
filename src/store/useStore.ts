import { create } from 'zustand';
import { Monster } from '../services/ai/monsterService';
import { AudioLayer, LayerState } from '../types/audio.ts';
import { ItemInstance, InventoryContainer, InventorySlot } from '../types/inventory';
import { getPackContents } from '../lib/itemPacks';
import { 
  fetchMonsterList, fetchMonsterData, fetchMonsterCategories, fetchMonsterCategoryMapping,
  fetchMaterialsList, fetchMaterialData, fetchMaterialCategoryMapping, fetchMaterialCategories,
  fetchEquipmentList, fetchEquipmentData, fetchEquipmentCategoryMapping, fetchEquipmentCategories,
  fetchMagicItemList, fetchMagicItemData,
  fetchNPCList, fetchNPCData, playSlotSound,
  fetchTransportList, fetchTransportData
} from '../services/storageService';

export type ExplorerTab = 'enemies' | 'materials' | 'equipment' | 'key' | 'books' | 'spells' | 'transport';

export type Emotion = 'Neutral' | 'Curious' | 'Skeptical' | 'Happy' | 'Greedy' | 'Angry' | 'Sad' | 'Surprised' | 'Proud';

export interface SavedLocation {
  id: string;
  name: string;
  category: string;
}

export const CategoryIcons: Record<string, { icon: string, color: string }> = {
  city: { icon: 'city', color: '#D4AF37' },
  village: { icon: 'village', color: '#D4AF37' },
  forest: { icon: 'forest', color: '#228B22' },
  wetlands: { icon: 'waters', color: '#4682B4' },
  mountain: { icon: 'mountains', color: '#A9A9A9' },
  underdark: { icon: 'death', color: '#4B0082' }
};

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

export interface Character {
  id: string;
  saveVersion?: number;
  name: string;
  class: string;
  race: string;
  subrace?: string;
  subclass?: string;
  gender: 'Male' | 'Female';
  level: number;
  xp: number;
  alignment: string;
  background: string;
  isNpc?: boolean;
  isRecruitable?: boolean;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  proficiencies: string[]; // List of skill names character is proficient in
  traits: string[];
  features: { name: string; index: string; desc: string; source: string }[];
  flaws: string[];
  ideals: string[];
  bonds: string[];
  backstory: string;
  languages: string[];
  appearance: {
    hairColor: string;
    hairStyle: string;
    bodyType: string;
    eyeColor: string;
    skinColor: string;
    height: string;
    weight: string;
    size?: 'Tiny' | 'Small' | 'Medium' | 'Large';
    specialFeatures?: string[];
  };
  
  // Inventory v1 (Legacy)
  inventory: Record<string, any | null>;
  backpack: any[];
  
  // Inventory v2 (Registry/Slot based)
  items?: Record<string, ItemInstance>;
  containers?: Record<string, InventoryContainer>;
  equipment?: {
    containerId: string;
    slots: InventorySlot[];
  };

  knownSpells: any[];
  preparedSpells: string[]; // spell indices
  spellSlots: Record<string, { current: number; max: number }>;
  spellcastingAbility?: string;
  concentrationSpellId?: string | null;
  choices: Record<string, string[]>;
  hp: number;
  maxHp: number;
  money: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  imageUrl?: string;
  avatarUrl?: string;
  matrixUrl?: string;
  dataPath?: string;
  conditions?: string[];
  actionEconomy?: {
    actions: { current: number; max: number };
    bonusActions: { current: number; max: number };
    reactions: { current: number; max: number };
    movement: { current: number; max: number };
    objectInteractions: { current: number; max: number };
  };
}

export const SKILL_LIST = [
  { name: 'Acrobatics', ability: 'dex', description: 'Stay on your feet in a tricky situation, or perform an acrobatic stunt.' },
  { name: 'Animal Handling', ability: 'wis', description: 'Calm or train an animal, or get an animal to behave in a certain way.' },
  { name: 'Arcana', ability: 'int', description: 'Recall lore about spells, magic items, and the planes of existence.' },
  { name: 'Athletics', ability: 'str', description: 'Jump farther than normal, stay afloat in rough water, or break something.' },
  { name: 'Deception', ability: 'cha', description: 'Tell a convincing lie, or wear a disguise convincingly.' },
  { name: 'History', ability: 'int', description: 'Recall lore about historical events, people, nations, and cultures.' },
  { name: 'Insight', ability: 'wis', description: 'Discern a person’s mood and intentions.' },
  { name: 'Intimidation', ability: 'cha', description: 'Awe or threaten someone into doing what you want.' },
  { name: 'Investigation', ability: 'int', description: 'Find obscure information in books, or deduce how something works.' },
  { name: 'Medicine', ability: 'wis', description: 'Diagnose an illness, or determine what killed the recently slain.' },
  { name: 'Nature', ability: 'int', description: 'Recall lore about terrain, plants, animals, and weather.' },
  { name: 'Perception', ability: 'wis', description: 'Using a combination of senses, notice something that’s easy to miss.' },
  { name: 'Performance', ability: 'cha', description: 'Act, tell a story, perform music, or dance.' },
  { name: 'Persuasion', ability: 'cha', description: 'Honestly and graciously convince someone of something.' },
  { name: 'Religion', ability: 'int', description: 'Recall lore about gods, religious rituals, and holy symbols.' },
  { name: 'Sleight of Hand', ability: 'dex', description: 'Pick a pocket, conceal a handheld object, or perform legerdemain.' },
  { name: 'Stealth', ability: 'dex', description: 'Escape notice by moving quietly and hiding behind things.' },
  { name: 'Survival', ability: 'wis', description: 'Follow tracks, forage, find a trail, or avoid natural hazards.' }
] as const;

interface AppState {
  // Navigation
  viewMode: 'combat' | 'collection';
  currentView: string;
  explorerTab: ExplorerTab;
  isDevKitOpen: boolean;
  isExplorerOpen: boolean;
  isWorldPanelOpen: boolean;
  isCharacterPanelOpen: boolean;
  dynamicNavButtons: any[]; // Using any for simplicity in store to avoid circular imports, but interface is NavAction
  isAdvancedRollerOpen: boolean;
  chatExpanded: boolean;
  isEditingSubMap: boolean;
  isInsideSubMap: boolean;
  selectedDiceTheme: string;
  selectedDiceColor: string;
  
  // World State
  currentLocation: any | null;
  currentSubLocation: any | null;
  currentShop: any | null;
  partyLocation: any | null;
  savedLocations: any[];
  gameTime: number;
  gameDay: number;
  isNight: () => boolean;

  // NPC State
  currentNPC: any | null;
  emotion: Emotion;
  beastRegistry: Record<string, any>;
  testAnimalInteraction: {
    active: boolean;
    animals: string[];
    currentAnimalIndex: number;
    frameIndex: number;
    url: string;
  } | null;

  // Party & Characters
  characters: Character[]; // Active Party (Max 6)
  mainCharacterSlots: (Character | null)[]; // The 3 save manifest slots
  activeCharacterId: string;
  isProfileMenuOpen: boolean;
  isMonsterProfileOpen: boolean;
  isTransportProfileOpen: boolean;
  isCharacterCreatorOpen: boolean;
  
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
  
  // Inventory & Party
  isInventoryOpen: boolean;
  isInventoryMenuOpen: boolean;
  partyInventory: any[];
  partyVehicles: any[];
  partyStats: {
    memberCount: number;
    baseCapacityPerMember: number;
    vehicleCapacityBonus: number;
    currencyWeightPerCoin: number; // typically 0.02 lb (50 coins = 1 lb)
  };

  // Simulator
  activeCards: any[];
  deleteCharacter: (id: string) => Promise<boolean>;

  // Logs
  logs: LogEntry[];

  // Dice Rolls
  isDiceReady: boolean;
  recentRolls: any[];
  levelUpQueue: {
    characterId: string;
    newLevel: number;
    features: any[];
    hpIncrease: number;
    hasASI: boolean;
  }[];

  classLevelingData: Record<string, Record<number, any>>; // { classIndex: { level: levelData } }

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
  setPartySubLocation: (location: any) => void;
  setSelectedDiceTheme: (theme: string) => void;
  setSelectedDiceColor: (color: string) => void;
  
  setSearchQuery: (query: string) => void;
  setFocusedItem: (item: any | null) => void;
  setInspectingItem: (data: { item: any; sourceId: string; index?: number; itemId?: string; slot?: string; } | null) => void;
  setIsInventoryOpen: (isOpen: boolean) => void;
  setIsInventoryMenuOpen: (isOpen: boolean) => void;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  setIsMonsterProfileOpen: (isOpen: boolean) => void;
  setIsTransportProfileOpen: (isOpen: boolean) => void;
  setIsCharacterCreatorOpen: (isOpen: boolean) => void;
  isCharacterSpellbookOpen: boolean;
  setIsCharacterSpellbookOpen: (isOpen: boolean) => void;
  setActiveCharacter: (id: string) => void;
  setMainCharacter: (char: Character) => void;
  reorderCharacters: (startIndex: number, endIndex: number) => void;
  rollDice: (label: string, modifier: number, dieType?: number) => void;
  rollDice3D: (notation: string, label: string, theme?: string, color?: string) => Promise<void>;
  removeRoll: (id: string) => void;
  clearRoll: () => void;
  setIsDiceReady: (isReady: boolean) => void;
  addToBackpack: (item: any) => void;
  removeFromBackpack: (index: number) => void;
  equipItem: (item: any, slot: string) => void;
  unequipItem: (slot: string) => void;
  updatePartyStats: (stats: Partial<AppState['partyStats']>) => void;
  transferItem: (params: { sourceId: string; targetId: string; itemId: string }) => void;
  addToPartyInventory: (item: any) => void;
  removeFromPartyInventory: (itemId: string) => void;
  addVehicle: (vehicle: any) => void;
  removeVehicle: (index: number) => void;
  
  // Character Actions
  addXp: (id: string, amount: number) => Promise<void>;
  dismissLevelUp: () => void;
  updateCharacterStats: (id: string, stats: Partial<Character['stats']>) => void;
  
  // NPC/Emotion Actions
  setEmotion: (emotion: Emotion) => void;
  setTestAnimalInteraction: (interaction: any) => void;
  getActiveBackground: () => string;
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;

  // Time Actions
  advanceTime: (minutes: number) => void;

  // Audio Actions
  playSound: (soundId: string) => void;

  // Spell Actions
  learnSpell: (spell: any) => void;
  forgetSpell: (spellIndex: string) => void;
  prepareSpell: (spellIndex: string) => void;
  unprepareSpell: (spellIndex: string) => void;
  castSpell: (spellIndex: string, level: number) => boolean;
  restoreSlots: (isLongRest: boolean) => void;
  
  // Action Economy
  consumeAction: (characterId: string, type: 'actions' | 'bonusActions' | 'reactions' | 'objectInteractions') => void;
  consumeMovement: (characterId: string, amount: number) => void;
  restoreActionEconomy: (characterId: string, isLongRest?: boolean) => void;
  useActionSurge: (characterId: string) => void;
  
  // Character Management
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  setCharacters: (chars: Character[]) => void;
  setMainCharacterSlots: (slots: (Character | null)[]) => void;
  loadCharacters: () => Promise<void>;
  
  // Leveled Data
  loadLeveledData: (classIndex: string, levels: number[]) => Promise<void>;
  
  // Async Actions
  loadList: (tab?: ExplorerTab) => Promise<void>;
  loadAllLists: () => Promise<void>;
  selectItem: (index: string) => Promise<void>;
  addToPreview: (item: any) => void;
  removeFromPreview: (index: number) => void;
  clearPreview: () => void;
  updateSelectedItem: (item: any) => void;
}

const DEFAULT_CHARACTERS: Character[] = [
  { 
    id: 'char-1', 
    name: 'Artificer Prime', 
    class: 'Battle Smith',
    race: 'High Elf',
    level: 12,
    xp: 125000,
    alignment: 'Lawful Neutral',
    background: 'Master Crafter',
    stats: { str: 10, dex: 16, con: 14, int: 20, wis: 12, cha: 8 },
    proficiencies: ['Arcana', 'History', 'Investigation', 'Perception'],
    traits: ['Clockwork Precision', 'Magical Tinkering'],
    features: [
      { name: 'Steel Defender Command', index: 'steel-defender', desc: 'Can command your primal mechanical companion.', source: 'Class' },
      { name: 'Infuse Item', index: 'infuse-item', desc: 'Can imbue magic into mundane objects.', source: 'Class' }
    ],
    flaws: ['Perfectionist to a fault', 'Socially distant'],
    ideals: ['Innovation', 'Logic'],
    bonds: ['The Forge of Creation'],
    backstory: 'The original consciousness that birthed the Arcane Codex. A master of blending soul with steel.',
    languages: ['common', 'elvish', 'gnomish', 'celestial'],
    appearance: {
      hairColor: 'Silver-Blue',
      hairStyle: 'Tight Ponytail',
      bodyType: 'Slender/Athletic',
      eyeColor: 'Luminous Gold',
      skinColor: '#E6D5B0',
      height: '6\'2"',
      weight: '165 lbs',
      size: 'Medium',
      specialFeatures: []
    },
    gender: 'Male',
    money: { cp: 0, sp: 0, ep: 0, gp: 1250, pp: 5 },
    hp: 85,
    maxHp: 85,
    conditions: [],
    actionEconomy: {
      actions: { current: 1, max: 1 },
      bonusActions: { current: 1, max: 1 },
      reactions: { current: 1, max: 1 },
      movement: { current: 30, max: 30 },
      objectInteractions: { current: 1, max: 1 }
    },
    inventory: {},
    backpack: [],
    // Registry v2
    items: {
      "warhammer_1": { id: "warhammer_1", template: "warhammer", quantity: 1, kind: "weapon" },
      "half_plate_1": { id: "half_plate_1", template: "half-plate", quantity: 1, kind: "armor" },
      "smiths_tools_1": { id: "smiths_tools_1", template: "smiths-tools", quantity: 1, kind: "tool" },
      "book_1": { id: "book_1", template: "book", quantity: 1, kind: "book" }
    },
    containers: {
      "backpack_char1": {
        id: "backpack_char1",
        type: "backpack",
        slots: [
          { id: "bag_0", itemId: "smiths_tools_1" },
          { id: "bag_1", itemId: "book_1" },
          { id: "bag_2", itemId: null },
          { id: "bag_3", itemId: null }
        ]
      }
    },
    equipment: {
      containerId: "equipment_char1",
      slots: [
        { id: "main_hand", itemId: "warhammer_1" },
        { id: "off_hand", itemId: null },
        { id: "chest", itemId: "half_plate_1" }
      ]
    },
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {
       "1": { current: 2, max: 2 }
    },
    spellcastingAbility: 'int',
    choices: {},
    avatarUrl: 'https://picsum.photos/seed/artificer_avatar/200/200'
  },
  {
    id: 'char-2',
    saveVersion: 2,
    name: 'Shadow Whisper',
    class: 'Rogue',
    race: 'Tabaxi',
    level: 0,
    xp: 0,
    alignment: 'Chaotic Neutral',
    background: 'Criminal',
    stats: { str: 8, dex: 17, con: 12, int: 13, wis: 10, cha: 15 },
    proficiencies: ['Acrobatics', 'Deception', 'Perception', 'Sleight of Hand', 'Stealth'],
    traits: ['Feline Agility', 'Cat\'s Claws'],
    features: [
      { name: 'Expertise', index: 'rogue-expertise-1', desc: 'Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.', source: 'Class' },
      { name: 'Sneak Attack', index: 'sneak-attack', desc: 'Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll.', source: 'Class' },
      { name: 'Thieves\' Cant', index: 'thieves-cant', desc: 'A secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.', source: 'Class' }
    ],
    flaws: ['I can\'t resist a shiny trinket.'],
    ideals: ['Freedom'],
    bonds: ['I owe my life to the guildmaster.'],
    backstory: 'A quick-pawed thief who escaped the slums and now seeks fortune in the unknown.',
    languages: ['common', 'thieves-cant'],
    appearance: {
      hairColor: 'Calico',
      hairStyle: 'Short Fur',
      bodyType: 'Lean',
      eyeColor: 'Jade',
      skinColor: 'Fur',
      height: '5\'10"',
      weight: '140 lbs',
      size: 'Medium',
      specialFeatures: []
    },
    gender: 'Female',
    money: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
    hp: 9,
    maxHp: 9,
    conditions: [],
    actionEconomy: {
      actions: { current: 1, max: 1 },
      bonusActions: { current: 1, max: 1 },
      reactions: { current: 1, max: 1 },
      movement: { current: 30, max: 30 },
      objectInteractions: { current: 1, max: 1 }
    },
    inventory: {
      "main-hand": { id: "rogue-dagger", name: "Dagger", index: "dagger", _type: "equipment", weight: 1, slot: "main-hand", damage: { damage_dice: "1d4", damage_type: { name: "Piercing" } }, properties: [{ index: "finesse", name: "Finesse" }] },
      "chest": { id: "rogue-armor", name: "Leather Armor", index: "leather-armor", _type: "equipment", weight: 10, slot: "chest", armor_class: { base: 11, dex_bonus: true } },
    },
    backpack: [
      { id: "rogue-tools", name: "Thieves' Tools", index: "thieves-tools", weight: 1 }
    ],
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {},
    choices: {
      expertise: ['Stealth', 'Sleight of Hand']
    },
    avatarUrl: 'https://picsum.photos/seed/rogue_avatar/200/200'
  }
];

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

  currentLocation: null,
  currentSubLocation: null,
  currentShop: null,
  partyLocation: null,
  savedLocations: [],
  gameTime: 480, // 8:00 AM
  gameDay: 1,
  isNight: () => {
    const time = get().gameTime;
    return time < 360 || time > 1200; // Night between 8 PM and 6 AM
  },

  currentNPC: null,
  emotion: 'Neutral',
  beastRegistry: {},
  testAnimalInteraction: null,

  characters: [],
  mainCharacterSlots: [null, null, null],
  activeCharacterId: '',

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
  
  isInventoryOpen: false,
  isInventoryMenuOpen: false,
  isProfileMenuOpen: false,
  isMonsterProfileOpen: false,
  isTransportProfileOpen: false,
  isCharacterCreatorOpen: false,
  isCharacterSpellbookOpen: false,
  partyInventory: [],
  partyVehicles: [],
  partyStats: {
    memberCount: 6,
    baseCapacityPerMember: 150,
    vehicleCapacityBonus: 0,
    currencyWeightPerCoin: 0.02,
  },

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
  levelUpQueue: [],
  classLevelingData: {},

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
  setPartySubLocation: (partyLocation) => set({ partyLocation }),
  setSelectedDiceTheme: (selectedDiceTheme) => set({ selectedDiceTheme }),
  setSelectedDiceColor: (selectedDiceColor) => set({ selectedDiceColor }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFocusedItem: (focusedItem) => set({ focusedItem }),
  setInspectingItem: (inspectingItem) => set({ inspectingItem }),
  setIsInventoryOpen: (isInventoryOpen) => set({ isInventoryOpen }),
  setIsInventoryMenuOpen: (isInventoryMenuOpen) => set({ isInventoryMenuOpen }),
  setIsProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  setIsMonsterProfileOpen: (isMonsterProfileOpen) => set({ isMonsterProfileOpen }),
  setIsTransportProfileOpen: (isTransportProfileOpen) => set({ isTransportProfileOpen }),
  setIsCharacterCreatorOpen: (isCharacterCreatorOpen) => set({ isCharacterCreatorOpen }),
  setIsCharacterSpellbookOpen: (isCharacterSpellbookOpen) => set({ isCharacterSpellbookOpen }),
  setActiveCharacter: (id) => set({ activeCharacterId: id }),
  setMainCharacter: (char) => set((state) => {
    const newChars = [...state.characters];
    newChars[0] = char; // Index 0 is always the Hero
    return { 
      characters: newChars,
      activeCharacterId: state.activeCharacterId || char.id
    };
  }),
  
  reorderCharacters: (startIndex, endIndex) => {
    // Slot 1 (index 0) remains fixed as the head character
    if (startIndex === 0 || endIndex === 0) return;
    
    set((state) => {
      const newChars = [...state.characters];
      const [removed] = newChars.splice(startIndex, 1);
      newChars.splice(endIndex, 0, removed);
      return { characters: newChars };
    });
  },

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
    // Sound implementation would go here or call soundService
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
    
    // If we just enabled solo on this layer, mute others? 
    // Or just let the sound engine handle the solo logic
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

  addToBackpack: (item) => set((state) => {
    const packContents = getPackContents(item.index || item.name);
    const itemsToAdd = packContents 
      ? packContents.map(c => ({ index: c.template, name: c.template, quantity: c.quantity }))
      : [item];

    return {
      characters: state.characters.map(char => {
        if (char.id !== state.activeCharacterId) return char;
        
        const updatedChar = { ...char };
        
        if (char.saveVersion === 2) {
          const items = { ...(char.items || {}) };
          const containers = { ...(char.containers || {}) };
          const backpack = Object.values(containers).find(c => c.type === 'backpack');
          if (!backpack) return char;

          itemsToAdd.forEach(toAdd => {
            const template = toAdd.index || toAdd.name;
            const existingId = backpack.slots.find(s => s.itemId && items[s.itemId].template === template)?.itemId;
            
            if (existingId) {
              items[existingId] = { ...items[existingId], quantity: (items[existingId].quantity || 1) + (toAdd.quantity || 1) };
            } else {
              const newId = crypto.randomUUID();
              items[newId] = {
                id: newId,
                template,
                quantity: toAdd.quantity || 1,
                addedAt: Date.now()
              };
              const slot = backpack.slots.find(s => s.itemId === null);
              if (slot) slot.itemId = newId;
            }
          });
          return { ...updatedChar, items, containers };
        }

        // v1 logic
        const newBackpack = [...char.backpack];
        itemsToAdd.forEach(toAdd => {
          const existingItemIndex = newBackpack.findIndex(i => (i.index && i.index === toAdd.index) || (i.name === toAdd.name));
          if (existingItemIndex > -1) {
            const existingItem = { ...newBackpack[existingItemIndex] };
            existingItem.quantity = (existingItem.quantity || 1) + (toAdd.quantity || 1);
            newBackpack[existingItemIndex] = existingItem;
          } else {
            newBackpack.push({ ...toAdd, id: crypto.randomUUID(), quantity: toAdd.quantity || 1 });
          }
        });
        
        return { ...updatedChar, backpack: newBackpack };
      })
    };
  }),
  removeFromBackpack: (indexOrItemId) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;

      if (char.saveVersion === 2) {
        // Here indexOrItemId is treated as itemId
        const itemId = indexOrItemId as any;
        const items = { ...(char.items || {}) };
        const containers = { ...(char.containers || {}) };
        const backpack = Object.values(containers).find(c => c.type === 'backpack');
        if (!backpack) return char;

        backpack.slots = backpack.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
        delete items[itemId];
        
        return { ...char, items, containers };
      }

      return { ...char, backpack: char.backpack.filter((_, i) => i === indexOrItemId ? false : true) };
    })
  })),
  equipItem: (itemOrItemId, slotId) => set((state) => {
    const newCharacters = state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;
      
      if (char.saveVersion === 2) {
        const itemId = typeof itemOrItemId === 'string' ? itemOrItemId : itemOrItemId.id;
        const equipment = { ...char.equipment! };
        const containers = { ...char.containers! };
        const backpack = Object.values(containers).find(c => c.type === 'backpack')!;
        
        const targetSlot = equipment.slots.find(s => s.id === slotId);
        if (!targetSlot) return char;

        // If target slot is full, move current item to backpack
        if (targetSlot.itemId) {
          const emptyBagSlot = backpack.slots.find(s => s.itemId === null);
          if (emptyBagSlot) emptyBagSlot.itemId = targetSlot.itemId;
        }

        // Remove from backpack
        backpack.slots = backpack.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
        
        // Put in slot
        targetSlot.itemId = itemId;

        playSlotSound();
        return { ...char, equipment, containers };
      }

      // Legacy v1
      const item = itemOrItemId;
      let newBackpack = char.backpack.filter(i => i.id !== item.id);
      const newInventory = { ...char.inventory };
      const itemSlots = Array.isArray(item.slot) ? item.slot : [slotId];
      
      itemSlots.forEach(s => {
        const existingItem = newInventory[s];
        if (existingItem) {
          const existingSlots = Array.isArray(existingItem.slot) ? existingItem.slot : [s];
          existingSlots.forEach(es => delete newInventory[es]);
          if (!newBackpack.find(i => i.id === existingItem.id)) {
            newBackpack.push(existingItem);
          }
        }
      });

      itemSlots.forEach(s => {
        newInventory[s] = item;
      });

      playSlotSound();

      return { ...char, inventory: newInventory, backpack: newBackpack };
    });

    return { characters: newCharacters };
  }),
  unequipItem: (slotId) => set((state) => {
    const activeChar = state.characters.find(c => c.id === state.activeCharacterId);
    if (!activeChar) return state;

    if (activeChar.saveVersion === 2) {
        return {
          characters: state.characters.map(c => {
            if (c.id !== state.activeCharacterId) return c;
            const equipment = { ...c.equipment! };
            const containers = { ...c.containers! };
            const backpack = Object.values(containers).find(con => con.type === 'backpack')!;
            
            const slot = equipment.slots.find(s => s.id === slotId);
            if (!slot || !slot.itemId) return c;

            const itemId = slot.itemId;
            slot.itemId = null;

            const emptyBagSlot = backpack.slots.find(s => s.itemId === null);
            if (emptyBagSlot) emptyBagSlot.itemId = itemId;

            return { ...c, equipment, containers };
          })
        };
    }

    // Legacy v1
    const item = activeChar.inventory[slotId];
    if (!item) return state;

    const newCharacters = state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;
      
      const newInventory = { ...char.inventory };
      const itemSlots = Array.isArray(item.slot) ? item.slot : [slotId];
      itemSlots.forEach(s => delete newInventory[s]);
      
      return { 
        ...char, 
        inventory: newInventory, 
        backpack: [...char.backpack, item] 
      };
    });

    return { characters: newCharacters };
  }),
  updatePartyStats: (stats) => set((state) => ({
    partyStats: { ...state.partyStats, ...stats }
  })),
  transferItem: ({ sourceId, targetId, itemId }) => set((state) => {
    if (sourceId === targetId) return state;

    let itemToMove: any = null;
    let itemInstance: any = null;
    let newCharacters = [...state.characters];
    let newPartyInventory = [...state.partyInventory];

    // Find and remove item from source
    if (sourceId === 'party') {
      itemToMove = newPartyInventory.find(i => i.id === itemId);
      newPartyInventory = newPartyInventory.filter(i => i.id !== itemId);
    } else {
      const charIndex = newCharacters.findIndex(c => c.id === sourceId);
      if (charIndex !== -1) {
        const char = newCharacters[charIndex];
        
        if (char.saveVersion === 2) {
          itemInstance = { ...char.items?.[itemId] };
          if (itemInstance) {
            // Remove from slots
            const equipment = { ...char.equipment! };
            const containers = { ...char.containers! };
            
            equipment.slots = equipment.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
            Object.values(containers).forEach(c => {
              c.slots = c.slots.map(s => s.itemId === itemId ? { ...s, itemId: null } : s);
            });
            
            // Remove from items registry of source
            const newItems = { ...char.items };
            delete newItems[itemId];
            
            newCharacters[charIndex] = { ...char, equipment, containers, items: newItems };
            itemToMove = itemInstance; // In v2, itemToMove is the instance + some metadata maybe?
            // Note: If moving to another v2 character, we need to preserve metadata or re-fetch it.
          }
        } else {
          itemToMove = char.backpack.find(i => i.id === itemId);
          newCharacters[charIndex] = {
            ...char,
            backpack: char.backpack.filter(i => i.id !== itemId)
          };
        }
      }
    }

    if (!itemToMove) return state;

    // Add item to target (with stacking check)
    if (targetId === 'party') {
      const existingInTargetIndex = newPartyInventory.findIndex(i => (i.index && i.index === (itemToMove.index || itemToMove.template)) || (i.name === itemToMove.name));
      if (existingInTargetIndex > -1) {
        const existingItem = { ...newPartyInventory[existingInTargetIndex] };
        existingItem.quantity = (existingItem.quantity || 1) + (itemToMove.quantity || 1);
        newPartyInventory[existingInTargetIndex] = existingItem;
      } else {
        newPartyInventory.push(itemToMove);
      }
    } else {
      const charIndex = newCharacters.findIndex(c => c.id === targetId);
      if (charIndex !== -1) {
        const char = { ...newCharacters[charIndex] };
        
        if (char.saveVersion === 2) {
          const items = { ...(char.items || {}) };
          const containers = { ...(char.containers || {}) };
          const backpack = Object.values(containers).find(c => c.type === 'backpack');
          
          if (backpack) {
            // Check if item already exists in target (stacking) - using template as key
            const existingId = backpack.slots.find(s => s.itemId && items[s.itemId].template === (itemToMove.template || itemToMove.index))?.itemId;
            
            if (existingId) {
              items[existingId] = { ...items[existingId], quantity: (items[existingId].quantity || 1) + (itemToMove.quantity || 1) };
            } else {
              // Add as new instance
              const newId = itemId.includes('_') ? itemId : `${itemToMove.template || itemToMove.index}_${crypto.randomUUID()}`;
              items[newId] = {
                ...itemToMove,
                id: newId,
                template: itemToMove.template || itemToMove.index,
                quantity: itemToMove.quantity || 1,
                addedAt: Date.now()
              };
              const slot = backpack.slots.find(s => s.itemId === null);
              if (slot) slot.itemId = newId;
            }
            char.items = items;
            char.containers = containers;
          }
        } else {
          const newBackpack = [...char.backpack];
          const existingInTargetIndex = newBackpack.findIndex(i => (i.index && i.index === (itemToMove.index || itemToMove.template)) || (i.name === itemToMove.name));
          
          if (existingInTargetIndex > -1) {
            const existingItem = { ...newBackpack[existingInTargetIndex] };
            existingItem.quantity = (existingItem.quantity || 1) + (itemToMove.quantity || 1);
            newBackpack[existingInTargetIndex] = existingItem;
          } else {
            newBackpack.push(itemToMove);
          }
          char.backpack = newBackpack;
        }
        
        newCharacters[charIndex] = char;
      }
    }

    return { characters: newCharacters, partyInventory: newPartyInventory };
  }),
  addToPartyInventory: (item) => set((state) => {
    const newInventory = [...state.partyInventory];
    const existingIndex = newInventory.findIndex(i => (i.index && i.index === item.index) || (i.name === item.name));
    
    if (existingIndex > -1) {
      const existingItem = { ...newInventory[existingIndex] };
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      newInventory[existingIndex] = existingItem;
    } else {
      newInventory.push({ ...item, id: crypto.randomUUID(), quantity: item.quantity || 1 });
    }
    
    return { partyInventory: newInventory };
  }),
  removeFromPartyInventory: (itemId) => set((state) => ({
    partyInventory: state.partyInventory.filter(i => i.id !== itemId)
  })),

  addVehicle: (vehicle) => set((state) => ({
    partyVehicles: [...state.partyVehicles, { ...vehicle, id: crypto.randomUUID() }]
  })),

  removeVehicle: (index) => set((state) => ({
    partyVehicles: state.partyVehicles.filter((_, i) => i !== index)
  })),

  addXp: async (id, amount) => {
    const { characters } = get();
    const char = characters.find(c => c.id === id);
    if (!char) return;

    const newXp = char.xp + amount;
    
    // Check for level up
    const { processLevelUp } = await import('../lib/characterUtils');
    const levelUpData = await processLevelUp({ ...char, xp: newXp });

    if (levelUpData) {
      set((state) => ({
        characters: state.characters.map(c => c.id === id ? levelUpData.updatedCharacter : c),
        levelUpQueue: [
          ...state.levelUpQueue,
          ...levelUpData.results.map(r => ({
            characterId: id,
            newLevel: r.newLevel,
            features: r.newFeatures,
            hpIncrease: r.hpIncrease,
            hasASI: r.hasASI
          }))
        ]
      }));
    } else {
      set((state) => ({
        characters: state.characters.map(c => c.id === id ? { ...c, xp: newXp } : c)
      }));
    }
  },

  dismissLevelUp: () => set((state) => ({ 
    levelUpQueue: state.levelUpQueue.slice(1) 
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

  setEmotion: (emotion) => set({ emotion }),
  setTestAnimalInteraction: (testAnimalInteraction) => set({ testAnimalInteraction }),
  
  getActiveBackground: () => {
    const state = get();
    if (state.currentShop?.image) return state.currentShop.image;
    if (state.currentSubLocation?.image) return state.currentSubLocation.image;
    if (state.currentLocation?.image) return state.currentLocation.image;
    return '';
  },

  advanceTime: (minutes) => set((state) => {
    let newTime = state.gameTime + minutes;
    let newDay = state.gameDay;
    
    if (newTime >= 1440) {
      newDay += Math.floor(newTime / 1440);
      newTime %= 1440;
    }
    
    return { gameTime: newTime, gameDay: newDay };
  }),

  updateCharacterStats: (id, newStats) => set((state) => ({
    characters: state.characters.map(c => {
      if (c.id !== id) return c;
      
      const oldCon = c.stats.con || 10;
      const newCon = newStats.con !== undefined ? newStats.con : oldCon;
      const oldMod = Math.floor((oldCon - 10) / 2);
      const newMod = Math.floor((newCon - 10) / 2);
      const modDiff = newMod - oldMod;
      const hpAdjust = modDiff * (c.level || 1);

      return { 
        ...c, 
        stats: { ...c.stats, ...newStats },
        hp: c.hp + hpAdjust,
        maxHp: (c.maxHp || 10) + hpAdjust
      };
    })
  })),

  learnSpell: (spell) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;
      const alreadyKnown = (char.knownSpells || []).some(s => s.index === spell.index);
      if (alreadyKnown) return char;
      return { ...char, knownSpells: [...(char.knownSpells || []), spell] };
    })
  })),

  forgetSpell: (spellIndex) => set((state) => ({
    characters: state.characters.map(char => 
      char.id === state.activeCharacterId 
        ? { 
            ...char, 
            knownSpells: (char.knownSpells || []).filter(s => s.index !== spellIndex),
            preparedSpells: (char.preparedSpells || []).filter(idx => idx !== spellIndex)
          }
        : char
    )
  })),

  prepareSpell: (spellIndex) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;
      const isPrepared = (char.preparedSpells || []).includes(spellIndex);
      if (isPrepared) return char;

      // Logic for max prepared spells could go here
      // For now, simple push
      return { ...char, preparedSpells: [...(char.preparedSpells || []), spellIndex] };
    })
  })),

  unprepareSpell: (spellIndex) => set((state) => ({
    characters: state.characters.map(char => 
      char.id === state.activeCharacterId 
        ? { ...char, preparedSpells: (char.preparedSpells || []).filter(idx => idx !== spellIndex) }
        : char
    )
  })),

  castSpell: (spellIndex, level) => {
    const state = get();
    const activeChar = state.characters.find(c => c.id === state.activeCharacterId);
    if (!activeChar) return false;

    const spell = (activeChar.knownSpells || []).find(s => s.index === spellIndex);
    if (!spell) return false;

    // Cantrips don't use slots (level 0)
    if (level === 0) return true;

    const levelStr = level.toString();
    const slots = activeChar.spellSlots?.[levelStr];

    if (!slots || slots.current <= 0) return false;

    set((state) => ({
      characters: state.characters.map(char => {
        if (char.id !== state.activeCharacterId) return char;
        const newSlots = { ...(char.spellSlots || {}) };
        newSlots[levelStr] = { ...newSlots[levelStr], current: newSlots[levelStr].current - 1 };
        
        let concentrationId = char.concentrationSpellId;
        if (spell.concentration) {
          concentrationId = spellIndex;
        }

        return { ...char, spellSlots: newSlots, concentrationSpellId: concentrationId };
      })
    }));

    return true;
  },

  restoreSlots: (isLongRest) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== state.activeCharacterId) return char;

      const newSlots = { ...(char.spellSlots || {}) };
      
      // Long rest restores everything
      if (isLongRest) {
        Object.keys(newSlots).forEach(lvl => {
          newSlots[lvl] = { ...newSlots[lvl], current: newSlots[lvl].max };
        });
      } else {
        // Short rest for Warlocks or Arcane Recovery could go here
        if (char.class?.toLowerCase() === 'warlock') {
          Object.keys(newSlots).forEach(lvl => {
            newSlots[lvl] = { ...newSlots[lvl], current: newSlots[lvl].max };
          });
        }
      }

      return { ...char, spellSlots: newSlots, concentrationSpellId: null };
    })
  })),

  consumeAction: (characterId, type) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== characterId || !char.actionEconomy) return char;
      const current = char.actionEconomy[type].current;
      if (current <= 0) return char;
      
      return {
        ...char,
        actionEconomy: {
          ...char.actionEconomy,
          [type]: { ...char.actionEconomy[type], current: current - 1 }
        }
      };
    })
  })),

  consumeMovement: (characterId, amount) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== characterId || !char.actionEconomy) return char;
      const current = char.actionEconomy.movement.current;
      return {
        ...char,
        actionEconomy: {
          ...char.actionEconomy,
          movement: { ...char.actionEconomy.movement, current: Math.max(0, current - amount) }
        }
      };
    })
  })),

  restoreActionEconomy: (characterId, isLongRest) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== characterId || !char.actionEconomy) return char;
      return {
        ...char,
        actionEconomy: {
          actions: { current: char.actionEconomy.actions.max, max: char.actionEconomy.actions.max },
          bonusActions: { current: char.actionEconomy.bonusActions.max, max: char.actionEconomy.bonusActions.max },
          reactions: { current: char.actionEconomy.reactions.max, max: char.actionEconomy.reactions.max },
          movement: { current: char.actionEconomy.movement.max, max: char.actionEconomy.movement.max },
          objectInteractions: { current: char.actionEconomy.objectInteractions.max, max: char.actionEconomy.objectInteractions.max }
        }
      };
    })
  })),

  useActionSurge: (characterId) => set((state) => ({
    characters: state.characters.map(char => {
      if (char.id !== characterId || !char.actionEconomy) return char;
      // Action Surge adds 1 Action to CURRENT pool
      return {
        ...char,
        actionEconomy: {
          ...char.actionEconomy,
          actions: { ...char.actionEconomy.actions, current: char.actionEconomy.actions.current + 1 }
        }
      };
    })
  })),

  addCharacter: (char) => set((state) => ({ 
    characters: [...state.characters, char] 
  })),
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  setCharacters: (chars) => set({ characters: chars.slice(0, 6) }),
  setMainCharacterSlots: (slots) => set({ mainCharacterSlots: slots }),
  
  deleteCharacter: async (id: string) => {
    try {
      const { saveService } = await import('../services/saveService');
      const success = await saveService.deleteCharacter(id);
      if (success) {
        await get().loadCharacters();
        // If we deleted the active character, clear it
        if (get().activeCharacterId === id) {
           const firstAvailable = get().characters.find(c => c.id !== id);
           if (firstAvailable) get().setActiveCharacter(firstAvailable.id);
        }
      }
      return success;
    } catch (e) {
      console.error("Error deleting character:", e);
      return false;
    }
  },

  loadCharacters: async () => {
    set({ isLoadingSaves: true });
    try {
      const { saveService } = await import('../services/saveService');
      const chars = await saveService.loadCharacters();
      
      const slots: (Character | null)[] = [null, null, null];
      chars.forEach(c => {
        const id = (c.id || '').toLowerCase();
        if (id === 'slot1') slots[0] = c;
        else if (id === 'slot2') slots[1] = c;
        else if (id === 'slot3') slots[2] = c;
      });

      set({ 
        mainCharacterSlots: slots,
      });

      // Pre-load leveled data for all characters in slots
      const { atlasService } = await import('../services/atlasService');
      for (const char of chars) {
          if (char && char.level > 0) {
              const levels = Array.from({ length: char.level }, (_, i) => i + 1);
              await get().loadLeveledData(char.class, levels);
          }
      }
    } finally {
      set({ isLoadingSaves: false });
    }
  },

  loadLeveledData: async (classIndex, levels) => {
    const { classLevelingData } = get();
    const { atlasService } = await import('../services/atlasService');
    const classKey = classIndex.toLowerCase();
    
    let updated = false;
    const newData = { ...classLevelingData };
    if (!newData[classKey]) {
        newData[classKey] = {};
        updated = true;
    }

    for (const lvl of levels) {
        if (!newData[classKey][lvl]) {
            const data = await atlasService.loadLevelData(classIndex, lvl);
            if (data) {
                newData[classKey][lvl] = data;
                updated = true;
            }
        }
    }

    if (updated) {
        set({ classLevelingData: newData });
    }
  },

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
        
        // Build a rich list by merging category data
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
        // Group tiered items
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

        // Enrich categories with total asset counts and resolved items
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
        // Mock key items for now
        set({ keyItemsList: [
          { name: 'Ancient Relic', index: 'ancient-relic' },
          { name: 'Dragon Key', index: 'dragon-key' },
          { name: 'Mysterious Map', index: 'mysterious-map' }
        ]});
      } else if (targetTab === 'books') {
        // Mock books for now
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
        
        // Group spells by school index for smarter loading
        const spellsBySchool: Record<string, any[]> = {};
        list.forEach(spell => {
          // School can be a string or an object with an index
          const schoolRef = spell.school;
          const schoolIndex = typeof schoolRef === 'string' ? schoolRef.toLowerCase() : (schoolRef?.index || schoolRef?.name?.toLowerCase() || 'unknown');
          
          if (!spellsBySchool[schoolIndex]) {
            spellsBySchool[schoolIndex] = [];
          }
          spellsBySchool[schoolIndex].push(spell);
          
          // Map spell index to school name for easy lookup
          mapping[spell.index] = typeof schoolRef === 'string' ? schoolRef : (schoolRef?.name || schoolIndex);
        });

        // Enrich school metadata using our dynamic mapping
        const enrichedSchools = schools.map(school => {
          const schoolSpells = spellsBySchool[school.index] || [];
          return { ...school, spells: schoolSpells };
        });

        // Add any missing schools that appeared in the spells but weren't in the official schools list
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

      // Enrich categories with total asset counts and resolved items
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

      // Enrich material categories with resolved items
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

      // Build a rich monster list
      const richMonsters = monsters.map(item => {
        const categoryItem = monsterCategories
          .flatMap(c => c.monsters || [])
          .find(m => m.index === item.index);
        return categoryItem ? { ...item, ...categoryItem } : item;
      });

      // Load NPCs
      const npcDataPromises = npcList.map(npc => fetchNPCData(npc.index));
      const NPCs = (await Promise.all(npcDataPromises)).filter(Boolean);

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
        // We merged characters from GitHub saves in loadCharacters, so we append NPCs here if needed
        // but for now let's just keep saves as main focus
        // characters: [...NPCs] 
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
