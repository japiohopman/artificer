import { create } from 'zustand';
import { useUIStore } from './useUIStore';
import * as combatUtils from '../lib/combatUtils';

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
}

export interface CombatState {
  playerPos: { x: number; y: number };
  monsters: CombatMonster[];
  initiativeOrder: Array<{
    id: string;
    name: string;
    value: number;
    isPlayer?: boolean;
  }>;
  activeTurnIndex: number;
  grid: TacticalCell[][];
  victoryXp: number;
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
  setPlayerPos: (x: number, y: number) => void;
  updateMonsterHp: (id: string, hp: number) => void;
  addMonsterToCombat: (monster: any, x?: number, y?: number) => void;
  spawnMonster: (index: string, x?: number, y?: number) => Promise<void>;
  removeMonsterFromCombat: (id: string) => void;
  toggleDoor: (x: number, y: number) => void;
  completeCombat: (victory: boolean) => Promise<void>;
  nextTurn: () => void;
  startCombat: () => Promise<void>;
  resolveCombatAction: (actor: any, target: any, action: any) => Promise<void>;
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

export const useGameStore = create<GameState>((set, get) => ({
  currentNPC: null,
  emotion: 'Neutral',
  characters: [],
  activeCharacterId: '',
  logs: [],
  activeCards: [],
  isDiceReady: false,
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
    activeConditions: {}
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

  setPlayerPos: (x, y) => set((state) => ({
    combatState: {
      ...state.combatState,
      playerPos: { x, y }
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
      imageUrl: monster.imageUrl,
      awareness: 'idle',
      viewDirection: 3,
      perception: 10,
      speed: monster.speed?.walk ? parseInt(monster.speed.walk) / 5 : 6
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
    const { useCharacterStore } = await import('./useCharacterStore');
    const { characters, addXp } = useCharacterStore.getState();

    if (victory) {
      addLog(`Victory! The party earns ${combatState.victoryXp} XP.`, 'success');
      for (const char of characters) {
        if (!char.isNpc) {
          await addXp(char.id, combatState.victoryXp);
        }
      }
    } else {
      addLog("The party has been defeated...", 'error');
    }

    useUIStore.getState().setGameMode('exploration');
  },

  nextTurn: () => {
    const { combatState, addLog, resolveCombatAction } = get();
    const nextIndex = (combatState.activeTurnIndex + 1) % combatState.initiativeOrder.length;
    const nextActor = combatState.initiativeOrder[nextIndex];

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

    // Advanced Monster AI
    if (!nextActor.isPlayer) {
      setTimeout(async () => {
        const { combatState: currentCombatState } = get();
        const currentMonster = currentCombatState.monsters.find(m => m.id === nextActor.id);
        if (!currentMonster) {
          get().nextTurn();
          return;
        }

        const { checkLoS, isInViewCone, findPath, getDistance } = combatUtils;
        const playerPos = currentCombatState.playerPos;

        let updatedMonster = { ...currentMonster };
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
              if (firstStep.x > currentMonster.x) updatedMonster.viewDirection = 1;
              else if (firstStep.x < currentMonster.x) updatedMonster.viewDirection = 3;
              else if (firstStep.y > currentMonster.y) updatedMonster.viewDirection = 2;
              else if (firstStep.y < currentMonster.y) updatedMonster.viewDirection = 0;
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
              monsters: state.combatState.monsters.map(m => m.id === nextActor.id ? updatedMonster : m)
            }
          }));
        }

        setTimeout(() => get().nextTurn(), 1000);
      }, 1000);
    }
  },

  startCombat: async () => {
    const { combatState } = get();
    const { useCharacterStore } = await import('./useCharacterStore');
    const { characters } = useCharacterStore.getState();
    const activeParty = characters.filter((c: any) => !c.isNpc || c.isRecruitable);

    const order = [
      ...activeParty.map((c: any) => ({
        id: c.id,
        name: c.name,
        value: Math.floor(Math.random() * 20) + 1 + (Math.floor((c.stats.dex - 10) / 2) || 0),
        isPlayer: true
      })),
      ...combatState.monsters.map(m => ({
        id: m.id,
        name: m.name,
        value: Math.floor(Math.random() * 20) + 1 + 1
      }))
    ].sort((a, b) => b.value - a.value);

    set((state) => ({
      combatState: {
        ...state.combatState,
        initiativeOrder: order,
        activeTurnIndex: 0
      }
    }));
  },

  resolveCombatAction: async (actor, target, action) => {
    const { addLog, rollDice3D, updateMonsterHp, removeMonsterFromCombat, activeCharacterId } = get();
    const { useCharacterStore } = await import('./useCharacterStore');
    const { modifyHp } = useCharacterStore.getState();

    // 1. Roll to Hit
    const attackBonus = action.attack_bonus || 0;
    const toHitNotation = `1d20+${attackBonus}`;

    addLog(`${actor.name} attacks ${target.name} with ${action.name}...`, 'info');

    // We'll use a simulated 3D roll for the hit
    await rollDice3D(toHitNotation, `Attack: ${action.name}`);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalHit = d20 + attackBonus;

    // Get target AC
    let targetAC = 10;
    const { combatState } = get();

    if (target.id === 'player') {
       // Ideally we'd get this from useCharacterStore, but for now use default + condition
       targetAC = 15;
    } else if (Array.isArray(target.armor_class)) {
      targetAC = target.armor_class[0]?.value || 10;
    } else if (typeof target.armor_class === 'number') {
      targetAC = target.armor_class;
    } else if (target.armor_class?.base) {
      targetAC = target.armor_class.base;
    }

    // Apply conditions (e.g., Defending +2 AC)
    if (combatState.activeConditions[target.id]?.includes('defending')) {
      targetAC += 2;
      addLog(`${target.name} is defending! AC is now ${targetAC}.`, 'info');
    }

    const isCrit = d20 === 20;
    const isHit = isCrit || totalHit >= targetAC;

    if (isHit) {
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
      set((state) => ({ 
        recentRolls: [result, ...state.recentRolls].slice(0, 5) 
      }));
    });
  },

  rollDice3D: async (notation, label, theme, color) => {
    const { diceService } = await import('../dice_roller/diceService');
    // For theme/color, we might need a reference to useUIStore but can pass defaults for now
    const selectedDiceTheme = 'default';
    const selectedDiceColor = '#8b0000';
    
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

  addToPreview: (item) => set((state) => ({ 
    activeCards: [...state.activeCards, { ...item }]
    // viewMode should be handled by useUIStore
  })),

  removeFromPreview: (index) => set((state) => ({
    activeCards: state.activeCards.filter((_, i) => i !== index)
  })),

  clearPreview: () => set({ activeCards: [] }),
}));
