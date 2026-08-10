import React from 'react';
import { useCharacterStore, Character } from '../../../store/useCharacterStore';
import { useGameStore } from '../../../store/useGameStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

interface DeathSavesPanelProps {
  activeChar: Character;
  onEndTurn: () => void;
}

export const DeathSavesPanel: React.FC<DeathSavesPanelProps> = ({ activeChar, onEndTurn }) => {
  const { addLog } = useGameStore();
  const deathSaves = activeChar.deathSaves || { successes: 0, failures: 0 };
  const successes = deathSaves.successes;
  const failures = deathSaves.failures;
  const isStable = activeChar.isStable || successes >= 3;
  const isDead = activeChar.isDead || failures >= 3;

  const handleRollDeathSave = () => {
    const { rollDeathSave } = useCharacterStore.getState();
    rollDeathSave(activeChar.id);
  };

  return (
    <div className="w-full flex flex-col bg-stone-950 border-t-2 border-dragon-gold overflow-hidden shadow-2xl font-serif">
      {/* Header / Info bar */}
      <div className="px-4 py-2 bg-black/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 font-elan">Unconscious / Downed State</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-0.5 bg-dragon-red/10 border border-dragon-red/20 rounded-full">
          <span className="text-[9px] font-black text-dragon-red uppercase tracking-widest">{activeChar.name}</span>
          <span className="text-[8px] font-bold text-dragon-red/60 uppercase">HP: 0/{activeChar.maxHp}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-around gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <h3 className="text-base font-black text-white uppercase tracking-wider">{activeChar.name} is Unconscious</h3>
          <p className="text-[11px] text-white/50 max-w-md text-center md:text-left leading-relaxed font-sans">
            This character is at 0 HP. Roll a d20 Death Saving Throw at the start of your turn.
            3 Successes stabilizes you. 3 Failures is permanent death. A natural 20 revives you with 1 HP!
          </p>
        </div>

        {/* Death Saves Progress Circles */}
        <div className="flex flex-col gap-3 bg-black/30 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest w-20 text-right font-elan">Successes</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={`success-dot-${i}`}
                  className={cn(
                    "w-4 h-4 rounded-full border transition-all flex items-center justify-center",
                    i <= successes
                      ? "bg-emerald-500 border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.6)] text-white"
                      : "bg-stone-900 border-white/10 text-white/10"
                  )}
                >
                  {i <= successes && <GameIcon name="check" size={8} />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest w-20 text-right font-elan">Failures</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={`failure-dot-${i}`}
                  className={cn(
                    "w-4 h-4 rounded-full border transition-all flex items-center justify-center",
                    i <= failures
                      ? "bg-red-500 border-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)] text-white"
                      : "bg-stone-900 border-white/10 text-white/10"
                  )}
                >
                  {i <= failures && <GameIcon name="close" size={8} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isStable && !isDead ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRollDeathSave}
              className="px-6 py-3 bg-dragon-red text-white rounded-sm font-header font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:brightness-110 transition-all border-2 border-white/20 font-elan"
            >
              Roll Death Save
            </motion.button>
          ) : isStable ? (
            <div className="text-center font-elan">
              <div className="px-5 py-2.5 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 font-black uppercase tracking-widest text-[10px] rounded-sm mb-1 shadow-lg">
                STABLE (0 HP)
              </div>
              <p className="text-[8px] text-emerald-400/60 uppercase font-bold">Waiting for Healing</p>
            </div>
          ) : (
            <div className="text-center font-elan">
              <div className="px-5 py-2.5 bg-red-600 border-2 border-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-sm mb-1 shadow-lg">
                DEAD
              </div>
              <p className="text-[8px] text-red-500/60 uppercase font-bold text-center">Needs Resurrection</p>
            </div>
          )}

          {/* End Turn button always available for downed characters */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndTurn}
            className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-sm font-header font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 font-elan"
          >
            End Turn
          </motion.button>
        </div>
      </div>
    </div>
  );
};
