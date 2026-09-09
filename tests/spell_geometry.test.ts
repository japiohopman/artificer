import { describe, it, expect } from 'vitest';
import { calculateAOECells, AOEDefinition, GridPoint } from '../src/domain/spells/geometry';

describe('Canonical Spell AOE Geometry Unit Tests', () => {
  const origin: GridPoint = { x: 5, y: 5 };

  describe('Sphere / Cylinder AOE', () => {
    it('calculates correct sphere grid cells for radius 1', () => {
      const aoe: AOEDefinition = { targetType: 'sphere', radius: 1 };
      const cells = calculateAOECells(aoe, origin, { x: 5, y: 5 });

      expect(cells.size).toBe(9);
      expect(cells.has('5,5')).toBe(true);
      expect(cells.has('4,4')).toBe(true);
      expect(cells.has('6,6')).toBe(true);
    });

    it('calculates correct sphere grid cells for radius 2', () => {
      const aoe: AOEDefinition = { targetType: 'sphere', radius: 2 };
      const cells = calculateAOECells(aoe, origin, { x: 10, y: 10 });

      expect(cells.size).toBe(25);
      expect(cells.has('10,10')).toBe(true);
      expect(cells.has('8,8')).toBe(true);
      expect(cells.has('12,12')).toBe(true);
    });
  });

  describe('Cone AOE', () => {
    it('calculates east-facing cone correctly', () => {
      const aoe: AOEDefinition = { targetType: 'cone', length: 3 };
      const target: GridPoint = { x: 6, y: 5 }; // Facing East
      const cells = calculateAOECells(aoe, origin, target);

      // Step 1: (6,4), (6,5), (6,6) -> 3
      // Step 2: (7,3), (7,4), (7,5), (7,6), (7,7) -> 5
      // Step 3: (8,2), (8,3), (8,4), (8,5), (8,6), (8,7), (8,8) -> 7
      expect(cells.size).toBe(15);
      expect(cells.has('6,5')).toBe(true);
      expect(cells.has('6,4')).toBe(true);
      expect(cells.has('6,6')).toBe(true);
      expect(cells.has('8,2')).toBe(true);
      expect(cells.has('8,8')).toBe(true);
    });

    it('calculates north-facing cone correctly', () => {
      const aoe: AOEDefinition = { targetType: 'cone', length: 2 };
      const target: GridPoint = { x: 5, y: 4 }; // Facing North
      const cells = calculateAOECells(aoe, origin, target);

      // Step 1 (y=4): x=4,5,6 -> 3
      // Step 2 (y=3): x=3,4,5,6,7 -> 5
      expect(cells.size).toBe(8);
      expect(cells.has('5,4')).toBe(true);
      expect(cells.has('4,4')).toBe(true);
      expect(cells.has('6,4')).toBe(true);
      expect(cells.has('3,3')).toBe(true);
      expect(cells.has('7,3')).toBe(true);
    });
  });

  describe('Cube / Square AOE', () => {
    it('calculates cube cells correctly around target', () => {
      const aoe: AOEDefinition = { targetType: 'cube', size: 3 };
      const cells = calculateAOECells(aoe, origin, { x: 5, y: 5 });

      expect(cells.size).toBe(9);
      expect(cells.has('4,4')).toBe(true);
      expect(cells.has('6,6')).toBe(true);
    });
  });

  describe('Line AOE', () => {
    it('calculates horizontal line targeting cells', () => {
      const aoe: AOEDefinition = { targetType: 'line', length: 4, width: 1 };
      const target: GridPoint = { x: 6, y: 5 }; // Facing East
      const cells = calculateAOECells(aoe, origin, target);

      expect(cells.size).toBe(4);
      expect(cells.has('6,5')).toBe(true);
      expect(cells.has('7,5')).toBe(true);
      expect(cells.has('8,5')).toBe(true);
      expect(cells.has('9,5')).toBe(true);
    });
  });

  describe('Emanation AOE', () => {
    it('calculates emanation expanding outward from origin', () => {
      const aoe: AOEDefinition = { targetType: 'emanation', radius: 1 };
      const cells = calculateAOECells(aoe, origin, origin);

      // 8 surrounding cells around caster cell
      expect(cells.size).toBe(8);
      expect(cells.has('5,5')).toBe(false); // Caster cell excluded from emanation ring
      expect(cells.has('4,4')).toBe(true);
      expect(cells.has('6,6')).toBe(true);
      expect(cells.has('5,4')).toBe(true);
    });
  });
});
