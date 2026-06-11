import DiceBox from "@3d-dice/dice-box";
import { DiceRoller } from "@3d-dice/dice-roller-parser";

export interface DiceResult {
  id: string;
  notation: string;
  total: number;
  label: string;
  rolls: {
    die: number;
    result: number;
    valid?: boolean;
  }[];
  modifier: number;
  timestamp: number;
}

class DiceService {
  private diceBox: any;
  private roller: DiceRoller;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Some versions of dice-roller-parser require a random callback
    this.roller = new DiceRoller();
  }

  async init(containerArg: string | HTMLElement) {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
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
        if (typeof this.diceBox.resize === 'function') {
          this.diceBox.resize();
        }
      } catch (error) {
        console.error("[DiceService] Failed to initialize DiceBox:", error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Roll dice with 3D animation
   */
  async roll3D(notation: string, label: string = "Roll", theme?: string): Promise<DiceResult> {
    console.log(`[DiceService] Starting 3D Roll: ${notation} with theme: ${theme}`);

    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }

    if (!this.initialized) {
      throw new Error("DiceBox not initialized.");
    }

    try {
      // 3D Roll - Ensure theme is passed correctly
      const rollTheme = theme || "default";
      const results = await this.diceBox.roll(notation, { theme: rollTheme });

      // If results are empty or invalid, fallback
      if (!results || results.length === 0) {
        return this.rollBackground(notation, label);
      }

      // Calculate total manually and extract modifier
      let rollTotal = 0;
      const rolls = results.map((r: any) => {
        rollTotal += r.value;
        return {
          die: r.sides,
          result: r.value,
          valid: true
        };
      });

      // Simple regex to extract modifier from notation if total doesn't match sum of rolls
      let modifier = 0;
      const modMatch = notation.match(/([+-]\s*\d+)\s*$/);
      if (modMatch) {
        modifier = parseInt(modMatch[1].replace(/\s+/g, ''));
      }
      
      const total = rollTotal + modifier;

      return {
        id: crypto.randomUUID(),
        notation,
        total,
        label,
        rolls,
        modifier,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("[DiceService] roll3D execution failed:", error);
      return this.rollBackground(notation, label);
    }
  }

  private extractRolls(parsedResult: any): any[] {
    const rolls: any[] = [];
    const walk = (node: any) => {
      if (!node) return;
      if (node.type === "die") {
        rolls.push({ die: node.sides, result: node.value, valid: true });
      } else if (node.ops) {
        node.ops.forEach(walk);
      } else if (node.left) {
        walk(node.left);
        walk(node.right);
      }
    };
    walk(parsedResult);
    return rolls;
  }

  rollBackground(notation, label = "Roll"): DiceResult {
    try {
      const parsedResult = this.roller.roll(notation);
      const allRolls = this.extractRolls(parsedResult);

      // Calculate modifier
      let rollSum = 0;
      allRolls.forEach(r => rollSum += r.result);
      const modifier = parsedResult.value - rollSum;

      return {
        id: crypto.randomUUID(),
        notation,
        total: parsedResult.value,
        label,
        rolls: allRolls.map(r => ({ die: r.die, result: r.result, valid: r.valid })),
        modifier,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("[DiceService] Background roll failed:", error);
      return {
        id: crypto.randomUUID(),
        notation,
        total: 0,
        label: `${label} (Failed)`,
        rolls: [],
        modifier: 0,
        timestamp: Date.now()
      };
    }
  }

  clear() {
    if (this.initialized) {
      this.diceBox.clear();
    }
  }

  updateConfig(config: any) {
    if (this.initialized && this.diceBox) {
      this.diceBox.updateConfig(config);
    }
  }
}

export const diceService = new DiceService();
