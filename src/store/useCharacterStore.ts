import { create } from 'zustand';
import { ItemInstance, InventoryContainer, InventorySlot } from '../types/inventory';

export type Emotion = 'Neutral' | 'Curious' | 'Skeptical' | 'Happy' | 'Greedy' | 'Angry' | 'Sad' | 'Surprised' | 'Proud';

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
  proficiencies: string[];
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

interface CharacterState {
  characters: Character[];
  mainCharacterSlots: (Character | null)[];
  activeCharacterId: string;
  
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

  levelUpQueue: {
    characterId: string;
    newLevel: number;
    features: any[];
    hpIncrease: number;
    hasASI: boolean;
  }[];

  classLevelingData: Record<string, Record<number, any>>;
  isLoadingSaves: boolean;

  // Actions
  setActiveCharacter: (id: string) => void;
  setMainCharacter: (char: Character) => void;
  reorderCharacters: (startIndex: number, endIndex: number) => void;
  addXp: (id: string, amount: number) => Promise<void>;
  dismissLevelUp: () => void;
  updateCharacterStats: (id: string, stats: Partial<Character['stats']>) => void;
  setEmotion: (emotion: Emotion) => void;
  setTestAnimalInteraction: (interaction: any) => void;
  
  learnSpell: (spell: any) => void;
  forgetSpell: (spellIndex: string) => void;
  prepareSpell: (spellIndex: string) => void;
  unprepareSpell: (spellIndex: string) => void;
  castSpell: (spellIndex: string, level: number) => boolean;
  restoreSlots: (isLongRest: boolean) => void;
  
  consumeAction: (characterId: string, type: 'actions' | 'bonusActions' | 'reactions' | 'objectInteractions') => void;
  consumeMovement: (characterId: string, amount: number) => void;
  restoreActionEconomy: (characterId: string, isLongRest?: boolean) => void;
  useActionSurge: (characterId: string) => void;
  
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  setCharacters: (chars: Character[]) => void;
  setMainCharacterSlots: (slots: (Character | null)[]) => void;
  loadCharacters: () => Promise<void>;
  loadLeveledData: (classIndex: string, levels: number[]) => Promise<void>;
  deleteCharacter: (id: string) => Promise<boolean>;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  mainCharacterSlots: [null, null, null],
  activeCharacterId: '',
  currentNPC: null,
  emotion: 'Neutral',
  beastRegistry: {},
  testAnimalInteraction: null,
  levelUpQueue: [],
  classLevelingData: {},
  isLoadingSaves: false,

  setActiveCharacter: (id) => set({ activeCharacterId: id }),
  setMainCharacter: (char) => set((state) => {
    const newChars = [...state.characters];
    newChars[0] = char;
    return { 
      characters: newChars,
      activeCharacterId: state.activeCharacterId || char.id
    };
  }),
  
  reorderCharacters: (startIndex, endIndex) => {
    if (startIndex === 0 || endIndex === 0) return;
    set((state) => {
      const newChars = [...state.characters];
      const [removed] = newChars.splice(startIndex, 1);
      newChars.splice(endIndex, 0, removed);
      return { characters: newChars };
    });
  },

  addXp: async (id, amount) => {
    const { characters } = get();
    const char = characters.find(c => c.id === id);
    if (!char) return;

    const newXp = char.xp + amount;
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

  setEmotion: (emotion) => set({ emotion }),
  setTestAnimalInteraction: (testAnimalInteraction) => set({ testAnimalInteraction }),

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
      
      if (isLongRest) {
        Object.keys(newSlots).forEach(lvl => {
          newSlots[lvl] = { ...newSlots[lvl], current: newSlots[lvl].max };
        });
      } else {
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

  deleteCharacter: async (id: string) => {
    try {
      const { saveService } = await import('../services/saveService');
      const success = await saveService.deleteCharacter(id);
      if (success) {
        await get().loadCharacters();
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
}));
