import React from 'react';
import { useJournalStore } from '../../../store/useJournalStore';
import { GameIcon } from '../../../game_icons';
import { Quest } from '../../../types/journal';
import { cn } from '../../../lib/utils';

export const QuestTab: React.FC = () => {
  const { quests } = useJournalStore();

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'Main', label: 'Hoofdmissies', icon: 'key' },
    { id: 'Side', label: 'Zijmissies', icon: 'lore' },
    { id: 'Task', label: 'Taken', icon: 'package' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-dragon-gold';
      case 'Completed': return 'text-green-600';
      case 'Failed': return 'text-red-600';
      case 'Abandoned': return 'text-gray-500';
      default: return 'text-parchment-500';
    }
  };

  if (quests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-parchment-600 italic space-y-4">
        <GameIcon name="lore" size={48} className="opacity-20" />
        <p>Geen actieve missies in het logboek.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {categories.map(cat => {
        const filtered = quests.filter(q => q.category === cat.id);
        if (filtered.length === 0) return null;

        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-dragon-red/10 pb-2">
              <GameIcon name={cat.icon} size={18} className="text-dragon-red" />
              <h2 className="font-header text-xl text-dragon-darkRed uppercase tracking-widest">{cat.label}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filtered.map(quest => (
                <div
                  key={quest.id}
                  className={cn(
                    "bg-parchment-200/40 border-l-4 p-4 rounded shadow-sm hover:shadow-md transition-shadow",
                    quest.status === 'Active' ? "border-dragon-gold" :
                    quest.status === 'Completed' ? "border-green-600" : "border-gray-400"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-header text-lg text-parchment-900">{quest.title}</h3>
                    <span className={cn("text-[10px] font-bold uppercase tracking-tighter", getStatusColor(quest.status))}>
                      {quest.status}
                    </span>
                  </div>

                  <p className="text-sm text-parchment-800 mb-4 font-body leading-relaxed">
                    {quest.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-[11px] border-t border-dragon-gold/10 pt-3">
                    {quest.involvedNPCs.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <GameIcon name="hp" size={12} className="opacity-50" />
                        <span className="font-bold text-dragon-darkRed/70 uppercase">Betrokken:</span>
                        <span>{quest.involvedNPCs.join(', ')}</span>
                      </div>
                    )}
                    {quest.rewards.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <GameIcon name="coins" size={12} className="text-dragon-gold" />
                        <span className="font-bold text-dragon-darkRed/70 uppercase">Beloning:</span>
                        <span>{quest.rewards.join(', ')}</span>
                      </div>
                    )}
                    <div className="ml-auto text-parchment-500 italic">
                      Laatste update: {new Date(quest.lastUpdate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
