import { create } from 'zustand';
import { useUIStore } from './useUIStore';
import { useCharacterStore } from './useCharacterStore';
import * as combatUtils from '../components/combat/combatUtils';
import { soundService } from '../services/soundService';

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
  type: 'floor' | 'wall' | 'door';
  isOpen?: boolean;
  explored?: boolean;
}

export interface CombatMonster {
  id: string;
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
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface GameState {
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
  recentRolls: any[];

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

  // Actions
  setCurrentNPC: (npc: any | null) => void;
  setEmotion: (emotion: string) => void;
  setIsGameStarted: (started: boolean) => void;
  
  // Logs Actions
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;

  // Dice Actions
  rollDice: (label: string, modifier: number, dieType?: number) => void;
  rollDice3D: (notation: string, label: string, theme?: string, color?: string) => Promise<void>;
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
  toggleDoor: (x: number, y: number) => void;
  completeCombat: (victory: boolean) => Promise<void>;
  nextTurn: () => void;
  startCombat: () => Promise<void>;
  resolveCombatAction: (actor: any, target: any, action: any) => Promise<void>;
  executeMonsterTurn: (monsterId: string) => Promise<void>;
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

export const useGameStore = create<GameState>((set, get) => ({
  currentNPC: null,
  emotion: 'Neutral',
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
      // Find an empty spot
      const occupiedPositions = new Set(state.combatState.monsters.map(m => `${m.x},${m.y}`));
      while (occupiedPositions.has(`${x},${y}`)) {
        y++;
        if (y > 6) { y = 2; x++; }
      }
    }

    const newMonster: CombatMonster = {
      id,
      name: monster.name,
      type: monster.type || 'monster',
      hp: monster.hit_points || 10,
      maxHp: monster.hit_points || 10,
      x,
      y,
      imageUrl: monster.imageUrl || monster.image,
      awareness: 'idle',
      viewDirection: 3,
      perception: monster.senses?.passive_perception || 10,
      speed: monster.speed?.walk ? parseInt(monster.speed.walk) / 5 : 6,
      stats: {
        str: monster.strength || 10,
        dex: monster.dexterity || 10,
        con: monster.constitution || 10,
        int: monster.intelligence || 10,
        wis: monster.wisdom || 10,
        cha: monster.charisma || 10
      },
      armor_class: monster.armor_class,
      isAlly: monster.isAlly || false,
      xp: monster.xp || 0
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

  removeMonsterFromCombat: (id) => set((state) => ({
    combatState: {
      ...state.combatState,
      monsters: state.combatState.monsters.filter(m => m.id !== id),
      initiativeOrder: state.combatState.initiativeOrder.filter(i => i.id !== id)
    }
  })),

  toggleDoor: (x, y) => set((state) => {
    const newGrid = [...state.combatState.grid];
    if (newGrid[y]?.[x] && newGrid[y][x].type === 'door') {
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = { ...newGrid[y][x], isOpen: !newGrid[y][x].isOpen };

      // Mark as explored if player opens it
      newGrid[y][x].explored = true;
    }
    return {
      combatState: {
        ...state.combatState,
        grid: newGrid
      }
    };
  }),

  completeCombat: async (victory) => {
    const { combatState, addLog } = get();
    const { characters, addXp } = useCharacterStore.getState();
    
    console.log("BUG 3 INVESTIGATION - characters at combat end:", characters.map(c => c.id));

    if (victory) {
      const activePcs = characters.filter(char => !char.isNpc);
      const pcCount = activePcs.length || 1;
      const totalXp = combatState.monsters.reduce((acc, m) => acc + (m.isAlly ? 0 : (m.xp || 0)), 0) || 500;
      const dividedXp = Math.floor(totalXp / pcCount);

      addLog(`Victory! The party earns ${totalXp} XP (divided as ${dividedXp} XP per character).`, 'success');
      for (const char of activePcs) {
        await addXp(char.id, dividedXp);
      }
    } else {
      addLog("The party has been defeated...", 'error');
    }

    useUIStore.getState().setGameMode('exploration');
  },

  nextTurn: () => {
    const { combatState, addLog, executeMonsterTurn } = get();
    if (combatState.initiativeOrder.length === 0) {
      addLog("No one is in the initiative order!", "warning");
      return;
    }
    const nextIndex = (combatState.activeTurnIndex + 1) % combatState.initiativeOrder.length;
    const nextActor = combatState.initiativeOrder[nextIndex];

    // Refresh action economy for player characters on turn start
    if (nextActor.isPlayer) {
      const { restoreActionEconomy, setActiveCharacter } = useCharacterStore.getState();
      restoreActionEconomy(nextActor.id, false);
      setActiveCharacter(nextActor.id);
    }

    addLog(`Turn begins: ${nextActor.name}`, nextActor.isPlayer || nextActor.isAlly ? 'success' : 'warning');

    set((state) => {
      const newConditions = { ...state.combatState.activeConditions };
      // Clear conditions for the actor starting their turn
      if (newConditions[nextActor.id]) {
        delete newConditions[nextActor.id];
      }

      return {
        combatState: {
          ...state.combatState,
          activeTurnIndex: nextIndex,
          activeConditions: newConditions
        }
      };
    });

    // Advanced Monster AI (Only for hostile/non-ally monsters)
    const nextMonster = combatState.monsters.find(m => m.id === nextActor.id);
    const isHostileMonster = !nextActor.isPlayer && (!nextMonster || !nextMonster.isAlly);

    if (isHostileMonster) {
      executeMonsterTurn(nextActor.id);
    }
  },

  executeMonsterTurn: async (monsterId: string) => {
    const { combatState, addLog, resolveCombatAction } = get();
    const currentMonster = combatState.monsters.find(m => m.id === monsterId);
    if (!currentMonster) {
      get().nextTurn();
      return;
    }

    setTimeout(async () => {
      // Re-fetch current state inside timeout to ensure we have fresh data
      const { combatState: currentCombatState } = get();
      const freshMonster = currentCombatState.monsters.find(m => m.id === monsterId);
      if (!freshMonster) {
        get().nextTurn();
        return;
      }

      const { checkLoS, isInViewCone, findPath, getDistance } = combatUtils;
      const playerPos = currentCombatState.playerPos;

      let updatedMonster = { ...freshMonster };
      let stateChanged = false;

      // 1. Awareness Check
      if (updatedMonster.awareness !== 'combat') {
        const hasLoS = checkLoS(updatedMonster, playerPos, currentCombatState.grid);
        const inCone = isInViewCone(updatedMonster, playerPos);

        if (hasLoS && inCone) {
          updatedMonster.awareness = 'combat';
          addLog(`${updatedMonster.name} spotted you!`, 'warning');
          stateChanged = true;
        } else if (hasLoS && getDistance(updatedMonster, playerPos) <= 3) {
           // Passive perception check (simplified: close proximity = alert)
           updatedMonster.awareness = 'alert';
           updatedMonster.lastKnownPlayerPos = { ...playerPos };
           stateChanged = true;
        }
      }

      // 2. State-based Action
      const monsterSpeed = updatedMonster.speed || 6;
      const attackRange = updatedMonster.type === 'archer' ? 6 : (updatedMonster.type === 'mage' ? 12 : 1);

      if (updatedMonster.awareness === 'combat') {
        const dist = getDistance(updatedMonster, playerPos);
        if (dist <= attackRange) {
          await resolveCombatAction(
            updatedMonster,
            { id: 'player', name: 'Hero' },
            {
              name: updatedMonster.type === 'archer' ? 'Longbow' : (updatedMonster.type === 'mage' ? 'Fire Bolt' : 'Claw/Bite'),
              attack_bonus: 4,
              damage: [{ damage_dice: '1d6+2', damage_type: { name: 'piercing' } }]
            }
          );
        } else {
          const path = findPath(updatedMonster, playerPos, currentCombatState.grid);
          if (path && path.length > 1) {
            // Move up to speed, but stop before overlapping the player
            const moveSteps = Math.min(path.length - 1, monsterSpeed);
            const moveTarget = path[moveSteps - 1];

            updatedMonster.x = moveTarget.x;
            updatedMonster.y = moveTarget.y;

            // Update view direction based on movement
            const firstStep = path[0];
            if (firstStep.x > freshMonster.x) updatedMonster.viewDirection = 1;
            else if (firstStep.x < freshMonster.x) updatedMonster.viewDirection = 3;
            else if (firstStep.y > freshMonster.y) updatedMonster.viewDirection = 2;
            else if (firstStep.y < freshMonster.y) updatedMonster.viewDirection = 0;
            stateChanged = true;
          }
        }
      } else if (updatedMonster.awareness === 'alert' && updatedMonster.lastKnownPlayerPos) {
        const path = findPath(updatedMonster, updatedMonster.lastKnownPlayerPos, currentCombatState.grid);
        if (path && path.length > 0) {
          const moveSteps = Math.min(path.length, monsterSpeed);
          const moveTarget = path[moveSteps - 1];
          updatedMonster.x = moveTarget.x;
          updatedMonster.y = moveTarget.y;
          stateChanged = true;
          if (updatedMonster.x === updatedMonster.lastKnownPlayerPos.x && updatedMonster.y === updatedMonster.lastKnownPlayerPos.y) {
             updatedMonster.awareness = 'idle';
             updatedMonster.lastKnownPlayerPos = undefined;
          }
        }
      } else {
        // Idle patrol (very simple: rotate)
        updatedMonster.viewDirection = (updatedMonster.viewDirection + 1) % 4;
        stateChanged = true;
      }

      if (stateChanged) {
        set(state => ({
          combatState: {
            ...state.combatState,
            monsters: state.combatState.monsters.map(m => m.id === monsterId ? updatedMonster : m)
          }
        }));
      }

      setTimeout(() => get().nextTurn(), 1000);
    }, 1000);
  },

  startCombat: async () => {
    const { combatState, addLog } = get();
    const charStore = useCharacterStore.getState();
    const activeParty = charStore.characters.filter((c: any) => c && c.name !== 'Empty Slot' && (!c.isNpc || c.isRecruitable));

    if (activeParty.length === 0) {
      addLog("Cannot start combat without active party members!", "error");
      return;
    }

    // Initialize individual PC positions
    const initialPcPositions: Record<string, { x: number; y: number; rotation: number }> = {};
    activeParty.forEach((c: any, index: number) => {
      const x = 2 + Math.floor(index / 3);
      const y = 2 + (index % 3);
      initialPcPositions[c.id] = { x, y, rotation: 0 };
    });

    // Roll initiative for everyone
    const order = [
      ...activeParty.map((c: any) => ({
        id: c.id,
        name: c.name,
        value: Math.floor(Math.random() * 20) + 1 + (Math.floor(((c.stats?.dex || 10) - 10) / 2) || 0),
        isPlayer: true,
        isAlly: false
      })),
      ...combatState.monsters.map(m => ({
        id: m.id,
        name: m.name,
        value: Math.floor(Math.random() * 20) + 1 + (m.stats?.dex ? Math.floor((m.stats.dex - 10) / 2) : 0),
        isPlayer: m.isAlly || false, // Treat allies/summons as player-controlled in the turn order
        isAlly: m.isAlly || false
      }))
    ].sort((a, b) => b.value - a.value);

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

    set((state) => ({
      combatState: {
        ...state.combatState,
        initiativeOrder: order,
        activeTurnIndex: 0,
        pcPositions: initialPcPositions,
        playerPos: initialPcPositions[activeParty[0]?.id] || { x: 2, y: 2 }
      }
    }));

    // If first actor is a hostile monster, immediately kick off their turn execution!
    if (firstActor) {
      const firstMonster = combatState.monsters.find(m => m.id === firstActor.id);
      const isHostileMonster = !firstActor.isPlayer && (!firstMonster || !firstMonster.isAlly);
      if (isHostileMonster) {
        get().executeMonsterTurn(firstActor.id);
      }
    }
  },

  resolveCombatAction: async (actor, target, action) => {
    const { addLog, rollDice3D, updateMonsterHp, removeMonsterFromCombat, activeCharacterId } = get();
    const { modifyHp } = useCharacterStore.getState();

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

    // We'll use a simulated 3D roll for the hit
    await rollDice3D(toHitNotation, `Attack: ${action.name}`);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalHit = d20 + attackBonus;

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
    const isHit = isCrit || totalHit >= targetAC;

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

      // We'll use rollBackground for damage to not overlap 3D dice too much
      const { diceService } = await import('../dice_roller/diceService');
      const damageRoll = diceService.rollBackground(finalDice, 'Damage');

      addLog(`${target.name} takes ${damageRoll.total} ${damageType} damage.`, 'error');

      // 3. Update HP
      if (target.id === 'player' || target.id === 'slot1') {
        const targetId = target.id === 'player' ? activeCharacterId : target.id;
        modifyHp(targetId, -damageRoll.total);
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
      addLog(`MISS! (${totalHit} vs AC ${targetAC})`, 'warning');
    }
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
    import('../dice_roller/diceService').then(({ diceService }) => {
      const notation = `1d${dieType}${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
      const result = diceService.rollBackground(notation, label);

      const rollDetails = result.rolls
        .filter(r => r.valid !== false)
        .map(r => r.result)
        .join(' + ');
      const modStr = result.modifier !== 0 ? ` ${result.modifier > 0 ? '+' : ''} ${result.modifier}` : '';
      const detailStr = rollDetails ? `(${rollDetails}${modStr})` : '';
      get().addLog(`${label}: ${result.notation} ${detailStr} = ${result.total}`, 'info');

      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
    });
  },

  rollDice3D: async (notation, label, theme, color) => {
    const { diceService } = await import('../dice_roller/diceService');
    const selectedDiceTheme = 'default';
    const selectedDiceColor = '#8b0000';
    
    set({ isRolling3D: true });
    try {
      const result = await diceService.roll3D(notation, label, theme || selectedDiceTheme, color || selectedDiceColor);
      
      // Create detailed log message
      const rollDetails = result.rolls
        .filter(r => r.valid !== false)
        .map(r => r.result)
        .join(' + ');
      
      const modStr = result.modifier !== 0 
        ? ` ${result.modifier > 0 ? '+' : ''} ${result.modifier}`
        : '';
        
      const detailStr = rollDetails ? `(${rollDetails}${modStr})` : '';
      const message = `${label}: ${result.notation} ${detailStr} = ${result.total}`;
      
      get().addLog(message, 'info');

      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
      
      // Auto-clear 3D dice after a delay
      setTimeout(() => {
        diceService.clear();
        set({ isRolling3D: false });
      }, 5000);
    } catch (error) {
      console.error("Roll failed", error);
      set({ isRolling3D: false });
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

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
