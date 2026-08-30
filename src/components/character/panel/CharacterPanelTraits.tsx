import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';

interface CharacterPanelTraitsProps {
  character: Partial<Character>;
  className?: string;
}

export const CharacterPanelTraits: React.FC<CharacterPanelTraitsProps> = ({ character, className }) => {
  const traits = character.traits || [];
  const features = character.features || [];

  const allItems: Array<{ name: string; desc?: string; source?: string }> = [];

  traits.forEach((t: any) => {
    allItems.push({
      name: t.name || t.index || t,
      desc: typeof t.desc === 'string' ? t.desc : (Array.isArray(t.desc) ? t.desc.join('\n') : ''),
      source: t.source || 'Species'
    });
  });

  features.forEach((f: any) => {
    allItems.push({
      name: f.name || f.index || f,
      desc: typeof f.desc === 'string' ? f.desc : (Array.isArray(f.desc) ? f.desc.join('\n') : ''),
      source: f.source || 'Class'
    });
  });

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-white/40 border border-dragon-gold/20 rounded-sm ${className || ''}`}>
      <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-1 mb-1">
        <span className="text-[9px] font-black uppercase text-dragon-red tracking-widest flex items-center gap-1.5">
          <GameIcon name="ancestry" size={12} color="#8B0000" />
          Traits & Special Features
        </span>
        <span className="text-[8px] font-bold text-parchment-600 uppercase">
          {allItems.length} Known
        </span>
      </div>

      {allItems.length === 0 ? (
        <div className="py-8 text-center text-parchment-500 italic text-xs">
          No active traits or features resolved yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {allItems.map((item, idx) => (
            <div key={idx} className="p-2 bg-white/70 border border-dragon-gold/20 rounded-sm space-y-1 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-header font-black text-dragon-darkRed uppercase truncate">
                  {item.name}
                </span>
                {item.source && (
                  <span className="px-1.5 py-0.5 bg-dragon-gold/20 text-dragon-darkRed text-[8px] font-black uppercase rounded shrink-0 border border-dragon-gold/30">
                    {item.source}
                  </span>
                )}
              </div>
              {item.desc && (
                <p className="text-[10px] font-body text-parchment-800 leading-snug line-clamp-3">
                  {item.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
