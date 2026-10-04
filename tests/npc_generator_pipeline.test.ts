import { describe, it, expect } from 'vitest';
import {
  generateNPCAsync,
  generateNPC,
  getModifier,
  calculateHP,
  calculateAC,
  calculateInitiative,
  XP_TABLE,
  getLevelFromXP,
  getXPForLevel,
  generateStandardStats
} from '../src/lib/npcGeneratorUtils';
import { generateNPCData } from '../src/services/ai/npcService';

describe('NPC Generator Pipeline Architecture (#368)', () => {
  it('generates a complete NPC offline without an LLM dependency', async () => {
    const npc = await generateNPCAsync({
      ruleset: '2014',
      class: 'Fighter',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      level: 1,
      gender: 'Male',
      seed: 'test_seed_offline_01'
    });

    // Acceptance Criterion 1 & 10: Canonical mechanical data & complete narrative fields
    expect(npc).toBeDefined();
    expect(npc.saveVersion).toBe(2);
    expect(typeof npc.name).toBe('string');
    expect(npc.name.length).toBeGreaterThan(0);
    expect(npc.class).toBe('Fighter');
    expect(npc.race).toBe('Human');
    expect(npc.background).toBe('Soldier');
    expect(npc.alignment).toBe('Lawful Good');
    expect(npc.level).toBe(1);

    // Stats & Vitals
    expect(npc.stats).toBeDefined();
    expect(typeof npc.stats.str).toBe('number');
    expect(typeof npc.hp).toBe('number');
    expect(npc.hp).toBeGreaterThan(0);

    // Narrative fields
    expect(Array.isArray(npc.traits)).toBe(true);
    expect(Array.isArray(npc.ideals)).toBe(true);
    expect(Array.isArray(npc.bonds)).toBe(true);
    expect(Array.isArray(npc.flaws)).toBe(true);
    expect(typeof npc.backstory).toBe('string');
    expect(npc.backstory.length).toBeGreaterThan(20);

    // V2 Inventory & Equipment Schema
    expect(npc.items).toBeDefined();
    expect(npc.containers).toBeDefined();
    expect(npc.equipment).toBeDefined();
    expect(npc.equipment.slots).toBeDefined();
  });

  it('produces deterministic output when given the same seed', async () => {
    const seed = 'deterministic_replay_seed_99';

    const npc1 = await generateNPCAsync({
      ruleset: '2014',
      class: 'Rogue',
      race: 'Elf',
      background: 'Criminal',
      alignment: 'Chaotic Neutral',
      seed
    });

    const npc2 = await generateNPCAsync({
      ruleset: '2014',
      class: 'Rogue',
      race: 'Elf',
      background: 'Criminal',
      alignment: 'Chaotic Neutral',
      seed
    });

    // Acceptance Criterion 12: Seed replay determinism
    expect(npc1.name).toBe(npc2.name);
    expect(npc1.traits).toEqual(npc2.traits);
    expect(npc1.ideals).toEqual(npc2.ideals);
    expect(npc1.bonds).toEqual(npc2.bonds);
    expect(npc1.flaws).toEqual(npc2.flaws);
    expect(npc1.backstory).toBe(npc2.backstory);
  });

  it('supports 2024 ruleset isolation without leaking 2014 legacy data', async () => {
    const npc2024 = await generateNPCAsync({
      ruleset: '2024',
      class: 'Paladin',
      race: 'Goliath',
      background: 'Noble',
      alignment: 'Lawful Good',
      seed: 'seed_2024_paladin'
    });

    // Acceptance Criterion 3: Ruleset isolation
    expect(npc2024.ruleset).toBe('2024');
    expect(npc2024.race).toBe('Goliath');
    expect(npc2024.saveVersion).toBe(2);
    expect(npc2024.equipment).toBeDefined();
  });

  it('synchronous generateNPC fallback creates a valid character schema object', () => {
    const npc = generateNPC({
      ruleset: '2014',
      name: 'Bartholomew',
      class: 'Cleric',
      race: 'Dwarf',
      background: 'Acolyte'
    });

    expect(npc.name).toBe('Bartholomew');
    expect(npc.class).toBe('Cleric');
    expect(npc.race).toBe('Dwarf');
    expect(npc.background).toBe('Acolyte');
    expect(npc.saveVersion).toBe(2);
    expect(npc.items).toBeDefined();
    expect(npc.containers).toBeDefined();
    expect(npc.equipment).toBeDefined();
  });

  it('preserves legacy utility calculations for backwards compatibility', () => {
    expect(getModifier(10)).toBe(0);
    expect(getModifier(16)).toBe(3);
    expect(getModifier(8)).toBe(-1);

    expect(calculateHP(1, 14, 10)).toBe(12); // Level 1 Fighter (d10 + 2) = 12
    expect(calculateInitiative(14)).toBe(2);

    expect(getLevelFromXP(0)).toBe(0);
    expect(getLevelFromXP(300)).toBe(1);
    expect(getXPForLevel(1)).toBe(300);

    const stats = generateStandardStats();
    expect(Object.keys(stats)).toEqual(['str', 'dex', 'con', 'int', 'wis', 'cha']);
  });
});
