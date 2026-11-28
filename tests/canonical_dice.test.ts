import { describe, expect, it } from "bun:test";
import { createSeededRandom, resolveDiceNotation } from "../src/dice_roller/diceResolver";
import { useGameStore } from "../src/store/useGameStore";

describe("Canonical dice resolver", () => {
  it("reproduces the same full result for a supplied seed", () => {
    const first = resolveDiceNotation("4d6dl1", "Ability score", { seed: "character-seed-01" });
    const second = resolveDiceNotation("4d6dl1", "Ability score", { seed: "character-seed-01" });

    expect(first.total).toBe(second.total);
    expect(first.rolls).toEqual(second.rolls);
    expect(first.modifier).toBe(second.modifier);
    expect(first.seed).toBe("character-seed-01");
    expect(first.source).toBe("background");
  });

  it("uses a seeded random stream with stable values", () => {
    const firstRandom = createSeededRandom("replay-seed");
    const secondRandom = createSeededRandom("replay-seed");

    expect(Array.from({ length: 8 }, firstRandom)).toEqual(
      Array.from({ length: 8 }, secondRandom)
    );
  });

  it("keeps the die faces and modifier separate for simple checks", () => {
    const result = resolveDiceNotation("1d20+5", "Attack", { seed: 42 });

    expect(result.rolls).toHaveLength(1);
    expect(result.rolls[0].die).toBe(20);
    expect(result.total).toBe(result.rolls[0].result + 5);
    expect(result.modifier).toBe(5);
  });

  it("preserves dropped dice in the result breakdown", () => {
    const result = resolveDiceNotation("4d6dl1", "Drop lowest", { seed: "drop-lowest" });

    expect(result.rolls).toHaveLength(4);
    expect(result.rolls.some(roll => roll.valid === false)).toBe(true);
    expect(result.total).toBe(
      result.rolls.filter(roll => roll.valid !== false).reduce((total, roll) => total + roll.result, 0)
    );
  });
  it("publishes background results and roll provenance to the shared game history", async () => {
    const originalRolls = useGameStore.getState().recentRolls;
    const context = {
      actionId: "test-attack",
      actorId: "hero-1",
      actorName: "Test Hero",
      targetId: "goblin-1",
      targetName: "Goblin",
      sourceSystem: "combat",
      ruleset: "2024" as const
    };

    try {
      const result = await useGameStore.getState().rollDiceBackground(
        "1d20+4",
        "Attack Test",
        context,
        "combat-test-seed"
      );

      expect(useGameStore.getState().recentRolls[0]).toEqual(result);
      expect(result.context).toEqual(context);
      expect(result.seed).toBe("combat-test-seed");
    } finally {
      useGameStore.setState({ recentRolls: originalRolls });
    }
  });

});
