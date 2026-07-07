import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { diceService } from '../../dice_roller/diceService';

export const AdvancedRoller: React.FC = () => {
  const { isAdvancedRollerOpen, setIsAdvancedRollerOpen, selectedDiceTheme, selectedDiceColor } = useUIStore();
  const { rollDice3D } = useGameStore();
  const [notation, setNotation] = useState('');
  const [advantage, setAdvantage] = useState<'none' | 'adv' | 'dis'>('none');

  if (!isAdvancedRollerOpen) return null;

  const handleRoll = () => {
    let finalNotation = notation.trim();
    if (!finalNotation) return;

    // Apply advantage/disadvantage to the first d20 found, or the whole notation if it's just dice
    if (advantage !== 'none') {
      const suffix = advantage === 'adv' ? 'kh1' : 'kl1';
      
      // If it's a simple d20 or 1d20
      if (finalNotation.toLowerCase() === 'd20' || finalNotation.toLowerCase() === '1d20') {
        finalNotation = `2d20${suffix}`;
      } else if (finalNotation.toLowerCase().includes('d20')) {
        // Replace first d20 with 2d20kh1/kl1
        finalNotation = finalNotation.replace(/(\d*)d20/i, (match, count) => {
          const n = count ? parseInt(count) * 2 : 2;
          return `${n}d20${suffix}`;
        });
      } else {
        // If no d20, just append to the first die group
        finalNotation = finalNotation.replace(/(\d*d\d+)/i, `$1${suffix}`);
      }
    }

    rollDice3D(finalNotation, "Advanced Roll", selectedDiceTheme, selectedDiceColor);
    setNotation('');
    setAdvantage('none');
  };

  const addDie = (sides: number) => {
    setNotation(prev => {
        if (!prev) return `1d${sides}`;
        return `${prev}+1d${sides}`;
    });
  };

  const clearNotation = () => setNotation('');

  return (
    <div className="w-80 bg-parchment-100/95 border border-dragon-gold/50 rounded-lg p-4 space-y-4 shadow-2xl pointer-events-auto bg-paper-texture overflow-hidden relative group">
      {/* Decorative Border */}
      <div className="absolute inset-0 border-[8px] border-dragon-gold/5 pointer-events-none" />
      <div className="absolute inset-0 border border-dragon-gold/20 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-dragon-red tracking-[0.3em] leading-none mb-1">DICE CHAMBER</span>
            <h3 className="text-sm font-header font-black text-dragon-red uppercase tracking-wider">Advanced Roller</h3>
          </div>
          <button
            onClick={() => setIsAdvancedRollerOpen(false)}
            className="p-1 hover:bg-dragon-red/10 rounded-full text-dragon-red/40 hover:text-dragon-red transition-all"
            title="Close Roller"
          >
              <GameIcon name="close" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[4, 6, 8, 10, 12, 20, 100].map(s => (
            <button
              key={s}
              onClick={() => addDie(s)}
              className="group relative h-10 rounded bg-parchment-200 border border-dragon-gold/30 flex flex-col items-center justify-center hover:bg-dragon-red/10 hover:border-dragon-red/50 transition-all active:scale-95 shadow-sm"
            >
              <GameIcon
                name={s === 100 ? 'd10' : `d${s}`}
                size={20}
                className="text-dragon-red/20 group-hover:text-dragon-red/60 transition-all duration-300"
              />
              <span className="absolute bottom-0.5 text-[8px] font-black text-dragon-red/40 group-hover:text-dragon-red">d{s}</span>
            </button>
          ))}

          <button
            onClick={clearNotation}
            className="h-10 rounded bg-parchment-200 border border-dragon-gold/30 flex flex-col items-center justify-center hover:bg-parchment-300 text-dragon-red/40 hover:text-dragon-red transition-all active:scale-95 shadow-sm"
          >
            <GameIcon name="trash" size={14} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setAdvantage(advantage === 'adv' ? 'none' : 'adv')}
              className={cn(
                "flex-1 py-1.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm",
                advantage === 'adv' ? "bg-dragon-red border-dragon-gold/50 text-white" : "bg-parchment-200 border-dragon-gold/30 text-dragon-red/40 hover:bg-parchment-300"
              )}
            >
              Adv
            </button>
            <button
              onClick={() => setAdvantage(advantage === 'dis' ? 'none' : 'dis')}
              className={cn(
                "flex-1 py-1.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm",
                advantage === 'dis' ? "bg-dragon-darkRed border-dragon-gold/50 text-white" : "bg-parchment-200 border-dragon-gold/30 text-dragon-red/40 hover:bg-parchment-300"
              )}
            >
              Dis
            </button>
          </div>
        </div>

        <div className="relative flex items-center bg-white/50 rounded border border-dragon-gold/30 p-1 group focus-within:border-dragon-red transition-all shadow-inner">
          <input
            type="text"
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRoll()}
            placeholder="e.g. 2d6 + 5"
            className="w-full bg-transparent py-2 px-3 text-xs font-mono text-dragon-darkRed placeholder:text-dragon-red/20 focus:outline-none"
          />
          <button
            onClick={handleRoll}
            disabled={!notation.trim()}
            className="p-2 bg-dragon-red hover:bg-dragon-darkRed disabled:opacity-30 text-white rounded transition-all active:scale-95 shadow-md"
          >
            <GameIcon name="dice" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
