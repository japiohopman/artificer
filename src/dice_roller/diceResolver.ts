import * as DiceRollerParser from "@3d-dice/dice-roller-parser";

const DiceRoller = (
  (DiceRollerParser as any).DiceRoller ||
  (DiceRollerParser as any).default?.DiceRoller ||
  (DiceRollerParser as any).default
) as new (random?: () => number, maxRollsPerDie?: number) => any;

export interface DiceRollContext {
  actionId?: string;
  actorId?: string;
  actorName?: string;
  targetId?: string;
  targetName?: string;
  sourceSystem?: string;
  ruleset?: "2014" | "2024";
}

export interface DiceRollOutcome {
  status: string;
  detail?: string;
}

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
  source: "3d" | "background";
  seed?: string;
  context?: DiceRollContext;
  outcome?: DiceRollOutcome;
}

export interface DiceResolveOptions {
  seed?: string | number;
  context?: DiceRollContext;
}

const hashSeed = (seed: string | number): number => {
  const input = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

/**
 * Small deterministic PRNG used by non-visual rolls and automated tests.
 * It deliberately does not replace DiceBox's physical randomness when the
 * player is watching a 3D roll; in that case the settled DiceBox result is
 * the authoritative game result.
 */
export const createSeededRandom = (seed: string | number): (() => number) => {
  let state = hashSeed(seed);

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const extractRolls = (parsedResult: any): DiceResult["rolls"] => {
  const rolls: DiceResult["rolls"] = [];
  const visited = new WeakSet<object>();

  const walk = (node: any): void => {
    if (!node || typeof node !== "object" || visited.has(node)) return;
    visited.add(node);

    if (node.type === "die" && Array.isArray(node.rolls)) {
      // dice-roller-parser represents a dice group with a `die` descriptor
      // and exposes each individual face as DieRollBase.roll.
      const sides = node.die?.value ?? node.die ?? node.sides?.value ?? node.sides ?? 20;
      node.rolls.forEach((roll: any) => {
        rolls.push({
          die: Number(sides),
          result: Number(roll.roll ?? roll.value),
          valid: roll.valid !== false
        });
      });
    } else if (node.type === "roll") {
      rolls.push({
        die: Number(node.die?.value ?? node.die ?? 20),
        result: Number(node.roll ?? node.value),
        valid: node.valid !== false
      });
    }

    if (Array.isArray(node.dice)) node.dice.forEach(walk);
    if (Array.isArray(node.rolls) && node.type !== "die") node.rolls.forEach(walk);
    if (Array.isArray(node.ops)) node.ops.forEach(walk);
    else if (node.ops) walk(node.ops);
    if (node.left) walk(node.left);
    if (node.right) walk(node.right);
    if (node.head) walk(node.head);
    if (node.expr) walk(node.expr);
    if (node.tails && Array.isArray(node.tails)) {
      node.tails.forEach((tail: any) => {
        if (Array.isArray(tail) && tail[1]) walk(tail[1]);
        else walk(tail);
      });
    }
  };

  walk(parsedResult);
  return rolls.filter(roll => Number.isFinite(roll.result) && Number.isFinite(roll.die));
};

/**
 * Resolves a dice expression without React, a browser or DiceBox.
 * Supplying the same seed and notation produces the same mechanical result.
 */
export const resolveDiceNotation = (
  notation: string,
  label = "Roll",
  options: DiceResolveOptions = {}
): DiceResult => {
  const random = options.seed === undefined ? undefined : createSeededRandom(options.seed);

  try {
    const roller = new DiceRoller(random);
    const parsedResult = roller.roll(notation);

    if (!parsedResult || !Number.isFinite(parsedResult.value)) {
      throw new Error("The dice parser returned an invalid result.");
    }

    const rolls = extractRolls(parsedResult);
    const validRollTotal = rolls
      .filter(roll => roll.valid !== false)
      .reduce((total, roll) => total + roll.result, 0);

    return {
      id: crypto.randomUUID(),
      notation,
      total: parsedResult.value,
      label,
      rolls,
      modifier: parsedResult.value - validRollTotal,
      timestamp: Date.now(),
      source: "background",
      ...(options.seed !== undefined ? { seed: String(options.seed) } : {}),
      ...(options.context ? { context: options.context } : {})
    };
  } catch (error) {
    console.error("[DiceResolver] Background roll failed:", error);

    return {
      id: crypto.randomUUID(),
      notation,
      total: 0,
      label: `${label} (Failed)`,
      rolls: [],
      modifier: 0,
      timestamp: Date.now(),
      source: "background",
      ...(options.seed !== undefined ? { seed: String(options.seed) } : {}),
      ...(options.context ? { context: options.context } : {})
    };
  }
};
