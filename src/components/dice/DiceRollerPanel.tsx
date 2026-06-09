import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const AdvancedRoller: React.FC = () => {
  const { rollDice3D, isAdvancedRollerOpen, setIsAdvancedRollerOpen } = useStore();
  const [notation, setNotation] = useState('');
  const [advantage, setAdvantage] = useState<'none' | 'adv' | 'dis'>('none');

  if (!isAdvancedRollerOpen) return null;

  const handleRoll = () => {
    let finalNotation = notation.trim();
    if (!finalNotation) return;

    if (advantage === 'adv') {
        if (finalNotation.toLowerCase() === '1d20' || finalNotation.toLowerCase() === 'd20') {
            finalNotation = '2d20kh1';
        } else {
            finalNotation = `${finalNotation}kh1`;
        }
    } else if (advantage === 'dis') {
        if (finalNotation.toLowerCase() === '1d20' || finalNotation.toLowerCase() === 'd20') {
            finalNotation = '2d20kl1';
        } else {
            finalNotation = `${finalNotation}kl1`;
        }
    }

    rollDice3D(finalNotation, "Advanced Roll");
    setIsAdvancedRollerOpen(false);
  };

  const addDie = (sides: number) => {
    setNotation(prev => {
        if (!prev) return `1d${sides}`;
        return `${prev}+1d${sides}`;
    });
  };

  const clearNotation = () => setNotation('');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[25000] flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAdvancedRollerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          aria-hidden="true"
        />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-80 bg-zinc-900/90 border-2 border-dragon-red/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 pointer-events-auto overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-dragon-red/5 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-dragon-red tracking-[0.3em] leading-none mb-1">DICE CHAMBER</span>
                <h3 className="text-sm font-header font-black text-white uppercase tracking-wider">Advanced Roller</h3>
              </div>
              <button 
                onClick={() => setIsAdvancedRollerOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                title="Close Roller"
                aria-label="Close Roller"
              >
                  <GameIcon name="close" size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {[4, 6, 8, 10, 12, 20, 100].map(s => (
                <button 
                  key={s}
                  onClick={() => addDie(s)}
                  title={`Add d${s}`}
                  aria-label={`Add d${s}`}
                  className="group relative h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-dragon-red/20 hover:border-dragon-red/50 transition-all active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <GameIcon 
                    name={s === 100 ? 'd10' : `d${s}`} 
                    size={32} 
                    className="text-white/20 group-hover:text-dragon-red/60 group-hover:scale-110 transition-all duration-300" 
                  />
                  
                  <span className="absolute bottom-1 text-[9px] font-black text-white/40 group-hover:text-white transition-colors">d{s}</span>
                </button>
              ))}
              
              <button 
                onClick={clearNotation}
                title="Clear Notation"
                aria-label="Clear Notation"
                className="h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-white/10 text-white/20 hover:text-white transition-all active:scale-95"
              >
                <GameIcon name="trash" size={18} />
                <span className="text-[8px] font-black uppercase mt-1">Clear</span>
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setAdvantage(advantage === 'adv' ? 'none' : 'adv')}
                className={cn(
                  "flex-1 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                  advantage === 'adv' ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/40" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                Advantage
              </button>
              <button 
                onClick={() => setAdvantage(advantage === 'dis' ? 'none' : 'dis')}
                className={cn(
                  "flex-1 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                  advantage === 'dis' ? "bg-amber-600 border-amber-400 text-white shadow-amber-900/40" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                Disadvantage
              </button>
            </div>

            <div className="relative flex items-center bg-black/40 rounded-xl border border-white/10 p-1 group focus-within:border-dragon-red/50 transition-all">
              <input 
                type="text"
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRoll()}
                placeholder="Enter notation (e.g. 2d6 + 5)"
                aria-label="Dice Notation"
                className="w-full bg-transparent py-3 px-4 text-sm font-mono text-white placeholder:text-white/10 focus:outline-none"
              />
              <button 
                onClick={handleRoll}
                disabled={!notation.trim()}
                title="Roll Dice"
                aria-label="Roll Dice"
                className="p-2.5 bg-dragon-red hover:bg-red-600 disabled:opacity-30 disabled:grayscale text-white rounded-lg transition-all active:scale-95 shadow-lg group-hover:rotate-12"
              >
                <GameIcon name="dice" size={20} />
              </button>
            </div>
            
            <p className="mt-4 text-[9px] text-center text-white/20 italic">
              Use standard D&D notation or pick dice above.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
