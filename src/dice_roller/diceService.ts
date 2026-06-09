import DiceBox from "@3d-dice/dice-box";
import DiceParser from "@3d-dice/dice-parser-interface";

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
  private parser: DiceParser;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.parser = new DiceParser();
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
          assetPath: "/assets/dice-box/",
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
      // Trigger 3D Dice
      const results = await this.diceBox.roll(notation, { theme: theme || "default" });

      // Parse results using the parser interface
      const parsedResult = this.parser.parseFinalResults(results);

      return {
        id: crypto.randomUUID(),
        notation,
        total: parsedResult.total,
        label,
        rolls: parsedResult.rolls.map((r: any) => ({
          die: r.die,
          result: r.value,
          valid: r.valid
        })),
        modifier: parsedResult.modifier || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("[DiceService] roll3D execution failed:", error);
      return this.rollBackground(notation, label);
    }
  }

  rollBackground(notation: string, label: string = "Roll"): DiceResult {
    try {
      // Background roll doesn't have 3D results, so we simulate a basic roll
      // Note: Realistically, if we want background rolls to support complex notation
      // we'd need another engine or mock DiceBox results.
      // For now, using a simplified version or the parser if it supports direct strings.
      
      return {
        id: crypto.randomUUID(),
        notation,
        total: 0, // In background mode, we might not have a full parser roll without 3D results here
        label: `${label} (Background)`,
        rolls: [],
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
