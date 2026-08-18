import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { GameIcon } from '../../../game_icons';

interface SelectionLoreProps {
  summaryText: string;
  loreFilePath?: string;
  loreTitle?: string;
}

export const SelectionLore: React.FC<SelectionLoreProps> = ({
  summaryText,
  loreFilePath,
  loreTitle = "Ancestral Chronicles & Lore"
}) => {
  const [isLoreExpanded, setIsLoreExpanded] = useState<boolean>(false);
  const [fullLoreText, setFullLoreText] = useState<string>('');
  const [loadingLore, setLoadingLore] = useState<boolean>(false);

  const handleToggleLore = async () => {
    if (!isLoreExpanded && loreFilePath && !fullLoreText) {
      setLoadingLore(true);
      try {
        const res = await fetch(loreFilePath);
        if (res.ok) {
          const text = await res.text();
          setFullLoreText(text);
        } else {
          setFullLoreText("Detailed historical archives for this selection are presently unrecorded.");
        }
      } catch (err) {
        console.error("Failed loading lore text", err);
        setFullLoreText("Detailed historical archives for this selection are presently unrecorded.");
      } finally {
        setLoadingLore(false);
      }
    }
    setIsLoreExpanded(!isLoreExpanded);
  };

  return (
    <div className="space-y-3 pt-2 border-t border-dragon-gold/15">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase text-dragon-darkRed tracking-[0.25em] flex items-center gap-1.5">
          <GameIcon name="book" size={12} color="#B8860B" />
          SUMMARY
        </h4>
        {loreFilePath && (
          <button
            onClick={handleToggleLore}
            className="px-2.5 py-1 bg-dragon-red/10 hover:bg-dragon-red/20 border border-dragon-red/30 rounded text-[9px] font-black text-dragon-red uppercase tracking-wider flex items-center gap-1 transition-all"
          >
            <GameIcon name="book" size={10} color="currentColor" />
            {isLoreExpanded ? "- HIDE LORE" : "+ READ MORE / LORE"}
          </button>
        )}
      </div>

      <div className="markdown-body prose prose-slate prose-sm max-w-none text-[12px] font-medium text-parchment-800 leading-relaxed border-l-2 border-dragon-gold/20 pl-3">
        <Markdown children={summaryText || "No overview available."} />
      </div>

      {isLoreExpanded && (
        <div className="p-4 bg-dragon-gold/5 border border-dragon-gold/20 rounded-sm space-y-2 text-parchment-900 animate-fadeIn">
          <h5 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-widest flex items-center gap-2">
            <GameIcon name="scroll" size={12} color="#B8860B" />
            {loreTitle}
          </h5>
          {loadingLore ? (
            <div className="flex items-center justify-center py-4">
              <GameIcon name="refresh" size={16} color="#B8860B" className="animate-spin" />
            </div>
          ) : (
            <div className="markdown-body prose prose-slate prose-sm max-w-none text-[11px] leading-relaxed text-parchment-800">
              <Markdown children={fullLoreText} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
