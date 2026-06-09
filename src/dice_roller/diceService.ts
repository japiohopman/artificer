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
        this.diceBox = new DiceBox({
          container: selector,
          assetPath: "/assets/",
          theme: "default",
          offscreen: false,
          scale: 6,
          startingHeight: 8,
          throwForce: 6,
          spinForce: 5,
          lightIntensity: 1,
          gravity: 2, // Slightly lower gravity to keep them in view longer
          settleTimeout: 5000,
          boxControls: true // Enabling box controls for debugging/manual interaction
        });

        // Add a timeout to initialization
        const initTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("DiceBox initialization timed out")), 10000)
        );

        await Promise.race([
          this.diceBox.init(),
          initTimeout
        ]);
        
        console.log("[DiceService] DiceBox initialized successfully.");
        
        // Wait a frame for the DOM to settle and canvas to be injected
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Check if canvas was created
        const canvas = containerElement.querySelector('canvas');
        if (canvas) {
          console.log("[DiceService] Canvas element found and sized");
          canvas.style.pointerEvents = 'none'; 
          canvas.style.visibility = 'visible';
          canvas.style.opacity = '1';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.display = 'block';
        }

        // Force a resize calculation to ensure Babylon uses full container resolution
        if (typeof this.diceBox.resize === 'function') {
          this.diceBox.resize();
        }

        this.initialized = true;
        
        if (typeof this.diceBox.show === 'function') {
          this.diceBox.show();
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
   * Helper to recursively extract individual die rolls from parser output
   */
  private extractRolls(node: any, acc: { die: number; result: number; valid: boolean }[] = []): { die: number; result: number; valid: boolean }[] {
    if (!node) return acc;

    // Handle single die or dice group
    if (node.rolls) {
      node.rolls.forEach((r: any) => {
        acc.push({ 
          die: r.die || node.die?.value || 20, 
          result: r.value,
          valid: r.valid !== false // Parser marks dropped dice as valid: false
        });
      });
    }

    // Handle expression nodes (like 1d20 + 5)
    if (node.dice) {
      node.dice.forEach((d: any) => this.extractRolls(d, acc));
    }

    // Handle nested expressions
    if (node.left) this.extractRolls(node.left, acc);
    if (node.right) this.extractRolls(node.right, acc);

    return acc;
  }

  /**
   * Roll dice with 3D animation
   */
  async roll3D(notation: string, label: string = "Roll"): Promise<DiceResult> {
    console.log(`[DiceService] Starting 3D Roll: ${notation}`);

    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }

    if (!this.initialized) {
      throw new Error("DiceBox not initialized.");
    }

    try {
      // 1. Perform background roll for immediate logic/store update
      const parsedResult = this.roller.roll(notation);
      const allRolls = this.extractRolls(parsedResult);

      // 2. Trigger 3D Dice - Simplified
      // Just pass the notation directly to let DiceBox handle the throw logic
      // but keep the parser results to ensure consistent totals
      await this.diceBox.roll(notation);

      return {
        id: crypto.randomUUID(),
        notation,
        total: parsedResult.value,
        label,
        rolls: allRolls.map(r => ({ die: r.die, result: r.result, valid: r.valid })),
        modifier: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("[DiceService] roll3D execution failed:", error);
      return this.rollBackground(notation, label);
    }
  }
  rollBackground(notation: string, label: string = "Roll"): DiceResult {
    try {
      const parsedResult = this.roller.roll(notation);
      const allRolls = this.extractRolls(parsedResult);
      
      return {
        id: crypto.randomUUID(),
        notation,
        total: parsedResult.value,
        label,
        rolls: allRolls.map(r => ({ die: r.die, result: r.result, valid: r.valid })),
        modifier: 0,
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
}

export const diceService = new DiceService();
