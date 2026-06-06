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
  }[];
  modifier: number;
  timestamp: number;
}

class DiceService {
  private diceBox: any;
  private roller: DiceRoller;
  private initialized: boolean = false;

  constructor() {
    this.roller = new DiceRoller();
  }

  async init(container: string) {
    if (this.initialized) return;

    this.diceBox = new DiceBox(container, {
      assetPath: "/assets/dice-box/",
      origin: "https://fantasticdice.games", // For CDN assets if needed, but we have local ones
      theme: "default",
      offscreen: false, // Set to true if using web workers
    });

    await this.diceBox.init();
    this.initialized = true;
  }

  /**
   * Roll dice with 3D animation
   */
  async roll3D(notation: string, label: string = "Roll"): Promise<DiceResult> {
    if (!this.initialized) {
      throw new Error("DiceService not initialized");
    }

    const results = await this.diceBox.roll(notation);
    
    // DiceBox results format: [{ value: 20, die: "d20" }, ...]
    // We want to normalize this.
    const rolls = results.map((r: any) => ({
      die: parseInt(r.die.substring(1)),
      result: r.value
    }));

    const total = results.reduce((acc: number, r: any) => acc + r.value, 0);

    return {
      id: crypto.randomUUID(),
      notation,
      total,
      label,
      rolls,
      modifier: 0, // DiceBox usually includes modifiers in the total if notation has them
      timestamp: Date.now()
    };
  }

  /**
   * Roll dice in background (fast, no animation)
   */
  rollBackground(notation: string, label: string = "Roll"): DiceResult {
    const roll = this.roller.roll(notation);
    
    // The dice-roller-parser returns a complex object. 
    // We'll simplify it for our needs.
    // Note: This is a simplified version, as the parser output can be deeply nested.
    
    return {
      id: crypto.randomUUID(),
      notation,
      total: roll.value,
      label,
      rolls: [], // Extracting individual rolls from parser can be complex depending on notation
      modifier: 0,
      timestamp: Date.now()
    };
  }

  clear() {
    if (this.initialized) {
      this.diceBox.clear();
    }
  }
}

export const diceService = new DiceService();
