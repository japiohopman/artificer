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
  const {
    setGameMode,
    setIsAdvancedRollerOpen,
    setIsTargeting,
    setTargetingAction,
    isTargeting,
    targetingAction
  } = useUIStore();
  const { addLog, nextTurn } = useGameStore();
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
          {actions.map((action) => {
            const isActive = targetingAction?.id === action.id;

            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isActive) {
                    setIsTargeting(false);
                    setTargetingAction(null);
                    addLog(`Action cancelled: ${action.label}`, 'warning');
                    return;
                  }

                  addLog(`Action selected: ${action.label}`, 'info');
                  if (action.id === 'attack') {
                    setIsTargeting(true);
                    setTargetingAction({
                      ...action,
                      name: 'Standard Attack',
                      attack_bonus: 5,
                      damage: [{ damage_dice: '1d8+3', damage_type: { name: 'slashing' } }]
                    });
                    addLog("Select a target on the grid.", 'info');
                  } else if (action.id === 'move') {
                    setIsTargeting(true);
                    setTargetingAction({ ...action, name: 'Move' });
                    addLog("Select destination on the grid.", 'info');
                  } else if (action.id === 'spells') {
                    setIsAdvancedRollerOpen(true);
                  } else if (action.id === 'defend') {
                    // Normalize player ID to 'player' to match initiative order and AI targeting
                    const actorId = 'player';
                    useGameStore.setState(state => ({
                      combatState: {
                        ...state.combatState,
                        activeConditions: {
                          ...state.combatState.activeConditions,
                          [actorId]: [...(state.combatState.activeConditions[actorId] || []), 'defending']
                        }
                      }
                    }));
                    addLog(`${activeChar?.name || 'Player'} adopts a defensive stance! (+2 AC until next turn)`, 'success');
                    nextTurn();
                  } else if (action.id === 'items') {
                    setIsTargeting(true);
                    setTargetingAction({ ...action, name: 'Use Item' });
                    addLog("Select an item or a target for item use.", 'info');
                  } else if (action.id === 'skills') {
                    addLog("Class skills matrix opening...", 'info');
                    // Future: Open skills submenu
                  }
                }}
                className="flex flex-col items-center group"
              >
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg group-hover:border-white/30",
                  action.color,
                  isActive ? "border-dragon-gold ring-4 ring-dragon-gold/20 scale-110" : "border-white/10"
                )}>
                  <GameIcon name={action.icon} size={24} color="#FFF" />
                </div>
                <span className={cn(
                  "mt-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-dragon-gold" : "text-white/60 group-hover:text-white"
                )}>{action.label}</span>
              </motion.button>
            );
          })}
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
      <div className="px-4 py-1.5 bg-black/40 border-t border-white/5 min-h-[24px]">
        {isTargeting ? (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-dragon-gold uppercase animate-pulse">Targeting Mode:</span>
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest italic">
              {targetingAction?.description || "Select a target on the grid."}
            </span>
          </div>
        ) : (
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">
            Select an action to view range and tactical implications.
          </p>
        )}
      </div>
    </div>
  );
};
