import React from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useGameStore } from '../../../store/useGameStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon, GameIconName } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion } from 'motion/react';

interface CombatAction {
  id: string;
  label: string;
  icon: GameIconName;
  color: string;
  description: string;
}

export const ActionPanel: React.FC = () => {
  const { setGameMode, setIsAdvancedRollerOpen } = useUIStore();
  const { addLog, rollDice3D, nextTurn } = useGameStore();
  const { activeCharacterId, characters } = useCharacterStore();

  const activeChar = characters.find(c => c.id === activeCharacterId);

  const actions: CombatAction[] = [
    { id: 'attack', label: 'Attack', icon: 'melee', color: 'bg-dragon-red', description: 'Strike with your equipped weapon.' },
    { id: 'move', label: 'Move', icon: 'footsteps', color: 'bg-blue-600', description: 'Change position on the grid.' },
    { id: 'skills', label: 'Skills', icon: 'skill', color: 'bg-emerald-600', description: 'Use specialized class abilities.' },
    { id: 'spells', label: 'Spells', icon: 'magic_effect', color: 'bg-purple-600', description: 'Cast an incantation from your repertoire.' },
    { id: 'items', label: 'Items', icon: 'package', color: 'bg-amber-600', description: 'Use a consumable or interact with gear.' },
    { id: 'defend', label: 'Defend', icon: 'shield', color: 'bg-slate-600', description: 'Adopt a defensive stance for protection.' },
  ];

  return (
    <div className="w-full flex flex-col bg-stone-950 border-t-2 border-dragon-gold overflow-hidden shadow-2xl">
      {/* Header / Info bar */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dragon-red animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tactical Action Matrix</span>
        </div>
        <button 
          onClick={() => setGameMode('exploration')}
          className="text-[9px] font-black uppercase text-dragon-red hover:text-white transition-colors border border-dragon-red/30 px-2 py-0.5 rounded bg-dragon-red/10"
        >
          Withdraw
        </button>
      </div>

      <div className="p-4 flex gap-4">
        {/* Main Actions Grid */}
        <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                addLog(`Action selected: ${action.label}`, 'info');
                if (action.id === 'attack') {
                  rollDice3D('1d20+5', 'Attack Roll');
                } else if (action.id === 'move') {
                  addLog("Movement grid initialized. Select a destination.", 'info');
                } else if (action.id === 'spells') {
                  setIsAdvancedRollerOpen(true);
                }
              }}
              className="flex flex-col items-center group"
            >
              <div className={cn(
                "w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border-2 border-white/10 transition-all shadow-lg group-hover:border-white/30",
                action.color
              )}>
                <GameIcon name={action.icon} size={24} color="#FFF" />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Turn Controls */}
        <div className="shrink-0 w-px bg-white/10 mx-2" />
        
        <div className="flex flex-col justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              addLog(`${activeChar?.name || 'Player'} has ended their turn.`, 'success');
              nextTurn();
            }}
            className="px-6 py-3 bg-dragon-gold text-stone-900 rounded-xl font-header font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-dragon-gold/20 hover:brightness-110 transition-all border-2 border-white/20"
          >
            End Turn
          </motion.button>
        </div>
      </div>

      {/* Action Details Tray */}
      <div className="px-4 py-1.5 bg-black/40 border-t border-white/5">
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">
          Select an action to view range and tactical implications.
        </p>
      </div>
    </div>
  );
};
