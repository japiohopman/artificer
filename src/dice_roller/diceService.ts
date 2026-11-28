import DiceBox from "@3d-dice/dice-box";
import DiceParserInterface from "@3d-dice/dice-parser-interface";
import {
  resolveDiceNotation,
  extractDiceRolls,
  type DiceResult,
  type DiceRollContext,
  type DiceResolveOptions
} from "./diceResolver";

// Handle potential CJS/ESM interop issues for dice-parser-interface
const DiceParser = (DiceParserInterface as any).default || DiceParserInterface;

export type { DiceResult } from "./diceResolver";

export type DiceServiceStatus = 'idle' | 'rolling';

class DiceService {
  private diceBox: any;
  private parser: any;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private status: DiceServiceStatus = 'idle';
  private listeners: Set<(status: DiceServiceStatus) => void> = new Set();

  constructor() {
    this.parser = new DiceParser();
  }

  get isRolling(): boolean {
    return this.status === 'rolling';
  }

  getStatus(): DiceServiceStatus {
    return this.status;
  }

  subscribe(listener: (status: DiceServiceStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async updateGameStoreState(isRolling: boolean) {
    try {
      const { useGameStore } = await import('../store/useGameStore');
      useGameStore.getState().setIsRolling3D(isRolling);
    } catch (e) {
      console.warn('[DiceService] Could not update useGameStore:', e);
    }
  }

  private setStatus(status: DiceServiceStatus) {
    this.status = status;
    const isRolling = status === 'rolling';
    this.updateGameStoreState(isRolling);
    this.listeners.forEach(l => l(status));
  }

  async init(containerArg: string | HTMLElement): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async (): Promise<void> => {
      try {
        const selector = typeof containerArg === 'string' ? containerArg : `#${containerArg.id || 'dice-box-container'}`;
        console.log("[DiceService] Initializing DiceBox with selector:", selector);
        
        // Ensure the container exists in the DOM before initializing
        let containerElement = document.querySelector(selector);
        if (!containerElement && typeof containerArg !== 'string') {
          containerElement = containerArg;
        }
        
        if (!containerElement) {
          console.warn(`[DiceService] Container ${selector} not found in DOM. Retrying in 100ms...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          this.initPromise = null;
          return this.init(containerArg);
        }

        this.initialized = false;
        
        // Use local assets from the public directory
        const ASSET_PATH = "/assets/dice-box/";
        
        this.diceBox = new DiceBox({
          container: selector,
          assetPath: ASSET_PATH,
          origin: window.location.origin,
          theme: "default",
          offscreen: false,
          scale: 6,
          startingHeight: 8,
          throwForce: 6,
          spinForce: 5,
          lightIntensity: 0.8,
          gravity: 2,
          settleTimeout: 5000,
          boxControls: false
        });

        // Add a longer timeout to initialization (30s)
        const initTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("DiceBox initialization timed out after 30s")), 30000)
        );

        console.log("[DiceService] Waiting for DiceBox.init()...");
        await Promise.race([
          this.diceBox.init(),
          initTimeout
        ]);
        
        console.log("[DiceService] DiceBox initialized successfully.");
        this.initialized = true;

        // Force a resize calculation
        if (this.diceBox && typeof this.diceBox.resize === 'function') {
          this.diceBox.resize();
        }
      } catch (error) {
        console.error("[DiceService] Failed to initialize DiceBox:", error);
        this.initPromise = null;
        // Keep initialized as false
        this.initialized = false;
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Roll dice with 3D animation.
   */
  async roll3D(
    notation: string,
    label = "Roll",
    theme?: string,
    color?: string,
    context?: DiceRollContext
  ): Promise<DiceResult | null> {
    if (this.isRolling) {
      console.warn(`[DiceService] Roll request ignored: dice system is busy (${this.status}).`);
      return null;
    }

    this.setStatus('rolling');

    console.log(`[DiceService] Starting 3D Roll: ${notation} with theme: ${theme}, color: ${color}`);

    // Play roll sound effect
    import('../services/soundService').then(({ soundService }) => {
      soundService.playEffect('DICE_ROLL');
    });

    try {
      // Wait for initialization if it's in progress
      if (this.initPromise) {
        await this.initPromise;
      }

      if (!this.initialized || !this.diceBox) {
        console.warn("[DiceService] DiceBox not initialized, returning fallback.");
        return this.rollBackground(notation, label, { context });
      }

      // 3D Roll - Ensure theme and color are passed correctly
      const rollTheme = theme || "default";
      const rollOptions: any = { theme: rollTheme };
      if (color) {
        rollOptions.themeColor = color;
      }
      
      let results;
      if (notation.includes('+') || notation.includes('-') || notation.match(/[a-z]{2}\d+/)) {
         const parsedNotation = this.parser.parseNotation(notation);
         results = await this.diceBox.roll(parsedNotation, rollOptions);
      } else {
         results = await this.diceBox.roll(notation, rollOptions);
      }

      // If results are empty or invalid, fallback
      if (!results || results.length === 0) {
        console.warn("[DiceService] No results from 3D roll, returning fallback.");
        return this.rollBackground(notation, label, { context });
      }

      // Use the parser to get the final computed result object
      const finalResults = this.parser.parseFinalResults(results);
      const rolls = this.extractRolls(finalResults);

      // Calculate modifier
      let rollSum = 0;
      rolls.filter(r => r.valid !== false).forEach(r => rollSum += r.result);
      const modifier = finalResults.value - rollSum;

      const diceResult: DiceResult = {
        id: crypto.randomUUID(),
        notation,
        total: finalResults.value,
        label,
        rolls,
        modifier,
        timestamp: Date.now(),
        source: "3d",
        ...(context ? { context } : {})
      };

      // Centralized short visual delay so physical dice remain visible briefly after settling
      await new Promise(resolve => setTimeout(resolve, 1000));

      return diceResult;
    } catch (error) {
      console.error("[DiceService] roll3D execution failed:", error);
      return this.rollBackground(notation, label, { context });
    } finally {
      this.safeClear();
      this.setStatus('idle');
    }
  }

  private extractRolls(parsedResult: any): DiceResult["rolls"] {
    return extractDiceRolls(parsedResult);
  }

  rollBackground(notation: string, label = "Roll", options: DiceResolveOptions = {}): DiceResult {
    return resolveDiceNotation(notation, label, options);
  }

  async rollAbilityScore(label = "Ability Score"): Promise<DiceResult | null> {
    return this.roll3D("4d6dl1", label, "default", "#8b0000");
  }

  private safeClear() {
    if (this.initialized && this.diceBox) {
      try {
        this.diceBox.clear();
      } catch (e) {
        console.warn("[DiceService] Error clearing diceBox:", e);
      }
    }
  }

  clear() {
    if (this.isRolling) {
      console.warn("[DiceService] Cannot clear dice while a roll is active.");
      return;
    }
    this.safeClear();
  }

  updateConfig(config: any) {
    if (this.initialized && this.diceBox) {
      this.diceBox.updateConfig(config);
    }
  }
}

export const diceService = new DiceService();
