import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { GameIcon } from '../../../game_icons';

interface SelectionIntroProps {
  title: string;
  desc: string;
  choiceAssetPath?: string;
  onOpenHelp?: () => void;
}

export const SelectionIntro: React.FC<SelectionIntroProps> = ({
  title,
  desc,
  choiceAssetPath,
  onOpenHelp
}) => {
  const [choiceMarkdown, setChoiceMarkdown] = useState<string>('');

  useEffect(() => {
    if (choiceAssetPath) {
      fetch(choiceAssetPath)
        .then(res => res.ok ? res.text() : '')
        .then(text => setChoiceMarkdown(text))
        .catch(() => setChoiceMarkdown(''));
    }
  }, [choiceAssetPath]);

  return (
    <div className="flex flex-col items-start justify-between gap-2 pb-3 border-b border-dragon-gold/20 shrink-0">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight">
            {title}
          </h2>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="px-2.5 py-1 bg-dragon-gold/15 hover:bg-dragon-gold/30 border border-dragon-gold/40 text-dragon-darkRed rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <GameIcon name="info" size={12} color="#991B1B" />
              [?]
            </button>
          )}
        </div>
        <p className="text-[11px] text-parchment-600 font-bold uppercase tracking-wider hidden sm:block">
          {desc}
        </p>
      </div>

      {choiceMarkdown && (
        <div className="w-full text-[11px] text-parchment-800 font-medium leading-relaxed bg-white/30 border-l-2 border-dragon-gold/40 pl-3 py-1.5 pr-2 max-h-20 overflow-y-auto custom-scrollbar rounded-r-sm">
          <Markdown children={choiceMarkdown} />
        </div>
      )}
    </div>
  );
};
