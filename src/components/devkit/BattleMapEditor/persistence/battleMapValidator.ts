import { BattleMap } from '../types/battleMap';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBattleMap = (map: any): ValidationResult => {
  const errors: string[] = [];

  if (!map) {
    errors.push('Map data is empty.');
    return { isValid: false, errors };
  }

  if (!map.name || map.name.trim() === '') {
    errors.push('Map name is empty.');
  }

  if (!map.dimensions || map.dimensions.width < 4 || map.dimensions.height < 4) {
    errors.push('Map dimensions must be at least 4x4 (minimum 4x4).');
  }

  if (
    (!map.walls || map.walls.length === 0) &&
    (!map.terrain || map.terrain.length === 0) &&
    (!map.objects || map.objects.length === 0) &&
    (!map.tokens || map.tokens.length === 0)
  ) {
    errors.push('The map has no walls, terrain, objects, or tokens.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
