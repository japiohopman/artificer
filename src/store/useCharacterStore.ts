import { create } from 'zustand';
import { ItemInstance, InventoryContainer, InventorySlot } from '../types/inventory';
import { useWorldStore } from './useWorldStore';

export type Emotion = 'Neutral' | 'Curious' | 'Skeptical' | 'Happy' | 'Greedy' | 'Angry' | 'Sad' | 'Surprised' | 'Proud';

export type ProficiencyRef = string | { index?: string; name?: string; url?: string };

export interface Character {
  id: string;
  ruleset?: '2014' | '2024';
  saveVersion?: number;
  lastSaved?: string;
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
  discoveredLocationIds?: string[];
  exploredAreas?: { x: number, y: number, radius: number }[];
  isRecruitable?: boolean;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  proficiencies: ProficiencyRef[];
  skills?: ProficiencyRef[];
  traits: { name: string; index: string; desc: string; trait_specific?: any }[];
  features: { name: string; index: string; desc: string; source: string; feature_specific?: any }[];
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
  tokenUrl?: string;
  matrixUrl?: string;
  dataPath?: string;
  conditions?: string[];
  inspiration?: boolean;
  isUnconscious?: boolean;
  isStable?: boolean;
  isDead?: boolean;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  alliesAndOrganizations?: string;
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
  xpGain: {
    characterId: string;
    amount: number;
    key: number;
  } | null;

  classLevelingData: Record<string, Record<number, any>>;
  isLoadingSaves: boolean;

  // Actions
  setActiveCharacter: (id: string) => void;
  setMainCharacter: (char: Character) => void;
  reorderCharacters: (startIndex: number, endIndex: number) => void;
  addXp: (id: string, amount: number) => Promise<void>;
  addPartyXp: (amount: number) => Promise<void>;
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
  modifyHp: (characterId: string, amount: number, isCrit?: boolean) => void;
  toggleInspiration: (characterId: string) => void;
  updateDeathSaves: (characterId: string, successes: number, failures: number) => void;
  rollDeathSave: (characterId: string) => void;
  updateAlliesAndOrganizations: (characterId: string, text: string) => void;
  
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  setCharacters: (chars: Character[]) => void;
  setMainCharacterSlots: (slots: (Character | null)[]) => void;
  loadCharacters: () => Promise<void>;
  loadLeveledData: (classIndex: string, levels: number[]) => Promise<void>;
  deleteCharacter: (id: string) => Promise<boolean>;
  modifyMoney: (characterId: string, amount: Partial<import('../lib/currencyUtils').Money>, mode: 'add' | 'subtract') => boolean;
  consolidateMoney: (characterId: string) => void;
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
  xpGain: null,
  classLevelingData: {},
  isLoadingSaves: false,

  setActiveCharacter: async (id) => {
    set({ activeCharacterId: id });
    const char = get().characters.find(c => c.id === id);
    if (char) {
      if (char.ruleset) {
        const { useGameStore } = await import('./useGameStore');
        useGameStore.getState().setRuleset(char.ruleset);
      }
      const { setDiscoveredLocationIds, setExploredAreas } = useWorldStore.getState();
      setDiscoveredLocationIds(char.discoveredLocationIds || ['waterdeep', 'baldurs_gate', 'neverwinter']);
      setExploredAreas(char.exploredAreas || []);
      const { ensureCharacterEquipmentLoaded } = await import('../lib/inventoryUtils');
      await ensureCharacterEquipmentLoaded(char);
      set((state) => ({ characters: [...state.characters] }));
    }
  },
  setMainCharacter: async (char) => {
    if (char?.ruleset) {
      const { useGameStore } = await import('./useGameStore');
      useGameStore.getState().setRuleset(char.ruleset);
    }
    const { ensureCharacterEquipmentLoaded } = await import('../lib/inventoryUtils');
    await ensureCharacterEquipmentLoaded(char);
    set(() => ({
      characters: [char],
      activeCharacterId: char.id
    }));
  },
  
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

    // Set the visual XP gain animation trigger
    const animationKey = Date.now();
    set({ xpGain: { characterId: id, amount, key: animationKey } });
    setTimeout(() => {
      if (get().xpGain?.characterId === id && get().xpGain?.key === animationKey) {
        set({ xpGain: null });
      }
    }, 2000);

    const newXp = char.xp + amount;
    const { processLevelUp } = await import('../lib/characterUtils');
    const levelUpData = await processLevelUp({ ...char, xp: newXp });

    if (levelUpData) {
      set((state) => ({
        characters: state.characters.map(c => c.id === id ? levelUpData.updatedCharacter : c),
        levelUpQueue: [
          ...state.levelUpQueue,
          ...levelUpData.results.map((r: any) => ({
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

  addPartyXp: async (amount) => {
    const { characters, addXp } = get();
    const activePcs = characters.filter(char => !char.isNpc);
    const pcCount = activePcs.length || 1;
    const dividedXp = Math.floor(amount / pcCount);

    const { useGameStore } = await import('./useGameStore');
    useGameStore.getState().addLog(`The party earned ${amount} XP (${dividedXp} XP each).`, 'success');

    for (const char of activePcs) {
      await addXp(char.id, dividedXp);
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

  modifyHp: (characterId, amount, isCrit) => set((state) => {
    let gameStore: any = null;
    try {
      gameStore = (window as any).useGameStore?.getState();
    } catch (e) {}

    const updatedCharacters = state.characters.map(char => {
      if (char.id !== characterId) return char;

      let newHp = char.hp;
      let isUnconscious = char.isUnconscious || false;
      let isStable = char.isStable || false;
      let isDead = char.isDead || false;
      let deathSaves = char.deathSaves || { successes: 0, failures: 0 };

      if (amount < 0) {
        const damageTaken = Math.abs(amount);

        if (char.hp > 0) {
          newHp = Math.max(0, char.hp + amount);
          if (newHp === 0) {
            isUnconscious = true;
            isStable = false;
            isDead = false;
            deathSaves = { successes: 0, failures: 0 };
            gameStore?.addLog(`${char.name} has fallen Unconscious!`, 'error');
          }
        } else {
          // Already at 0 HP
          if (damageTaken >= char.maxHp) {
            isDead = true;
            isUnconscious = false;
            isStable = false;
            deathSaves = { successes: 0, failures: 3 };
            gameStore?.addLog(`MASSIVE DAMAGE! ${char.name} is DEAD instantly!`, 'error');
          } else {
            const addedFailures = isCrit ? 2 : 1;
            const newFailures = Math.min(3, deathSaves.failures + addedFailures);
            deathSaves = { ...deathSaves, failures: newFailures };
            gameStore?.addLog(`${char.name} takes damage while unconscious! +${addedFailures} Death Save failure(s).`, 'error');

            if (newFailures >= 3) {
              isDead = true;
              isUnconscious = false;
              isStable = false;
              gameStore?.addLog(`${char.name} has accumulated 3 failures and is now DEAD.`, 'error');
            }
          }
        }
      } else if (amount > 0) {
        newHp = Math.min(char.maxHp, char.hp + amount);
        isUnconscious = false;
        isStable = false;
        isDead = false;
        deathSaves = { successes: 0, failures: 0 };
        gameStore?.addLog(`${char.name} is healed for ${amount} HP and wakes up!`, 'success');
      }

      return {
        ...char,
        hp: newHp,
        isUnconscious,
        isStable,
        isDead,
        deathSaves
      };
    });

    // Check if all PCs are unconscious or dead
    const pcs = updatedCharacters.filter(c => c && c.name !== 'Empty Slot' && !c.isNpc);
    const allPcsDown = pcs.length > 0 && pcs.every(p => p.hp <= 0 || p.isUnconscious || p.isDead);

    if (allPcsDown) {
      try {
        const uiStore = (window as any).useUIStore?.getState() || require('./useUIStore').useUIStore.getState();
        uiStore?.setIsGameOver(true);
      } catch (e) {
        console.error("Failed to trigger game over:", e);
      }
    }

    return { characters: updatedCharacters };
  }),

  toggleInspiration: (characterId) => set((state) => ({
characters: state.characters.map(char =>
      char.id === characterId ? { ...char, inspiration: !char.inspiration } : char
    )
  })),

  updateDeathSaves: (characterId, successes, failures) => set((state) => ({
characters: state.characters.map(char =>
      char.id === characterId ? { ...char, deathSaves: { successes, failures } } : char
    )
  })),

  rollDeathSave: (characterId) => set((state) => {
    let gameStore: any = null;
    try {
      gameStore = (window as any).useGameStore?.getState();
    } catch (e) {}

    const updatedCharacters = state.characters.map(char => {
      if (char.id !== characterId) return char;

      const roll = Math.floor(Math.random() * 20) + 1;
      let newHp = char.hp;
      let isUnconscious = char.isUnconscious ?? true;
      let isStable = char.isStable ?? false;
      let isDead = char.isDead ?? false;
      let deathSaves = char.deathSaves || { successes: 0, failures: 0 };

      if (roll === 20) {
        newHp = 1;
        isUnconscious = false;
        isStable = false;
        isDead = false;
        deathSaves = { successes: 0, failures: 0 };
        gameStore?.addLog(`Death Save: Critical Success (Natural 20)! ${char.name} wakes up with 1 HP!`, 'success');
      } else if (roll === 1) {
        const newFailures = Math.min(3, deathSaves.failures + 2);
        deathSaves = { ...deathSaves, failures: newFailures };
        gameStore?.addLog(`Death Save: Critical Failure (Natural 1)! ${char.name} gets 2 failures.`, 'error');
        if (newFailures >= 3) {
          isDead = true;
          isUnconscious = false;
          isStable = false;
          gameStore?.addLog(`${char.name} has died...`, 'error');
        }
      } else if (roll >= 10) {
        const newSuccesses = Math.min(3, deathSaves.successes + 1);
        deathSaves = { ...deathSaves, successes: newSuccesses };
        gameStore?.addLog(`Death Save: Success (${roll}) for ${char.name}.`, 'success');
        if (newSuccesses >= 3) {
          isStable = true;
          gameStore?.addLog(`${char.name} is now STABLE!`, 'success');
        }
      } else {
        const newFailures = Math.min(3, deathSaves.failures + 1);
        deathSaves = { ...deathSaves, failures: newFailures };
        gameStore?.addLog(`Death Save: Failure (${roll}) for ${char.name}.`, 'error');
        if (newFailures >= 3) {
          isDead = true;
          isUnconscious = false;
          isStable = false;
          gameStore?.addLog(`${char.name} has died...`, 'error');
        }
      }

      return {
        ...char,
        hp: newHp,
        isUnconscious,
        isStable,
        isDead,
        deathSaves
      };
    });

    // Check if all PCs are unconscious or dead
    const pcs = updatedCharacters.filter(c => c && c.name !== 'Empty Slot' && !c.isNpc);
    const allPcsDown = pcs.length > 0 && pcs.every(p => p.hp <= 0 || p.isUnconscious || p.isDead);

    if (allPcsDown) {
      try {
        const uiStore = (window as any).useUIStore?.getState() || require('./useUIStore').useUIStore.getState();
        uiStore?.setIsGameOver(true);
      } catch (e) {
        console.error("Failed to trigger game over:", e);
      }
    }

    return { characters: updatedCharacters };
  }),

  updateAlliesAndOrganizations: (characterId, alliesAndOrganizations) => set((state) => ({
characters: state.characters.map(char =>
      char.id === characterId ? { ...char, alliesAndOrganizations } : char
    )
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

      // Ensure every loaded character has a populated actionEconomy state
      const processedChars = chars.map(char => {
        if (!char.actionEconomy) {
          char.actionEconomy = {
            actions: { current: 1, max: 1 },
            bonusActions: { current: 1, max: 1 },
            reactions: { current: 1, max: 1 },
            movement: { current: 30, max: 30 },
            objectInteractions: { current: 1, max: 1 }
          };
        }
        return char;
      });

      const activeId = get().activeCharacterId || '';
      set({ 
        mainCharacterSlots: slots,
        activeCharacterId: activeId
      });

      // We do not set 'characters' here because 'characters' represents the ACTIVE party
      // for a loaded save. The saves themselves just belong in mainCharacterSlots.

      const activeChar = processedChars.find(c => c.id === activeId);
      if (activeChar) {
        const { setDiscoveredLocationIds, setExploredAreas } = useWorldStore.getState();
        setDiscoveredLocationIds(activeChar.discoveredLocationIds || ['waterdeep', 'baldurs_gate', 'neverwinter']);
        setExploredAreas(activeChar.exploredAreas || []);
      }

      const { ensureCharacterEquipmentLoaded } = await import('../lib/inventoryUtils');
      for (const char of processedChars) {
          if (char) {
            await ensureCharacterEquipmentLoaded(char);
            if (char.level > 0) {
              const levels = Array.from({ length: char.level }, (_, i) => i + 1);
              await get().loadLeveledData(char.class, levels);
            }
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

  modifyMoney: (characterId, amount, mode) => {
    const { characters } = get();
    const char = characters.find(c => c.id === characterId);
    if (!char) return false;

    import('../lib/currencyUtils').then(({ toTotalCopper, fromCopper }) => {
      const currentTotal = toTotalCopper(char.money);
      const changeTotal = toTotalCopper(amount);

      if (mode === 'subtract' && currentTotal < changeTotal) return;

      const newTotal = mode === 'add' ? currentTotal + changeTotal : currentTotal - changeTotal;
      const newMoney = fromCopper(newTotal);

      set((state) => ({
        characters: state.characters.map(c => c.id === characterId ? { ...c, money: newMoney } : c)
      }));
    });

    return true;
  },

  consolidateMoney: (characterId) => {
    const { characters } = get();
    const char = characters.find(c => c.id === characterId);
    if (!char) return;

    import('../lib/currencyUtils').then(({ toTotalCopper, fromCopper }) => {
      const total = toTotalCopper(char.money);
      const consolidated = fromCopper(total);

      set((state) => ({
        characters: state.characters.map(c => c.id === characterId ? { ...c, money: consolidated } : c)
      }));
    });
  },
}));

const globalObj = typeof window !== 'undefined' ? (window as any) : (globalThis as any);
globalObj.useCharacterStore = useCharacterStore;
