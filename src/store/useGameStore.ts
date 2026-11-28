import { create } from 'zustand';
import { useUIStore } from './useUIStore';
import { useCharacterStore } from './useCharacterStore';
import * as combatUtils from '../components/combat/combatUtils';
import { soundService } from '../services/soundService';
import type { DiceResult, DiceRollContext, DiceRollOutcome } from '../dice_roller/diceResolver';

export interface RpsState {
  status: 'ritual' | 'result';
  userChoice: 'rock' | 'paper' | 'scissors' | null;
  cpuChoice: 'rock' | 'paper' | 'scissors' | null;
  countdown: number;
  score: {
    user: number;
    cpu: number;
  };
}

export interface CoinFlipState {
  status: 'idle' | 'tossing' | 'result';
  prediction: 'heads' | 'tails' | null;
  result: 'heads' | 'tails' | null;
  score: {
    user: number;
    cpu: number;
  };
}

export interface TacticalCell {
  x: number;
  y: number;
  type: string;
  isOpen?: boolean;
  explored?: boolean;
  elevation?: number;
  movementCost?: number;
  hazards?: any[];
}

export interface CombatMonster {
  id: string;
  index?: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  imageUrl?: string;
  awareness: 'idle' | 'alert' | 'combat';
  viewDirection: number; // 0:N, 1:E, 2:S, 3:W
  perception: number;
  speed: number; // in cells
  lastKnownPlayerPos?: { x: number; y: number };
  stats?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  armor_class?: any;
  size?: 'Medium' | 'Large';
  isAlly?: boolean;
  xp?: number;
  actions?: any[];
  special_abilities?: any[];
  knownSpells?: any[];
  preparedSpells?: string[];
  spellSlots?: Record<string, { current: number; max: number }>;
  spellcastingAbility?: string;
}

export interface CombatState {
  playerPos: { x: number; y: number };
  pcPositions?: Record<string, { x: number; y: number; rotation?: number }>;
  monsters: CombatMonster[];
  initiativeOrder: Array<{
    id: string;
    name: string;
    value: number;
    isPlayer?: boolean;
    isAlly?: boolean;
  }>;
  activeTurnIndex: number;
  grid: TacticalCell[][];
  victoryXp: number;
  combatMapBackground?: string | null;
  activeAttack?: {
    attackerId: string;
    targetId: string;
    targetX: number;
    targetY: number;
    svgPath: string;
  } | null;
  walls?: any[]; // physical line segments for custom boundary semantics
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface GameState {
  // Ruleset Context
  ruleset: '2014' | '2024';

  // Common
  currentNPC: any | null;
  emotion: string;
  characters: any[]; // For compatibility with minigame components
  activeCharacterId: string;
  
  // Logs
  logs: LogEntry[];

  // Simulator
  activeCards: any[];

  // Dice History
  isDiceReady: boolean;
  isRolling3D: boolean;
  recentRolls: DiceResult[];

  // Game flow
  isGameStarted: boolean;

  // Rock Paper Scissors
  rpsState: RpsState;
  
  // Coin Flip
  coinFlipState: CoinFlipState;

  // Combat
  combatState: CombatState & {
    activeConditions: Record<string, string[]>; // id -> list of conditions
  };

  // Ruleset Action
  setRuleset: (ruleset: '2014' | '2024') => void;

  // Actions
  setCurrentNPC: (npc: any | null) => void;
  setEmotion: (emotion: string) => void;
  setIsGameStarted: (started: boolean) => void;
  
  // Logs Actions
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;

  // Dice Actions
  rollDice: (label: string, modifier: number, dieType?: number) => void;
  rollDice3D: (notation: string, label: string, theme?: string, color?: string, context?: DiceRollContext) => Promise<DiceResult | null>;
  rollDiceBackground: (notation: string, label: string, context?: DiceRollContext, seed?: string | number) => Promise<DiceResult>;
  updateRollOutcome: (rollId: string, outcome: DiceRollOutcome) => void;
  applyRollModifier: (rollId: string, modifier: number) => DiceResult | null;
  removeRoll: (id: string) => void;
  clearRoll: () => void;
  setIsDiceReady: (isReady: boolean) => void;
  setIsRolling3D: (isRolling: boolean) => void;

  // Simulator Actions
  addToPreview: (item: any) => void;
  removeFromPreview: (index: number) => void;
  clearPreview: () => void;

  // RPS Actions
  startRpsMatch: () => void;
  setRpsChoice: (choice: 'rock' | 'paper' | 'scissors') => void;
  resetRps: () => void;

  // Coin Flip Actions
  startCoinFlip: (prediction: 'heads' | 'tails') => void;
  resetCoinFlip: () => void;

  // Combat Actions
  setPlayerPos: (x: number, y: number, pcId?: string) => void;
  updateMonsterHp: (id: string, hp: number) => void;
  addMonsterToCombat: (monster: any, x?: number, y?: number) => void;
  spawnMonster: (index: string, x?: number, y?: number) => Promise<void>;
  removeMonsterFromCombat: (id: string) => void;
  toggleDoor: (x: number, y: number, edgeId?: string) => void;
  completeCombat: (victory: boolean) => Promise<void>;
  startTurnForIndex: (targetIndex: number) => void;
  nextTurn: () => void;
  startCombat: () => Promise<void>;
  resolveCombatAction: (actor: any, target: any, action: any, turnContext?: { executionVersion: number; turnIndex: number; actorId: string }) => Promise<boolean | void>;
  executeMonsterTurn: (monsterId: string, equipmentDataLookup?: (index: string, ruleset?: '2014' | '2024') => Promise<any>) => Promise<void>;
  setCombatMapBackground: (combatMapBackground: string | null) => void;
}

const initializeGrid = (width: number, height: number): TacticalCell[][] => {
  const grid: TacticalCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TacticalCell[] = [];
    for (let x = 0; x < width; x++) {
      let type: 'floor' | 'wall' | 'door' = 'floor';

      // Simple room layout
      if (x === 5 && y !== 3) type = 'wall';
      if (x === 5 && y === 3) type = 'door';

      row.push({ x, y, type, isOpen: type === 'door' ? false : undefined, explored: false });
    }
    grid.push(row);
  }
  return grid;
};

const getAttackSvgPath = (actionName: string): string => {
  const name = actionName.toLowerCase();
  if (name.includes('claw')) return '/assets/icons/svg/attacks/claw.svg';
  if (name.includes('bite')) return '/assets/icons/svg/attacks/bite.svg';
  if (name.includes('beak')) return '/assets/icons/svg/attacks/beak.svg';
  if (name.includes('tail')) return '/assets/icons/svg/attacks/tail.svg';
  if (name.includes('talon')) return '/assets/icons/svg/attacks/talons.svg';
  if (name.includes('tentacle')) return '/assets/icons/svg/attacks/tentacle.svg';
  if (name.includes('crush')) return '/assets/icons/svg/attacks/crush.svg';
  if (name.includes('web')) return '/assets/icons/svg/attacks/web.svg';
  if (name.includes('whip')) return '/assets/icons/svg/attacks/whip.svg';
  if (name.includes('club')) return '/assets/icons/svg/attacks/club.svg';
  if (name.includes('trident')) return '/assets/icons/svg/attacks/trident.svg';
  if (name.includes('warhammer')) return '/assets/icons/svg/attacks/warhammer.svg';
  if (name.includes('hammer')) return '/assets/icons/svg/attacks/hammer.svg';
  if (name.includes('greataxe') || name.includes('axe')) return '/assets/icons/svg/attacks/greataxe.svg';
  if (name.includes('greatsword') || name.includes('sword') || name.includes('dagger') || name.includes('rapier') || name.includes('scimitar')) return '/assets/icons/svg/attacks/greatsword.svg';
  if (name.includes('unarmed') || name.includes('punch') || name.includes('fist')) return '/assets/icons/svg/attacks/unarmed_strike.svg';
  if (name.includes('fire') || name.includes('breath') || name.includes('acid') || name.includes('lightning') || name.includes('poison')) {
    if (name.includes('fire')) return '/assets/icons/svg/attacks/fire_breath.svg';
    if (name.includes('acid')) return '/assets/icons/svg/attacks/acid_breath.svg';
    if (name.includes('lightning')) return '/assets/icons/svg/attacks/lightning_breath.svg';
    if (name.includes('poison')) return '/assets/icons/svg/attacks/poison_breath.svg';
  }
  if (name.includes('bow') || name.includes('arrow') || name.includes('bolt') || name.includes('shoot') || name.includes('ranged')) return '/assets/icons/svg/attacks/ranged_attack.svg';

  return '/assets/icons/svg/attacks/melee.svg'; // fallback
};

let isStartingCombat = false;
// Invalidates delayed hostile-turn callbacks whenever initiative advances or an encounter changes.
let turnExecutionVersion = 0;

export const useGameStore = create<GameState>((set, get) => ({
  ruleset: '2014',
  currentNPC: null,
  emotion: 'Neutral',

  setRuleset: (ruleset) => set({ ruleset }),
  characters: [],
  activeCharacterId: '',
  logs: [],
  activeCards: [],
  isDiceReady: false,
  isRolling3D: false,
  recentRolls: [],
  isGameStarted: false,

  rpsState: {
    status: 'ritual',
    userChoice: null,
    cpuChoice: null,
    countdown: 3,
    score: { user: 0, cpu: 0 }
  },

  coinFlipState: {
    status: 'idle',
    prediction: null,
    result: null,
    score: { user: 0, cpu: 0 }
  },

  combatState: {
    playerPos: { x: 2, y: 2 },
    monsters: [],
    initiativeOrder: [],
    activeTurnIndex: 0,
    grid: initializeGrid(32, 20),
    victoryXp: 500,
    activeConditions: {},
    combatMapBackground: 'fay_forest.png',
    activeAttack: null
  },

  setCurrentNPC: (currentNPC) => set({ currentNPC }),
  setEmotion: (emotion) => set({ emotion }),

  startRpsMatch: () => {
    set((state) => ({
      rpsState: {
        ...state.rpsState,
        status: 'ritual',
        userChoice: null,
        cpuChoice: null,
        countdown: 3
      }
    }));

    const interval = setInterval(() => {
      const { rpsState } = get();
      if (rpsState.countdown > 1) {
        set({ rpsState: { ...rpsState, countdown: rpsState.countdown - 1 } });
      } else {
        clearInterval(interval);
      }
    }, 1000);
  },

  setRpsChoice: (userChoice) => {
    const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const cpuChoice = choices[Math.floor(Math.random() * 3)];
    
    set((state) => {
        const newScore = { ...state.rpsState.score };
        if (userChoice !== cpuChoice) {
            const win = (userChoice === 'rock' && cpuChoice === 'scissors') ||
                        (userChoice === 'paper' && cpuChoice === 'rock') ||
                        (userChoice === 'scissors' && cpuChoice === 'paper');
            if (win) newScore.user++;
            else newScore.cpu++;
        }

        return {
            rpsState: {
                ...state.rpsState,
                status: 'result',
                userChoice,
                cpuChoice,
                countdown: 0,
                score: newScore
            }
        };
    });
  },

  resetRps: () => set((state) => ({
      rpsState: {
          ...state.rpsState,
          status: 'ritual',
          userChoice: null,
          cpuChoice: null,
          countdown: 3
      }
  })),

  startCoinFlip: (prediction) => {
    set((state) => ({
        coinFlipState: {
            ...state.coinFlipState,
            status: 'tossing',
            prediction,
            result: null
        }
    }));

    // Simulate toss duration
    setTimeout(() => {
        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        set((state) => {
            const newScore = { ...state.coinFlipState.score };
            if (result === prediction) newScore.user++;
            else newScore.cpu++;

            return {
                coinFlipState: {
                    ...state.coinFlipState,
                    status: 'result',
                    result,
                    score: newScore
                }
            };
        });
    }, 2000);
  },

  resetCoinFlip: () => set((state) => ({
      coinFlipState: {
          ...state.coinFlipState,
          status: 'idle',
          prediction: null,
          result: null
      }
  })),

  setPlayerPos: (x, y, pcId) => set((state) => {
    const id = pcId || state.activeCharacterId;
    const currentPos = state.combatState.pcPositions?.[id] || state.combatState.playerPos;
    const dx = x - currentPos.x;
    const dy = y - currentPos.y;
    let rotation = (currentPos as any).rotation || 0;
    if (dx !== 0 || dy !== 0) {
      rotation = Math.atan2(-dx, dy) * (180 / Math.PI);
    }

    const newPcPositions = {
      ...(state.combatState.pcPositions || {}),
      [id]: { x, y, rotation }
    };

    return {
      combatState: {
        ...state.combatState,
        playerPos: id === state.activeCharacterId ? { x, y } : state.combatState.playerPos,
        pcPositions: newPcPositions
      }
    };
  }),

  setCombatMapBackground: (combatMapBackground) => set((state) => ({
    combatState: {
      ...state.combatState,
      combatMapBackground
    }
  })),

  updateMonsterHp: (id, hp) => set((state) => ({
    combatState: {
      ...state.combatState,
      monsters: state.combatState.monsters.map(m => m.id === id ? { ...m, hp: Math.max(0, hp) } : m)
    }
  })),

  addMonsterToCombat: (monster, targetX, targetY) => set((state) => {
    const id = `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    let x = targetX ?? 8;
    let y = targetY ?? 2;

    if (targetX === undefined || targetY === undefined) {
      // Find an empty spot (excluding both other monsters and player characters)
      const occupiedPositions = new Set();
      state.combatState.monsters.forEach(m => occupiedPositions.add(`${m.x},${m.y}`));

      const pcPositions = state.combatState.pcPositions || {};
      Object.values(pcPositions).forEach((p: any) => {
        if (p && typeof p === 'object' && 'x' in p && 'y' in p) {
          occupiedPositions.add(`${p.x},${p.y}`);
        }
      });
      if (state.combatState.playerPos) {
        occupiedPositions.add(`${state.combatState.playerPos.x},${state.combatState.playerPos.y}`);
      }

      while (occupiedPositions.has(`${x},${y}`)) {
        y++;
        if (y > 6) { y = 2; x++; }
      }
    }

    const newMonster: CombatMonster = {
      id,
      index: monster.index || undefined,
      name: monster.name,
      type: monster.type || 'monster',
      size: monster.size || 'Medium',
      hp: monster.hit_points || monster.hp || 10,
      maxHp: monster.hit_points || monster.maxHp || monster.hp || 10,
      x,
      y,
      imageUrl: (monster.image && (monster.image.includes('/tokens/') || monster.image.includes('/enemies/tokens/'))) ? monster.image : (monster.imageUrl || monster.image),
      awareness: 'idle',
      viewDirection: 3,
      perception: monster.senses?.passive_perception || 10,
      speed: monster.speed?.walk ? parseInt(monster.speed.walk) / 5 : 6,
      stats: {
        str: monster.strength || monster.stats?.str || 10,
        dex: monster.dexterity || monster.stats?.dex || 10,
        con: monster.constitution || monster.stats?.con || 10,
        int: monster.intelligence || monster.stats?.int || 10,
        wis: monster.wisdom || monster.stats?.wis || 10,
        cha: monster.charisma || monster.stats?.cha || 10
      },
      armor_class: monster.armor_class,
      isAlly: monster.isAlly || false,
      xp: monster.xp || 0,
      actions: monster.actions || [],
      special_abilities: monster.special_abilities || [],
      knownSpells: monster.knownSpells || [],
      preparedSpells: monster.preparedSpells || [],
      spellSlots: monster.spellSlots || {},
      spellcastingAbility: monster.spellcastingAbility
    };

    return {
      combatState: {
        ...state.combatState,
        monsters: [...state.combatState.monsters, newMonster]
      }
    };
  }),

  spawnMonster: async (index, x, y) => {
    const { atlasService } = await import('../services/atlasService');
    const monsterData = await atlasService.loadEnemy(index);
    if (monsterData) {
      get().addMonsterToCombat(monsterData, x, y);
      get().addLog(`A ${monsterData.name} appears!`, 'warning');
    }
  },

  removeMonsterFromCombat: (id) => {
    const state = get();
    const prevOrder = state.combatState.initiativeOrder;
    const removedIndex = prevOrder.findIndex(i => i.id === id);
    const newOrder = prevOrder.filter(i => i.id !== id);

    let newActiveIndex = state.combatState.activeTurnIndex;
    const wasActiveActorRemoved = removedIndex !== -1 && removedIndex === state.combatState.activeTurnIndex;

    if (removedIndex !== -1 && newOrder.length > 0) {
      if (removedIndex < state.combatState.activeTurnIndex) {
        newActiveIndex = Math.max(0, state.combatState.activeTurnIndex - 1);
      } else if (removedIndex === state.combatState.activeTurnIndex) {
        newActiveIndex = newActiveIndex % newOrder.length;
      }
    } else if (newOrder.length === 0) {
      newActiveIndex = 0;
    }

    set({
      combatState: {
        ...state.combatState,
        monsters: state.combatState.monsters.filter(m => m.id !== id),
        initiativeOrder: newOrder,
        activeTurnIndex: newActiveIndex
      }
    });

    // When the active combatant is removed, start the turn for the incoming actor at newActiveIndex
    if (wasActiveActorRemoved && newOrder.length > 0) {
      get().startTurnForIndex(newActiveIndex);
    }
  },

  toggleDoor: (x, y, edgeId) => set((state) => {
    let nextOpen = false;
    let toggled = false;

    // 1. If edgeId or matching boundary door exists, toggle it
    const newWalls = (state.combatState.walls || []).map(w => {
      const isDoorType = w.type === 'door' || w.type === 'secret-door';
      if (!isDoorType) return w;

      const matches = edgeId ? w.id === edgeId : (
        (w.x === x && w.y === y) ||
        (w.orientation === 'horizontal' && w.x === x && (w.y === y || w.y === y + 1)) ||
        (w.orientation === 'vertical' && w.y === y && (w.x === x || w.x === x + 1))
      );

      if (matches && !toggled) {
        const isOpen = w.doorState === 'open';
        nextOpen = !isOpen;
        toggled = true;
        return { ...w, doorState: nextOpen ? 'open' : 'closed' };
      }
      return w;
    });

    // 2. Backward compatibility: if cell was stamped as legacy 'door' type
    const newGrid = [...state.combatState.grid];
    if (newGrid[y]?.[x] && newGrid[y][x].type === 'door') {
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = { ...newGrid[y][x], isOpen: toggled ? nextOpen : !newGrid[y][x].isOpen, explored: true };
    }

    return {
      combatState: {
        ...state.combatState,
        grid: newGrid,
        walls: newWalls
      }
    };
  }),

  completeCombat: async (victory) => {
    const { combatState, addLog } = get();
    turnExecutionVersion += 1;

    // 1. Calculate XP from current monster state before clearing combat state
    const totalXp = victory
      ? combatState.monsters.reduce((acc, m) => acc + (m.isAlly ? 0 : (m.xp || 0)), 0) || 500
      : 0;

    // 2. Immediately invalidate combat state and initiative order synchronously BEFORE any await
    set((state) => ({
      combatState: {
        ...state.combatState,
        initiativeOrder: [],
        activeTurnIndex: 0
      }
    }));
    useUIStore.getState().setGameMode('exploration');

    // 3. Award XP and log outcome safely, ensuring exploration mode is preserved even if XP payout fails
    try {
      if (victory) {
        await useCharacterStore.getState().addPartyXp(totalXp);
      } else {
        addLog("The party has been defeated...", 'error');
      }
    } catch (err) {
      console.error("Error during completeCombat XP payout:", err);
    }
  },

  startTurnForIndex: (targetIndex: number) => {
    const { combatState, addLog, executeMonsterTurn } = get();
    if (combatState.initiativeOrder.length === 0) {
      addLog("No one is in the initiative order!", "warning");
      return;
    }

    const normalizedIndex = targetIndex % combatState.initiativeOrder.length;
    const currentActor = combatState.initiativeOrder[normalizedIndex];
    if (!currentActor) return;

    // Every turn start receives a unique generation, even if the same actor returns to the same slot.
    turnExecutionVersion += 1;
    useUIStore.getState().setCombatActionCategory(null);

    // Refresh action economy for player characters on turn start
    if (currentActor.isPlayer) {
      const { restoreActionEconomy, setActiveCharacter } = useCharacterStore.getState();
      restoreActionEconomy(currentActor.id, false);
      setActiveCharacter(currentActor.id);
    }

    addLog(`Turn begins: ${currentActor.name}`, currentActor.isPlayer || currentActor.isAlly ? 'success' : 'warning');

    set((state) => {
      const newConditions = { ...state.combatState.activeConditions };
      // Clear conditions for the actor starting their turn
      if (newConditions[currentActor.id]) {
        delete newConditions[currentActor.id];
      }

      return {
        combatState: {
          ...state.combatState,
          activeTurnIndex: normalizedIndex,
          activeConditions: newConditions
        }
      };
    });

    // Advanced Monster AI (Only for hostile/non-ally monsters)
    const currentMonster = combatState.monsters.find(m => m.id === currentActor.id);
    const isHostileMonster = !currentActor.isPlayer && (!currentMonster || !currentMonster.isAlly);

    if (isHostileMonster) {
      executeMonsterTurn(currentActor.id);
    }
  },

  nextTurn: () => {
    const { combatState, addLog, startTurnForIndex } = get();
    if (combatState.initiativeOrder.length === 0) {
      addLog("No one is in the initiative order!", "warning");
      return;
    }
    const nextIndex = (combatState.activeTurnIndex + 1) % combatState.initiativeOrder.length;
    startTurnForIndex(nextIndex);
  },

  executeMonsterTurn: async (monsterId: string, equipmentDataLookup) => {
    const { combatState, addLog, resolveCombatAction } = get();
    const currentMonster = combatState.monsters.find(m => m.id === monsterId);
    if (!currentMonster || currentMonster.hp <= 0) {
      get().nextTurn();
      return;
    }

    const turnActorId = monsterId;
    const turnIndex = combatState.activeTurnIndex;
    const executionVersion = turnExecutionVersion;

    // 1. Current-turn identity verification (active encounter, slot ownership, matching turn index and actor ID)
    const isCurrentTurn = (): boolean => {
      const state = get();
      if (turnExecutionVersion !== executionVersion) return false;
      if (state.combatState.initiativeOrder.length === 0) return false;
      if (useUIStore.getState().gameMode !== 'combat') return false;
      if (state.combatState.activeTurnIndex !== turnIndex) return false;
      const currentActor = state.combatState.initiativeOrder[turnIndex];
      return Boolean(currentActor && currentActor.id === turnActorId);
    };

    let turnAdvanced = false;
    const advanceTurnOnce = () => {
      if (turnAdvanced) return;
      if (!isCurrentTurn()) return;
      turnAdvanced = true;
      get().nextTurn();
    };

    setTimeout(async () => {
      // 1. Stale callback verification: is this still the active turn of turnActorId at turnIndex?
      if (!isCurrentTurn()) return;

      // 2. Actor eligibility verification: does the monster still exist and is it alive?
      const { combatState: currentCombatState } = get();
      const freshMonster = currentCombatState.monsters.find(m => m.id === monsterId);
      if (!freshMonster || freshMonster.hp <= 0) {
        // A dead actor that still owns the current initiative slot advances safely
        advanceTurnOnce();
        return;
      }

      const { checkLoS, findPath, getDistance } = combatUtils;
      const playerPos = currentCombatState.playerPos;

      let updatedMonster = { ...freshMonster };
      let stateChanged = false;

      // Active combat participants are alert and focused in combat
      if (updatedMonster.awareness !== 'combat') {
        updatedMonster.awareness = 'combat';
        stateChanged = true;
      }

      // Find the closest active, conscious PC to target
      const activeParty = useCharacterStore.getState().characters.filter((c: any) =>
        c && c.name !== 'Empty Slot' &&
        (!c.isNpc || c.isRecruitable) &&
        c.hp > 0 &&
        !c.isUnconscious &&
        !c.isDead
      );

      if (activeParty.length === 0) {
        addLog(`${updatedMonster.name} searches, but all opponents are incapacitated!`, 'info');
        advanceTurnOnce();
        return;
      }

      const pcPositions = currentCombatState.pcPositions || {};
      let targetPc: any = null;
      let minDistance = Infinity;
      let targetPcPos = playerPos;

      activeParty.forEach(pc => {
        const pos = pcPositions[pc.id] || playerPos;
        const dist = getDistance(updatedMonster, pos);
        if (dist < minDistance) {
          minDistance = dist;
          targetPc = pc;
          targetPcPos = pos;
        }
      });

      const targetPos = targetPc ? targetPcPos : playerPos;

      // Canonical Atlas Action Selection: resolve weapon ranges via equipment metadata
      const fetchEquipmentData = equipmentDataLookup ?? (await import('../services/storageService')).fetchEquipmentData;
      const currentRuleset = get().ruleset || '2014';
      const monsterActions = updatedMonster.actions || [];

      interface AttackCandidate {
        action: any;
        range: number;
        isRanged: boolean;
      }

      const validAttackCandidates: AttackCandidate[] = [];

      for (const act of monsterActions) {
        // Strict requirement: action must possess damage dice array
        if (!Array.isArray(act.damage) || act.damage.length === 0 || !act.damage[0]?.damage_dice) {
          continue;
        }

        const weaponName = (act.name || '').toLowerCase().trim();
        const weaponData = await fetchEquipmentData(weaponName, currentRuleset);

        const isThrown = Boolean(weaponData?.properties?.some((p: any) => p.index === 'thrown' || p.name?.toLowerCase() === 'thrown'));
        const isRanged = weaponData?.weapon_range === 'Ranged' || isThrown;
        const hasReach = Boolean(weaponData?.properties?.some((p: any) => p.index === 'reach' || p.name?.toLowerCase() === 'reach'));

        let attackRange = 1;
        if (isRanged && weaponData?.range?.normal) {
          attackRange = Math.max(1, Math.floor(weaponData.range.normal / 5));
        } else if (hasReach) {
          attackRange = 2;
        } else {
          attackRange = 1;
        }

        validAttackCandidates.push({
          action: act,
          range: attackRange,
          isRanged
        });
      }

      // Re-validate turn identity and actor eligibility immediately after async equipment lookups
      if (!isCurrentTurn()) return;
      const monsterAfterLookups = get().combatState.monsters.find(m => m.id === monsterId);
      if (!monsterAfterLookups || monsterAfterLookups.hp <= 0) {
        advanceTurnOnce();
        return;
      }

      // Synchronize with fresh monster state before pathfinding or movement
      updatedMonster = {
        ...monsterAfterLookups,
        awareness: 'combat'
      };

      const selectAttackForDistance = (candidates: AttackCandidate[], currentDist: number, hasClearLoS: boolean): AttackCandidate | null => {
        if (candidates.length === 0) return null;

        // In melee reach (dist <= 1): prefer melee attack if LoS is clear
        if (currentDist <= 1 && hasClearLoS) {
          const melee = candidates.find(c => !c.isRanged && currentDist <= c.range);
          if (melee) return melee;
        }

        // Outside melee reach: prefer ranged/thrown attack within normal range if LoS is clear
        if (hasClearLoS) {
          const ranged = candidates.find(c => c.isRanged && currentDist <= c.range);
          if (ranged) return ranged;
        }

        // If neither is immediately usable, choose for approach intention: prefer ranged if present, else melee
        return candidates.find(c => c.isRanged) || candidates[0];
      };

      let dist = getDistance(updatedMonster, targetPos);
      let directLoS = checkLoS(updatedMonster, targetPos, currentCombatState.grid, currentCombatState.walls);

      let chosenCandidate = selectAttackForDistance(validAttackCandidates, dist, directLoS);
      const attackRange = chosenCandidate ? chosenCandidate.range : 1;
      const monsterSpeed = typeof updatedMonster.speed === 'number' ? updatedMonster.speed : 6;

      // If out of range OR obstructed by walls/doors, pathfind around obstacles
      if (dist > attackRange || !directLoS) {
        const normalizedSize: 'Medium' | 'Large' = (updatedMonster.size === 'Large') ? 'Large' : 'Medium';
        const path = findPath(
          updatedMonster,
          targetPos,
          currentCombatState.grid,
          currentCombatState.monsters,
          currentCombatState.pcPositions || playerPos,
          normalizedSize,
          currentCombatState.walls
        );

        if (path && path.length > 1) {
          const moveSteps = Math.min(path.length - 1, monsterSpeed);
          const moveTarget = path[moveSteps - 1];

          updatedMonster.x = moveTarget.x;
          updatedMonster.y = moveTarget.y;

          const firstStep = path[0];
          if (firstStep.x > monsterAfterLookups.x) updatedMonster.viewDirection = 1;
          else if (firstStep.x < monsterAfterLookups.x) updatedMonster.viewDirection = 3;
          else if (firstStep.y > monsterAfterLookups.y) updatedMonster.viewDirection = 2;
          else if (firstStep.y < monsterAfterLookups.y) updatedMonster.viewDirection = 0;
          stateChanged = true;

          dist = getDistance(updatedMonster, targetPos);
          directLoS = checkLoS(updatedMonster, targetPos, currentCombatState.grid, currentCombatState.walls);
        }
      }

      // Re-evaluate candidate attack after movement
      chosenCandidate = selectAttackForDistance(validAttackCandidates, dist, directLoS);

      if (stateChanged) {
        // Re-validate turn identity and live status before committing movement state
        if (!isCurrentTurn()) return;
        set(state => ({
          combatState: {
            ...state.combatState,
            monsters: state.combatState.monsters.map(m =>
              m.id === monsterId
                ? {
                    ...m,
                    x: updatedMonster.x,
                    y: updatedMonster.y,
                    viewDirection: updatedMonster.viewDirection,
                    awareness: updatedMonster.awareness
                  }
                : m
            )
          }
        }));
      }

      // Execute attack ONLY IF:
      // 1. A valid attack exists (no fabricated attacks)
      // 2. Distance is within attackRange
      // 3. Fresh checkLoS confirms an unobstructed physical line of sight
      // 4. Turn is still current and monster is alive
      const liveMonster = get().combatState.monsters.find(m => m.id === monsterId);
      if (chosenCandidate && dist <= chosenCandidate.range && directLoS && isCurrentTurn() && liveMonster && liveMonster.hp > 0) {
        const attackAction = {
          name: chosenCandidate.action.name,
          attack_bonus: chosenCandidate.action.attack_bonus ?? 0,
          damage: chosenCandidate.action.damage
        };

        const attackResolved = await resolveCombatAction(
          updatedMonster,
          targetPc ? { id: targetPc.id, name: targetPc.name, stats: targetPc.stats, ac: targetPc.stats?.ac || targetPc.ac } : { id: 'player', name: 'Hero' },
          attackAction,
          { executionVersion, turnIndex, actorId: turnActorId }
        );

        // A DiceBox-busy hostile attack is handled by the background dice resolver.
        // If a real resolution failure still occurs, keep this turn active instead
        // of silently dropping the attack and advancing initiative.
        if (attackResolved === false) {
          if (isCurrentTurn()) {
            addLog(`${updatedMonster.name}'s attack could not be resolved. The turn remains active.`, 'warning');
          }
          return;
        }
      }

      if (!isCurrentTurn()) return;
      setTimeout(() => advanceTurnOnce(), 600);
    }, 600);
  },

  startCombat: async () => {
    if (isStartingCombat) return;
    isStartingCombat = true;
    try {
      const { combatState, addLog } = get();
      const charStore = useCharacterStore.getState();
      const activeParty = charStore.characters.filter((c: any) => c && c.name !== 'Empty Slot' && (!c.isNpc || c.isRecruitable));

      if (activeParty.length === 0) {
        addLog("Cannot start combat without active party members!", "error");
        return;
      }

      // Initialize individual PC positions (ensuring no overlaps with pre-existing monsters)
      const initialPcPositions: Record<string, { x: number; y: number; rotation: number }> = {};
      activeParty.forEach((c: any, index: number) => {
        let x = 2 + Math.floor(index / 3);
        let y = 2 + (index % 3);

        const occupiedPositions = new Set();
        combatState.monsters.forEach(m => occupiedPositions.add(`${m.x},${m.y}`));
        Object.values(initialPcPositions).forEach(pos => occupiedPositions.add(`${pos.x},${pos.y}`));

        while (occupiedPositions.has(`${x},${y}`)) {
          y++;
          if (y > 6) { y = 2; x++; }
        }

        initialPcPositions[c.id] = { x, y, rotation: 0 };
      });

      // Resolve initiative through the canonical dice service so the displayed
      // d20 values and the initiative order always share the same results.
      const initiativeEntries = await Promise.all([
        ...activeParty.map(async (character: any) => {
          const dexterityModifier = Math.floor(((character.stats?.dex || 10) - 10) / 2);
          const roll = await get().rollDiceBackground(
            `1d20${dexterityModifier >= 0 ? '+' : ''}${dexterityModifier}`,
            `Initiative: ${character.name}`,
            {
              actionId: 'initiative',
              actorId: String(character.id),
              actorName: character.name,
              sourceSystem: 'initiative',
              ruleset: get().ruleset
            }
          );

          return {
            id: character.id,
            name: character.name,
            value: roll.total,
            isPlayer: true,
            isAlly: false
          };
        }),
        ...combatState.monsters.map(async monster => {
          const dexterityModifier = monster.stats?.dex
            ? Math.floor((monster.stats.dex - 10) / 2)
            : 0;
          const roll = await get().rollDiceBackground(
            `1d20${dexterityModifier >= 0 ? '+' : ''}${dexterityModifier}`,
            `Initiative: ${monster.name}`,
            {
              actionId: 'initiative',
              actorId: String(monster.id),
              actorName: monster.name,
              sourceSystem: 'initiative',
              ruleset: get().ruleset
            }
          );

          return {
            id: monster.id,
            name: monster.name,
            value: roll.total,
            isPlayer: monster.isAlly || false,
            isAlly: monster.isAlly || false
          };
        })
      ]);

      const order = initiativeEntries.sort((a, b) => b.value - a.value);

      // Reset action economy for everyone at combat start
      activeParty.forEach((c: any) => {
        charStore.restoreActionEconomy(c.id, true);
      });

      // Set first actor active at Round 1 start
      const firstActor = order[0];
      if (firstActor && firstActor.isPlayer) {
        charStore.setActiveCharacter(firstActor.id);
        charStore.restoreActionEconomy(firstActor.id, false);
      }

      if (firstActor) {
        addLog(`Encounter started! Round 1 - Turn begins: ${firstActor.name}`, firstActor.isPlayer || firstActor.isAlly ? 'success' : 'warning');
      }

      // Starting or rerolling initiative invalidates pending combat selections and callbacks.
      turnExecutionVersion += 1;
      const uiState = useUIStore.getState();
      uiState.setIsTargeting(false);
      uiState.setTargetingAction(null);
      uiState.setCombatActionCategory(null);
      set((state) => ({
        combatState: {
          ...state.combatState,
          initiativeOrder: order,
          activeTurnIndex: 0,
          pcPositions: initialPcPositions,
          playerPos: initialPcPositions[activeParty[0]?.id] || { x: 2, y: 2 },
          monsters: state.combatState.monsters.map(m => m.isAlly ? m : { ...m, awareness: 'combat' as const })
        }
      }));

      // Ensure active encounter gameMode is set to 'combat' after initiative order is stored
      if (useUIStore.getState().gameMode !== 'combat') {
        useUIStore.getState().setGameMode('combat');
      }

      // If first actor is a hostile monster, immediately kick off their turn execution!
      if (firstActor) {
        const firstMonster = combatState.monsters.find(m => m.id === firstActor.id);
        const isHostileMonster = !firstActor.isPlayer && (!firstMonster || !firstMonster.isAlly);
        if (isHostileMonster) {
          get().executeMonsterTurn(firstActor.id);
        }
      }
    } finally {
      isStartingCombat = false;
    }
  },

  resolveCombatAction: async (actor, target, action, suppliedTurnContext) => {
    const combatStateAtStart = get().combatState;
    const activeTurnActorAtStart = combatStateAtStart.initiativeOrder[combatStateAtStart.activeTurnIndex];
    const turnContext = suppliedTurnContext || (
      activeTurnActorAtStart?.id === actor?.id
        ? {
            executionVersion: turnExecutionVersion,
            turnIndex: combatStateAtStart.activeTurnIndex,
            actorId: actor.id
          }
        : undefined
    );
    const isActionTurnCurrent = () => {
      if (!turnContext) return true;
      const state = get();
      return (
        turnExecutionVersion === turnContext.executionVersion &&
        state.combatState.activeTurnIndex === turnContext.turnIndex &&
        state.combatState.initiativeOrder[turnContext.turnIndex]?.id === turnContext.actorId
      );
    };

    // Dispatch boundary: Route spell category actions directly to canonical domain spell resolver
    if (action.category === 'Spells') {
      if (!isActionTurnCurrent()) return false;
      const { resolveSpellAction } = await import('../domain/spells/spellResolver');
      const result = await resolveSpellAction(actor, target, action, action.data?.level);
      return isActionTurnCurrent() && result.success;
    }

    const { addLog, rollDice3D, rollDiceBackground, updateRollOutcome, updateMonsterHp, removeMonsterFromCombat, activeCharacterId } = get();
    const characterStore = useCharacterStore.getState();
    const { modifyHp } = characterStore;

    // Ordinary weapon attacks from player/ally Characters are charged here, not in
    // the UI. This makes action consumption authoritative and prevents double-spend.
    const attackingCharacter = characterStore.characters.find(character => character.id === actor?.id);
    const isCharacterWeaponAttack = Boolean(
      attackingCharacter &&
      typeof action?.id === 'string' &&
      (action.id === 'attack' || action.id.startsWith('attack-'))
    );
    const actorCombatant = get().combatState.monsters.find(monster => monster.id === actor?.id);
    const isHostileMonsterAttack = Boolean(actorCombatant && !actorCombatant.isAlly && !isCharacterWeaponAttack);

    if (isCharacterWeaponAttack && attackingCharacter) {
      const currentCombatState = get().combatState;
      const targetCombatant = target?.id
        ? currentCombatState.monsters.find(monster => monster.id === target.id)
        : undefined;

      if (!targetCombatant || targetCombatant.isAlly || targetCombatant.hp <= 0) {
        addLog('Invalid attack target. Select an active hostile combatant.', 'error');
        return false;
      }

      // Keep canonical PC position data first. Allied NPC combatants may not have a
      // pcPositions entry, so use their live encounter coordinates before the legacy
      // player-position fallback.
      const alliedActorCombatant = currentCombatState.monsters.find(
        monster => monster.id === actor.id && monster.isAlly
      );
      const actorPosition = currentCombatState.pcPositions?.[actor.id] || (
        alliedActorCombatant
          ? { x: alliedActorCombatant.x, y: alliedActorCombatant.y }
          : currentCombatState.playerPos
      );
      const targetFootprint = targetCombatant.size === 'Large' ? 2 : 1;
      const attackRange = typeof action.range === 'number' && Number.isFinite(action.range)
        ? Math.max(0, action.range)
        : 1;
      let hasValidTargetCell = false;

      for (let fy = 0; fy < targetFootprint && !hasValidTargetCell; fy++) {
        for (let fx = 0; fx < targetFootprint && !hasValidTargetCell; fx++) {
          const targetPosition = { x: targetCombatant.x + fx, y: targetCombatant.y + fy };
          const distance = combatUtils.getDistance(actorPosition, targetPosition);
          const hasLineOfSight = combatUtils.checkLoS(
            actorPosition,
            targetPosition,
            currentCombatState.grid,
            currentCombatState.walls || []
          );

          hasValidTargetCell = distance <= attackRange && hasLineOfSight;
        }
      }

      if (!hasValidTargetCell) {
        addLog('Target is out of range or blocked by an obstacle.', 'warning');
        return false;
      }

      const availableAction = attackingCharacter.actionEconomy?.actions;
      if (!availableAction || !Number.isFinite(availableAction.current)) {
        addLog('Cannot resolve this attack because the character action resource is unavailable.', 'error');
        return false;
      }

      if (availableAction.current <= 0) {
        addLog("You don't have any actions remaining!", 'error');
        return false;
      }

      if (get().isRolling3D) {
        addLog('The dice are still rolling. Finish the current roll before attacking again.', 'warning');
        return false;
      }

      // Use the canonical current combatant snapshot for hit/damage resolution.
      target = targetCombatant;
    }

    // Rotate actor to face target
    const { combatState } = get();
    const actorX = actor.id === 'player' || combatState.pcPositions?.[actor.id]
      ? (combatState.pcPositions?.[actor.id]?.x ?? combatState.playerPos.x)
      : actor.x;
    const actorY = actor.id === 'player' || combatState.pcPositions?.[actor.id]
      ? (combatState.pcPositions?.[actor.id]?.y ?? combatState.playerPos.y)
      : actor.y;

    const targetX = target.id === 'player' || combatState.pcPositions?.[target.id]
      ? (combatState.pcPositions?.[target.id]?.x ?? combatState.playerPos.x)
      : target.x;
    const targetY = target.id === 'player' || combatState.pcPositions?.[target.id]
      ? (combatState.pcPositions?.[target.id]?.y ?? combatState.playerPos.y)
      : target.y;

    const svgPath = getAttackSvgPath(action.name || '');
    set(state => ({
      combatState: {
        ...state.combatState,
        activeAttack: {
          attackerId: actor.id,
          targetId: target.id,
          targetX,
          targetY,
          svgPath
        }
      }
    }));
    setTimeout(() => {
      set(state => ({
        combatState: {
          ...state.combatState,
          activeAttack: null
        }
      }));
    }, 1200);

    const dx = targetX - actorX;
    const dy = targetY - actorY;
    if (dx !== 0 || dy !== 0) {
      const rot = Math.atan2(-dx, dy) * (180 / Math.PI);
      if (actor.id === 'player' || combatState.pcPositions?.[actor.id]) {
        set((state) => ({
          combatState: {
            ...state.combatState,
            pcPositions: {
              ...(state.combatState.pcPositions || {}),
              [actor.id]: {
                ...(state.combatState.pcPositions?.[actor.id] || { x: actorX, y: actorY }),
                rotation: rot
              }
            }
          }
        }));
      } else {
        set((state) => ({
          combatState: {
            ...state.combatState,
            monsters: state.combatState.monsters.map(m => m.id === actor.id ? { ...m, viewDirection: rot } : m)
          }
        }));
      }
    }

    // 1. Roll to Hit
    const attackBonus = action.attack_bonus || 0;
    const toHitNotation = `1d20+${attackBonus}`;

    addLog(`${actor.name} attacks ${target.name} with ${action.name}...`, 'info');

    // Play weapon attack swing sound effect
    soundService.playEffect('COMBAT_SLASH');

    // The visible DiceBox result is authoritative when available. Hostile NPCs
    // use the same canonical background resolver if DiceBox is already busy, so
    // their attack is not silently discarded and no second RNG path is introduced.
    const rollContext = {
      actionId: String(action.id || 'monster-attack'),
      actorId: String(actor.id),
      actorName: actor.name,
      targetId: String(target.id),
      targetName: target.name,
      sourceSystem: 'combat',
      ruleset: get().ruleset
    };
    let hitRoll = await rollDice3D(toHitNotation, `Attack: ${action.name}`, undefined, undefined, rollContext);

    if (!hitRoll && isHostileMonsterAttack) {
      hitRoll = await rollDiceBackground(toHitNotation, `Attack: ${action.name}`, rollContext);
    }

    if (!isActionTurnCurrent()) {
      if (hitRoll) {
        updateRollOutcome(hitRoll.id, {
          status: 'CANCELLED',
          detail: 'The initiating turn ended before the attack was resolved.'
        });
      }
      addLog(`${actor.name}'s attack was cancelled because their turn ended before the roll resolved.`, 'warning');
      return false;
    }

    if (!hitRoll || hitRoll.label.endsWith('(Failed)')) {
      addLog('The attack roll could not be completed. No attack result was applied.', 'error');
      return false;
    }

    // Spend the player's action only when the result is still attached to the
    // turn that initiated it. A late result from an earlier turn is discarded.
    if (isCharacterWeaponAttack) {
      characterStore.consumeAction(actor.id, 'actions');
    }

    const d20 = hitRoll.rolls.find(roll => roll.die === 20 && roll.valid !== false)?.result
      ?? Math.max(1, Math.min(20, hitRoll.total - attackBonus));
    const totalHit = hitRoll.total;

    // Get target AC from Atlas-compatible data
    let targetAC = 10;

    if (target.id === 'player') {
       // Fetch target character's AC calculation from character store
       const targetChar = useCharacterStore.getState().characters.find(c => c.id === activeCharacterId);
       targetAC = (targetChar as any)?.stats?.ac || (targetChar as any)?.ac || 10;
    } else if (target.armor_class !== undefined) {
      if (Array.isArray(target.armor_class)) {
        targetAC = target.armor_class[0]?.value || 10;
      } else if (typeof target.armor_class === 'number') {
        targetAC = target.armor_class;
      } else if (target.armor_class?.base) {
        targetAC = target.armor_class.base;
      } else {
        targetAC = target.armor_class;
      }
    } else if (target.stats?.dex) {
       targetAC = 10 + Math.floor((target.stats.dex - 10) / 2);
    }

    // Apply conditions (e.g., Defending +2 AC)
    if (combatState.activeConditions[target.id]?.includes('defending')) {
      targetAC += 2;
      addLog(`${target.name} is defending! AC is now ${targetAC}.`, 'info');
    }

    const isCrit = d20 === 20;
    const isHit = isCrit || (d20 !== 1 && totalHit >= targetAC);

    if (isHit) {
      // Play weapon impact hit sound effect
      soundService.playEffect('COMBAT_HIT');
      addLog(`${isCrit ? 'CRITICAL HIT!' : 'HIT!'} (${totalHit} vs AC ${targetAC})`, isCrit ? 'success' : 'info');

      // 2. Roll Damage
      const damageInfo = action.damage?.[0];
      const damageDice = damageInfo?.damage_dice || '1d6';
      const damageType = damageInfo?.damage_type?.name || 'slashing';

      // Double dice for crits (simplified)
      const finalDice = isCrit ? damageDice.replace(/(\d+)d/, (match: string, num: string) => `${parseInt(num) * 2}d`) : damageDice;

      // Damage uses the same canonical resolver and is published to the in-game roll history.
      const damageRoll = await rollDiceBackground(finalDice, 'Damage', {
        actionId: String(action.id || 'weapon-attack'),
        actorId: String(actor.id),
        actorName: actor.name,
        targetId: String(target.id),
        targetName: target.name,
        sourceSystem: 'combat-damage',
        ruleset: get().ruleset
      });

      if (!isActionTurnCurrent()) {
        updateRollOutcome(hitRoll.id, {
          status: 'CANCELLED',
          detail: 'The initiating turn ended before damage was applied.'
        });
        updateRollOutcome(damageRoll.id, {
          status: 'CANCELLED',
          detail: 'The initiating turn ended before damage was applied.'
        });
        addLog(`${actor.name}'s damage was discarded because their turn ended during resolution.`, 'warning');
        return false;
      }

      updateRollOutcome(hitRoll.id, {
        status: isCrit ? 'CRITICAL HIT' : 'HIT',
        detail: `${totalHit} vs AC ${targetAC}`
      });
      addLog(`${target.name} takes ${damageRoll.total} ${damageType} damage.`, 'error');

      // 3. Update HP
      const isPC = useCharacterStore.getState().characters.some(c => c.id === target.id) || target.id === 'player' || target.id === 'slot1';
      if (isPC) {
        const targetId = (target.id === 'player') ? activeCharacterId : target.id;
        modifyHp(targetId, -damageRoll.total, isCrit);
      } else {
        const currentHp = target.hp !== undefined ? target.hp : target.hit_points;
        const newHp = currentHp - damageRoll.total;
        updateMonsterHp(target.id, newHp);
        if (newHp <= 0) {
          addLog(`${target.name} has been defeated!`, 'success');
          // Delay removal for visual feedback
          setTimeout(() => {
            removeMonsterFromCombat(target.id);
            const { combatState: latestState } = get();
            if (latestState.monsters.length === 0) {
              get().completeCombat(true);
            }
          }, 1000);
        }
      }
    } else {
      updateRollOutcome(hitRoll.id, {
        status: 'MISS',
        detail: `${totalHit} vs AC ${targetAC}`
      });
      addLog(`MISS! (${totalHit} vs AC ${targetAC})`, 'warning');
    }

    return true;
  },

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

  rollDice: (label, modifier, dieType = 20) => {
    const notation = `1d${dieType}${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
    void get().rollDiceBackground(notation, label);
  },

  rollDiceBackground: async (notation, label, context, seed) => {
    const { diceService } = await import('../dice_roller/diceService');
    const rollContext = context || { sourceSystem: 'manual', ruleset: get().ruleset };
    const result = diceService.rollBackground(notation, label, { context: rollContext, seed });
    set(state => ({
      recentRolls: [result, ...state.recentRolls].slice(0, 5)
    }));
    return result;
  },

  rollDice3D: async (notation, label, theme, color, context) => {
    const { diceService } = await import('../dice_roller/diceService');
    const selectedDiceTheme = 'default';
    const selectedDiceColor = '#8b0000';

    if (diceService.isRolling || get().isRolling3D) {
      console.warn("[GameStore] Roll request ignored: DiceService is currently rolling.");
      return null;
    }

    set({ isRolling3D: true });
    try {
      const rollContext = context || { sourceSystem: 'manual', ruleset: get().ruleset };
      const result = await diceService.roll3D(
        notation,
        label,
        theme || selectedDiceTheme,
        color || selectedDiceColor,
        rollContext
      );
      if (!result) return null;

      set(state => ({
        recentRolls: [result, ...state.recentRolls].slice(0, 5)
      }));
      return result;
    } catch (error) {
      console.error("Roll failed", error);
      return null;
    } finally {
      set({ isRolling3D: false });
    }
  },

  updateRollOutcome: (rollId, outcome) => set(state => ({
    recentRolls: state.recentRolls.map(roll =>
      roll.id === rollId ? { ...roll, outcome } : roll
    )
  })),

  applyRollModifier: (rollId, modifier) => {
    if (!Number.isFinite(modifier) || modifier === 0) {
      return get().recentRolls.find(roll => roll.id === rollId) || null;
    }

    let updatedRoll: DiceResult | null = null;
    set(state => ({
      recentRolls: state.recentRolls.map(roll => {
        if (roll.id !== rollId) return roll;
        updatedRoll = {
          ...roll,
          total: roll.total + modifier,
          modifier: roll.modifier + modifier
        };
        return updatedRoll;
      })
    }));
    return updatedRoll;
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
  setIsRolling3D: (isRolling3D) => set({ isRolling3D }),

  addToPreview: (item) => set((state) => ({ 
    activeCards: [...state.activeCards, { ...item }]
    // viewMode should be handled by useUIStore
  })),

  removeFromPreview: (index) => set((state) => ({
    activeCards: state.activeCards.filter((_, i) => i !== index)
  })),

  clearPreview: () => set({ activeCards: [] }),
}));

const globalObj = typeof window !== 'undefined' ? (window as any) : (globalThis as any);
globalObj.useGameStore = useGameStore;
