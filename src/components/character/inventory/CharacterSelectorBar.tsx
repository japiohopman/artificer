import React from 'react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { GameIcon } from '../../../game_icons';
import { soundService } from '../../../services/soundService';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { normalizeImageUrl } from '../../../services/storageService';

export const CharacterSelectorBar: React.FC = () => {
  const { characters, activeCharacterId, setActiveCharacter } = useCharacterStore();
  const { setIsInventoryMenuOpen } = useInventoryStore();

  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  // 6 Slots Total (1 main + 5 party)
  const MAX_SLOTS = 6;
  const slots = Array.from({ length: MAX_SLOTS }).map((_, index) => {
    return characters[index] || null;
  });

  return (
    <div className="shrink-0 bg-dragon-darkRed border-b-2 border-dragon-gold px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-2 shadow-xl relative z-10 font-body">
      {/* Title & Active Info */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center border border-dragon-gold/40 shadow-inner">
          <GameIcon name="package" size={18} color="#D4AF37" />
        </div>
        <div>
          <h1 className="font-header text-sm sm:text-base text-white uppercase tracking-[0.12em] leading-none font-bold">
            Gear & Equipment Workspace
          </h1>
          <p className="text-[9px] text-white/70 uppercase font-mono tracking-wider mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-dragon-gold rounded-full animate-pulse" />
            <span className="text-dragon-gold font-bold">{activeChar?.name || 'Unassigned'}</span>
            <span className="text-white/50">|</span>
            <span>Lvl {activeChar?.level || 1} {activeChar?.class || 'Adventurer'}</span>
          </p>
        </div>
      </div>

      {/* 6-Position Avatar-First Character Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 bg-black/50 rounded-xl border border-dragon-gold/30 shadow-inner custom-scrollbar">
        {slots.map((char, index) => {
          const isActive = char && char.id === activeCharacterId;

          if (char) {
            const avatarUrl = char.avatar || char.portrait || char.imageUrl || normalizeImageUrl(undefined, 'classes', (char.class || 'fighter').toLowerCase());

            return (
              <button
                key={char.id}
                onClick={() => {
                  setActiveCharacter(char.id);
                  soundService.playEffect('UI_CLICK');
                }}
                className={`relative group p-1 rounded-lg transition-all border flex items-center gap-2 text-left shrink-0 select-none ${
                  isActive
                    ? 'bg-dragon-gold text-stone-950 border-white shadow-lg ring-2 ring-dragon-gold scale-[1.03]'
                    : 'bg-black/40 hover:bg-white/10 text-parchment-200 border-dragon-gold/30 hover:border-dragon-gold'
                }`}
                title={`${char.name} (Lvl ${char.level || 1} ${char.class || 'Adventurer'})`}
              >
                {/* Avatar Badge */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden relative border-2 shrink-0 ${
                  isActive ? 'border-stone-950 bg-stone-900 shadow-md' : 'border-dragon-gold/40 bg-black/60'
                }`}>
                  {avatarUrl ? (
                    <ChromaKeyImage
                      src={avatarUrl}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GameIcon name="users" size={16} color={isActive ? "#D4AF37" : "#A3A3A3"} />
                    </div>
                  )}
                  {/* Position Badge Overlay */}
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full text-[7px] font-mono font-bold flex items-center justify-center shadow-xs border ${
                    isActive ? 'bg-stone-950 text-dragon-gold border-dragon-gold' : 'bg-black/80 text-parchment-300 border-white/20'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Character Name & Class */}
                <div className="flex flex-col truncate max-w-[80px] sm:max-w-[100px]">
                  <span className={`text-[10px] font-header font-bold uppercase truncate leading-tight ${
                    isActive ? 'text-stone-950' : 'text-parchment-100'
                  }`}>
                    {char.name}
                  </span>
                  <span className={`text-[7px] font-mono uppercase truncate ${
                    isActive ? 'text-stone-800 font-semibold' : 'text-parchment-400'
                  }`}>
                    {char.class || 'Adventurer'}
                  </span>
                </div>
              </button>
            );
          }

          // Reserved Party Position Slot
          return (
            <div
              key={`reserved_${index}`}
              className="p-1 rounded-lg border border-dashed border-dragon-gold/20 bg-black/20 text-parchment-500/50 flex items-center gap-2 shrink-0 select-none cursor-not-allowed"
              title={`Position ${index + 1}: Reserved Party Slot`}
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                <GameIcon name="users" size={14} color="#737373" className="opacity-30" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-black/60 text-parchment-500 text-[7px] font-mono font-bold flex items-center justify-center border border-white/10">
                  {index + 1}
                </span>
              </div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-parchment-500/40 hidden sm:inline">
                Reserved
              </span>
            </div>
          );
        })}
      </div>

      {/* Close Workspace Button */}
      <button
        onClick={() => {
          setIsInventoryMenuOpen(false);
          soundService.playEffect('UI_BACK_EXIT');
        }}
        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-dragon-red hover:rotate-90 transition-all flex items-center justify-center border border-white/20 shrink-0"
        title="Close Gear Workspace"
        aria-label="Close Gear Workspace"
      >
        <GameIcon name="close" size={18} color="currentColor" />
      </button>
    </div>
  );
};
