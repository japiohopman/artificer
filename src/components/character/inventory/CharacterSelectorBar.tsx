import React from 'react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { GameIcon } from '../../../game_icons';
import { soundService } from '../../../services/soundService';

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

      {/* 6-Position Character Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 px-1 bg-black/40 rounded-lg border border-dragon-gold/30">
        {slots.map((char, index) => {
          const isActive = char && char.id === activeCharacterId;
          const isSlotActive = isActive;

          if (char) {
            return (
              <button
                key={char.id}
                onClick={() => {
                  setActiveCharacter(char.id);
                  soundService.playEffect('UI_CLICK');
                }}
                className={`relative group px-2.5 py-1 rounded transition-all border flex items-center gap-2 text-left shrink-0 ${
                  isSlotActive
                    ? 'bg-dragon-gold text-stone-950 border-white shadow-md font-bold scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/15 text-parchment-200 border-white/15 hover:border-dragon-gold/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                  isSlotActive ? 'bg-stone-950 text-dragon-gold' : 'bg-black/50 text-parchment-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex flex-col truncate max-w-[90px]">
                  <span className="text-[10px] uppercase font-header truncate leading-tight">
                    {char.name}
                  </span>
                  <span className={`text-[7px] uppercase font-mono truncate ${
                    isSlotActive ? 'text-stone-800 font-bold' : 'text-parchment-400'
                  }`}>
                    {char.class || 'Adventurer'}
                  </span>
                </div>
              </button>
            );
          }

          // Reserved Empty Party Slot
          return (
            <div
              key={`reserved_${index}`}
              className="px-2 py-1 rounded border border-white/10 bg-black/20 text-white/30 text-[9px] font-mono uppercase flex items-center gap-1.5 shrink-0 select-none cursor-not-allowed opacity-60"
            >
              <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px]">
                {index + 1}
              </div>
              <span className="text-[8px] tracking-wider hidden sm:inline">Reserved</span>
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
