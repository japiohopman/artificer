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
  choiceAssetPath
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
    <div className="flex items-center justify-between pb-3 border-b border-dragon-gold/20 shrink-0">
      <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight">
        {title}
      </h2>
      <p className="text-[11px] text-parchment-600 font-bold uppercase tracking-wider hidden sm:block">
        {desc}
      </p>
    </div>
  );
};
