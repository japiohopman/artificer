import { BattleMap } from '../types/battleMap';

export const serializeBattleMap = (map: BattleMap): string => {
  return JSON.stringify(map, null, 2);
};

export const deserializeBattleMap = (json: string): any => {
  return JSON.parse(json);
};
