import React, { useMemo } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useGameStore } from '../../../store/useGameStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getCharacterActions, ActionHudAction } from '../../../lib/tokenActionHud';
import { DeathSavesPanel } from './DeathSavesPanel';

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

  // Downed State check
  const isDowned = activeChar && activeChar.hp <= 0;

  // Dynamic actions based on tokenActionHud logic
  const allActions = useMemo(() => getCharacterActions(activeChar || null), [activeChar]);

  if (isDowned && activeChar) {
    return (
      <DeathSavesPanel
        activeChar={activeChar}
        onEndTurn={() => {
          addLog(`${activeChar.name} passes their turn while downed.`, 'success');
          nextTurn();
        }}
      />
    );
  }

  // Group actions by category
  const categories = useMemo(() => {
    const groups: Record<string, ActionHudAction[]> = {};
    allActions.forEach(action => {
      if (!groups[action.category]) groups[action.category] = [];
      groups[action.category].push(action);
    });
    return groups;
  }, [allActions]);

  const handleActionClick = (action: ActionHudAction) => {
    const isActive = targetingAction?.id === action.id;

    if (isActive) {
      setIsTargeting(false);
      setTargetingAction(null);
      addLog(`Action cancelled: ${action.name}`, 'warning');
      return;
    }

    // Check action economy
    if (action.actionType && activeChar?.actionEconomy) {
      const remaining = activeChar.actionEconomy[action.actionType].current;
      if (remaining <= 0) {
        addLog(`You don't have enough ${action.actionType.replace('bonusActions', 'bonus actions')}!`, 'error');
        return;
      }
    }

    // Check spell slots
    if (action.category === 'Spells' && action.data?.level > 0 && activeChar?.spellSlots) {
      const level = action.data.level;
      const slots = activeChar.spellSlots[level.toString()];
      if (!slots || slots.current <= 0) {
        addLog(`You don't have any level ${level} spell slots remaining!`, 'error');
        return;
      }
    }

    addLog(`Action selected: ${action.name}`, 'info');

    if (action.id === 'attack') {
      setIsTargeting(true);
      setTargetingAction({
        ...action,
        attack_bonus: 5,
        damage: [{ damage_dice: '1d8+3', damage_type: { name: 'slashing' } }]
      });
      addLog("Select a target on the grid.", 'info');
    } else if (action.id === 'move') {
      setIsTargeting(true);
      setTargetingAction({ ...action });
      addLog("Select destination on the grid.", 'info');
    } else if (action.category === 'Spells') {
      setIsTargeting(true);
      setTargetingAction({ ...action });
      addLog(`Casting ${action.name}. Select target.`, 'info');
    } else if (action.id === 'defend') {
      const { consumeAction } = useCharacterStore.getState();
      consumeAction(activeCharacterId, 'actions');
      const actorId = activeCharacterId || 'player';
      useGameStore.setState(state => ({
        combatState: {
          ...state.combatState,
          activeConditions: {
            ...state.combatState.activeConditions,
            [actorId]: [...(state.combatState.activeConditions[actorId] || []), 'defending']
          }
        }
      }));
      addLog(`${activeChar?.name || 'Player'} adopts a defensive stance! (+2 AC)`, 'success');
      nextTurn();
    } else if (action.category === 'Items') {
      setIsTargeting(true);
      setTargetingAction({ ...action });
      addLog(`Using ${action.name}. Select target.`, 'info');
    } else if (action.category === 'Skills') {
      addLog(`Using ${action.name}.`, 'info');
      // Resolve skill logic
    }
  };

  return (
    <div className="w-full flex flex-col bg-stone-950 border-t-2 border-dragon-gold overflow-hidden shadow-2xl font-serif">
      {/* Header / Info bar */}
      <div className="px-4 py-2 bg-black/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dragon-red animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 font-elan">Tactical Action Matrix</span>
        </div>
        
        {/* Action Economy Tracker */}
        {activeChar?.actionEconomy && (
          <div className="flex items-center gap-4 bg-black/40 px-4 py-1 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5" title="Actions">
              <div className={cn("w-1.5 h-1.5 rounded-full", activeChar.actionEconomy.actions.current > 0 ? "bg-green-500" : "bg-red-500")} />
              <span className="text-[8px] font-bold text-white/60 uppercase">ACT: {activeChar.actionEconomy.actions.current}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Bonus Actions">
              <div className={cn("w-1.5 h-1.5 rounded-full", activeChar.actionEconomy.bonusActions.current > 0 ? "bg-blue-500" : "bg-red-500")} />
              <span className="text-[8px] font-bold text-white/60 uppercase">BNS: {activeChar.actionEconomy.bonusActions.current}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Reactions">
              <div className={cn("w-1.5 h-1.5 rounded-full", activeChar.actionEconomy.reactions.current > 0 ? "bg-purple-500" : "bg-red-500")} />
              <span className="text-[8px] font-bold text-white/60 uppercase">REA: {activeChar.actionEconomy.reactions.current}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Movement">
              <span className="text-[8px] font-bold text-white/60 uppercase">MOV: {activeChar.actionEconomy.movement.current}ft</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
           {activeChar && (
              <div className="flex items-center gap-2 px-3 py-0.5 bg-dragon-gold/10 border border-dragon-gold/20 rounded-full">
                 <span className="text-[9px] font-black text-dragon-gold uppercase tracking-widest">{activeChar.name}</span>
                 <span className="text-[8px] font-bold text-dragon-gold/60 uppercase">Lvl {activeChar.level} {activeChar.class}</span>
              </div>
           )}
           <button 
            onClick={() => setGameMode('exploration')}
            className="text-[9px] font-black uppercase text-dragon-red hover:text-white transition-colors border border-dragon-red/30 px-2 py-0.5 rounded bg-dragon-red/10 font-elan"
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar p-4">
        <div className="flex gap-8 min-w-max">
           {Object.entries(categories).map(([category, actions]) => (
             <div key={category} className="flex flex-col gap-3">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 pb-1">{category}</span>
                <div className="flex gap-3">
                  {actions.map((action) => {
                    const isActive = targetingAction?.id === action.id;
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick(action)}
                        className="flex flex-col items-center group relative"
                        title={action.description}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg group-hover:border-white/30",
                          action.color || 'bg-stone-800',
                          isActive ? "border-dragon-gold ring-4 ring-dragon-gold/20 scale-110" : "border-white/10"
                        )}>
                          <GameIcon name={action.icon} size={20} color="#FFF" />
                        </div>
                        <span className={cn(
                          "mt-1.5 text-[9px] font-black uppercase tracking-widest transition-colors max-w-[64px] text-center leading-tight",
                          isActive ? "text-dragon-gold" : "text-white/60 group-hover:text-white"
                        )}>{action.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
             </div>
           ))}

           {/* Spell Slots */}
           {activeChar?.spellSlots && Object.keys(activeChar.spellSlots).length > 0 && (
             <div className="flex flex-col gap-3 pl-8 border-l border-white/10">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 pb-1">Spell_Slots</span>
               <div className="flex gap-2">
                  {Object.entries(activeChar.spellSlots).map(([lvl, slot]: [string, any]) => (
                    <div key={lvl} className="flex flex-col items-center gap-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: slot.max }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-3 rounded-sm border border-purple-500/30",
                              i < slot.current ? "bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" : "bg-black/40"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="text-[7px] font-black text-purple-400/60 uppercase tracking-tighter">L{lvl}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {/* Turn Controls */}
           <div className="ml-auto flex items-center pl-8 border-l border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  addLog(`${activeChar?.name || 'Player'} has ended their turn.`, 'success');
                  nextTurn();
                }}
                className="px-8 py-4 bg-dragon-gold text-stone-900 rounded-sm font-header font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:brightness-110 transition-all border-2 border-white/20"
              >
                End Turn
              </motion.button>
           </div>
        </div>
      </div>

      {/* Action Details Tray */}
      <div className="px-4 py-1.5 bg-black/80 border-t border-white/5 min-h-[24px] flex items-center justify-between">
        {isTargeting ? (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-dragon-gold uppercase animate-pulse">Targeting Mode:</span>
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest italic">
              {targetingAction?.description || "Select a target on the grid."}
            </span>
          </div>
        ) : (
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic font-elan">
            Select an action from your token matrix to deploy tactical capabilities.
          </p>
        )}
        
        <div className="flex items-center gap-4">
           {targetingAction?.range !== undefined && (
             <div className="flex items-center gap-1.5 text-blue-400">
                <GameIcon name="footsteps" size={10} color="currentColor" />
                <span className="text-[8px] font-black uppercase tracking-widest">Range: {targetingAction.range * 5}ft</span>
             </div>
           )}
           {targetingAction?.radius !== undefined && (
             <div className="flex items-center gap-1.5 text-dragon-red">
                <GameIcon name="magic_effect" size={10} color="currentColor" />
                <span className="text-[8px] font-black uppercase tracking-widest">Radius: {targetingAction.radius * 5}ft</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
