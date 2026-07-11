import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getCharacterActions, ActionHudAction } from '../../lib/tokenActionHud';

interface TokenActionHUDProps {
  x: number;
  y: number;
  cellSize: number;
}

export const TokenActionHUD: React.FC<TokenActionHUDProps> = ({ x, y, cellSize }) => {
  const {
    isTargeting,
    targetingAction,
    setIsTargeting,
    setTargetingAction
  } = useUIStore();
  const { addLog, nextTurn, combatState } = useGameStore();
  const { activeCharacterId, characters, consumeAction } = useCharacterStore();
  const [isSpellsDropdownOpen, setIsSpellsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find whose turn it actually is in the initiative order
  const activeTurnActor = combatState.initiativeOrder[combatState.activeTurnIndex];

  // Find character or ally data depending on active turn actor
  const activeChar = useMemo(() => {
    if (!activeTurnActor) return characters.find(c => c.id === activeCharacterId) || null;
    // If it is a monster/summon in the combatState
    const monster = combatState.monsters.find(m => m.id === activeTurnActor.id);
    if (monster) {
      // Mock a Character interface structure for the summon/ally to generate its available actions
      return {
        id: monster.id,
        name: monster.name,
        class: monster.type || 'Ally',
        race: 'Summon',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Neutral',
        background: 'Summoned',
        stats: monster.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: [],
        traits: [],
        features: [],
        flaws: [],
        ideals: [],
        bonds: [],
        backstory: '',
        languages: [],
        appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
        inventory: {},
        backpack: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        choices: {},
        hp: monster.hp,
        maxHp: monster.maxHp,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        // Setup action economy for summon/ally
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      } as any;
    }
    return characters.find(c => c.id === activeTurnActor.id) || characters.find(c => c.id === activeCharacterId) || null;
  }, [activeTurnActor, characters, activeCharacterId, combatState.monsters]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpellsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all actions
  const allActions = useMemo(() => getCharacterActions(activeChar || null), [activeChar]);

  // Extract core action items
  const attackAction = allActions.find(a => a.id === 'attack');
  const moveAction = allActions.find(a => a.id === 'move');
  const defendAction = allActions.find(a => a.id === 'defend');
  const spellActions = useMemo(() => allActions.filter(a => a.category === 'Spells'), [allActions]);

  const handleActionClick = (action: ActionHudAction) => {
    setIsSpellsDropdownOpen(false);
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
      if (activeChar && activeChar.isNpc) {
         // Do not consume store character actions for a mock ally/summon character object
      } else {
         consumeAction(activeCharacterId, 'actions');
      }
      const actorId = activeChar?.id || activeCharacterId || 'player';
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
    }
  };

  // Check if it's currently this character's or friendly ally's turn
  const isMyTurn = useMemo(() => {
    if (combatState.initiativeOrder.length === 0) return true;
    const currentActor = combatState.initiativeOrder[combatState.activeTurnIndex];
    return currentActor?.id === activeCharacterId || currentActor?.isPlayer;
  }, [combatState.initiativeOrder, combatState.activeTurnIndex, activeCharacterId]);

  if (!isMyTurn) return null;

  return (
    <div 
      className="absolute pointer-events-none z-[130]"
      style={{
        left: x * cellSize + cellSize / 2,
        top: y * cellSize,
        transform: 'translate(-50%, -110%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="flex items-center gap-1.5 p-1.5 bg-stone-950/90 border border-dragon-gold/40 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-auto"
      >
        {/* Quick Attack */}
        {attackAction && (
          <button
            onClick={() => handleActionClick(attackAction)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
              targetingAction?.id === 'attack' 
                ? "bg-dragon-red border-dragon-gold text-white" 
                : "bg-stone-900 border-white/10 text-white hover:border-white/30"
            )}
            title="Attack (1 Action)"
          >
            <GameIcon name="melee" size={16} />
          </button>
        )}

        {/* Quick Move */}
        {moveAction && (
          <button
            onClick={() => handleActionClick(moveAction)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
              targetingAction?.id === 'move'
                ? "bg-blue-600 border-dragon-gold text-white"
                : "bg-stone-900 border-white/10 text-white hover:border-white/30"
            )}
            title="Move (Movement)"
          >
            <GameIcon name="footsteps" size={16} />
          </button>
        )}

        {/* Spells Menu */}
        {spellActions.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSpellsDropdownOpen(!isSpellsDropdownOpen)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
                isSpellsDropdownOpen || targetingAction?.category === 'Spells'
                  ? "bg-purple-600 border-dragon-gold text-white"
                  : "bg-stone-900 border-white/10 text-white hover:border-white/30"
              )}
              title="Known Spells"
            >
              <GameIcon name="spells" size={16} />
            </button>

            {/* Compact Spell Dropdown */}
            <AnimatePresence>
              {isSpellsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-stone-950 border border-dragon-gold/30 rounded-md shadow-xl p-1 z-50 max-h-48 overflow-y-auto custom-scrollbar"
                >
                  <div className="text-[8px] font-black uppercase text-dragon-gold tracking-widest px-2 py-1 border-b border-white/5 mb-1 text-center font-elan">
                    Spells
                  </div>
                  {spellActions.map((spell) => (
                    <button
                      key={spell.id}
                      onClick={() => handleActionClick(spell)}
                      className={cn(
                        "w-full px-2 py-1 text-left text-[10px] font-serif font-black uppercase tracking-wider rounded text-white/80 hover:text-white hover:bg-stone-900 transition-colors flex items-center justify-between",
                        targetingAction?.id === spell.id && "text-dragon-gold bg-dragon-gold/10"
                      )}
                    >
                      <span className="truncate">{spell.name}</span>
                      {spell.data?.level !== undefined && (
                        <span className="text-[8px] text-purple-400 font-bold">L{spell.data.level}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Defend */}
        {defendAction && (
          <button
            onClick={() => handleActionClick(defendAction)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all border bg-stone-900 border-white/10 text-white hover:border-white/30 shadow hover:scale-110"
            title="Defend stance (+2 AC)"
          >
            <GameIcon name="shield" size={16} />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-0.5" />

        {/* End Turn */}
        <button
          onClick={() => {
            addLog(`${activeChar?.name || 'Player'} has ended their turn.`, 'success');
            setIsSpellsDropdownOpen(false);
            nextTurn();
          }}
          className="px-3 h-8 bg-dragon-gold text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-full hover:brightness-110 active:scale-95 transition-all shadow border border-white/20 font-elan"
          title="End Your Turn"
        >
          End Turn
        </button>
      </motion.div>
    </div>
  );
};
