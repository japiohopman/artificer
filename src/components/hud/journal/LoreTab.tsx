import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../../../store/useJournalStore';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { REPO, BRANCH } from '../../../services/storageService';

export const LoreTab: React.FC = () => {
  const { unlockedLore } = useJournalStore();
  const [selectedLore, setSelectedLore] = useState<string | null>(null);
  const [loreContent, setLoreContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLore = async () => {
      if (!selectedLore) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/assets/atlas/lore/${selectedLore}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        setLoreContent(text);
      } catch (e) {
        console.error("Failed to fetch lore:", e);
        setLoreContent("Kon de lore-bestanden niet laden.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLore();
  }, [selectedLore]);

  const formatTitle = (path: string) => {
    return path.split('/').pop()?.replace('.md', '').replace(/_/g, ' ') || path;
  };

  if (unlockedLore.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-parchment-600 italic space-y-4">
        <GameIcon name="lore" size={48} className="opacity-20" />
        <p>Er zijn nog geen lore-geheimen ontdekt.</p>
        <p className="text-sm">Blijf de wereld verkennen om bibliotheken en archieven te ontsluiten.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 py-4 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-r border-dragon-gold/10">
        <h3 className="font-header text-sm text-dragon-darkRed uppercase tracking-widest mb-2">Archief</h3>
        {unlockedLore.map(path => (
          <button
            key={path}
            onClick={() => setSelectedLore(path)}
            className={cn(
              "text-left p-3 rounded text-sm transition-all border border-transparent font-header tracking-tight",
              selectedLore === path
                ? "bg-dragon-red/10 border-dragon-red/30 text-dragon-red"
                : "hover:bg-parchment-200 text-parchment-800"
            )}
          >
            {formatTitle(path)}
          </button>
        ))}
      </div>

      {/* Content Viewer */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {selectedLore ? (
          isLoading ? (
            <div className="flex items-center justify-center h-full">
              <GameIcon name="magic_effect" size={32} className="animate-spin opacity-20" />
            </div>
          ) : (
            <div className="prose prose-parchment max-w-none markdown-body font-stix text-lg leading-relaxed text-parchment-900">
               <h2 className="font-header text-3xl text-dragon-red border-b border-dragon-gold/20 pb-4 mb-6 uppercase">
                 {formatTitle(selectedLore)}
               </h2>
               <Markdown remarkPlugins={[remarkGfm]}>
                 {loreContent}
               </Markdown>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-parchment-500 opacity-40">
            <GameIcon name="book" size={64} />
            <p className="font-quintessential mt-4">Selecteer een document uit de lijst</p>
          </div>
        )}
      </div>
    </div>
  );
};
