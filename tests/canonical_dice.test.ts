import { describe, expect, it } from "bun:test";
import { createSeededRandom, extractDiceRolls, resolveDiceNotation } from "../src/dice_roller/diceResolver";
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

  it("extracts visible expression dice from the parser dice collection and reads die.value", () => {
    const parserResult = {
      type: "expressionroll",
      value: 17,
      dice: [
        {
          type: "die",
          die: { type: "number", value: 20 },
          rolls: [{ roll: 12, valid: true }]
        }
      ]
    };

    expect(extractDiceRolls(parserResult)).toEqual([
      { die: 20, result: 12, valid: true }
    ]);
  });

  it("preserves dropped faces while extracting visible multi-die results", () => {
    const parserResult = {
      type: "expressionroll",
      value: 8,
      dice: [
        {
          type: "die",
          die: { value: 6 },
          rolls: [
            { roll: 1, valid: false },
            { roll: 2, valid: true },
            { roll: 6, valid: true }
          ]
        }
      ]
    };

    expect(extractDiceRolls(parserResult)).toEqual([
      { die: 6, result: 1, valid: false },
      { die: 6, result: 2, valid: true },
      { die: 6, result: 6, valid: true }
    ]);
  });

  it("keeps gameplay modifiers in the shared roll total without changing the raw d20 face", () => {
    const originalRolls = useGameStore.getState().recentRolls;
    const baseRoll = {
      id: "modifier-roll-test",
      notation: "1d20",
      total: 12,
      label: "Spell Attack",
      rolls: [{ die: 20, result: 12, valid: true }],
      modifier: 0,
      timestamp: Date.now(),
      source: "background" as const
    };

    try {
      useGameStore.setState({ recentRolls: [baseRoll] });
      const adjusted = useGameStore.getState().applyRollModifier(baseRoll.id, 5);

      expect(adjusted?.total).toBe(17);
      expect(adjusted?.modifier).toBe(5);
      expect(adjusted?.rolls[0].result).toBe(12);
      expect(useGameStore.getState().recentRolls[0]).toEqual(adjusted);
    } finally {
      useGameStore.setState({ recentRolls: originalRolls });
    }
  });

});
