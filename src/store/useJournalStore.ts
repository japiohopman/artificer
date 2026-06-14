import { create } from 'zustand';
import { JournalState, DailySummary, Quest, QuestStatus } from '../types/journal';

interface JournalStore extends JournalState {
  // Actions
  addSummary: (summary: DailySummary) => void;
  addQuest: (quest: Quest) => void;
  updateQuestStatus: (questId: string, status: QuestStatus) => void;
  unlockLore: (lorePath: string) => void;
  recordEncounter: (enemyIndex: string) => void;
}

export const useJournalStore = create<JournalStore>((set) => ({
  summaries: [],
  quests: [],
  unlockedLore: [],
  encounteredEnemies: [],

  addSummary: (summary) => set((state) => ({
    summaries: [summary, ...state.summaries]
  })),

  addQuest: (quest) => set((state) => ({
    quests: state.quests.some(q => q.id === quest.id)
      ? state.quests.map(q => q.id === quest.id ? quest : q)
      : [...state.quests, quest]
  })),

  updateQuestStatus: (questId, status) => set((state) => ({
    quests: state.quests.map(q => q.id === questId ? { ...q, status, lastUpdate: Date.now() } : q)
  })),

  unlockLore: (lorePath) => set((state) => ({
    unlockedLore: state.unlockedLore.includes(lorePath)
      ? state.unlockedLore
      : [...state.unlockedLore, lorePath]
  })),

  recordEncounter: (enemyIndex) => set((state) => ({
    encounteredEnemies: state.encounteredEnemies.includes(enemyIndex)
      ? state.encounteredEnemies
      : [...state.encounteredEnemies, enemyIndex]
  })),
}));
