import { create } from 'zustand';

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

export interface CombatState {
  playerPos: { x: number; y: number };
  monsters: Array<{
    id: string;
    name: string;
    type: string;
    hp: number;
    maxHp: number;
    x: number;
    y: number;
    imageUrl?: string;
  }>;
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
  combatState: CombatState;

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
}

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
    monsters: [
      { id: 'm1', name: 'Goblin Scout', type: 'goblin', hp: 7, maxHp: 7, x: 5, y: 3 },
      { id: 'm2', name: 'Worg', type: 'worg', hp: 26, maxHp: 26, x: 6, y: 5 }
    ]
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
