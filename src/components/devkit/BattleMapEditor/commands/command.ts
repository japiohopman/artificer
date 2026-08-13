import { BattleMap } from '../types/battleMap';

export interface Command {
  id: string;
  description: string;
  execute: (map: BattleMap) => BattleMap;
  undo: (map: BattleMap) => BattleMap;
}
