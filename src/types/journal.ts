export type QuestStatus = 'Active' | 'Completed' | 'Failed' | 'Abandoned';
export type QuestCategory = 'Main' | 'Side' | 'Task';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  status: QuestStatus;
  lastUpdate: number;
  involvedNPCs: string[]; // NPC indices
  rewards: string[];
}

export interface DailySummary {
  day: number;
  gameYear: number;
  gameMonth: number;
  gameDay: number;
  events: string;
  conversations: string;
  locationsDiscovered: string[];
  newNPCs: string[];
  battles: string;
  itemsGained: string[];
  itemsLost: string[];
  relationshipChanges: string;
  choices: string;
  questProgress: string;
  currentGoal: string;
  currentQuestId?: string;
  currentLocationId?: string;
  nextStep: string;
}

export interface JournalState {
  summaries: DailySummary[];
  quests: Quest[];
  unlockedLore: string[]; // paths to markdown files
  encounteredEnemies: string[]; // enemy indices
}
