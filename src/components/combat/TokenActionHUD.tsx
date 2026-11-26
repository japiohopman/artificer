import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

interface TokenActionHUDProps {
  x: number;
  y: number;
  cellSize: number;
}

type RadialAction = {
  id: 'Attack' | 'Spell' | 'Move' | 'Backpack' | 'End Turn';
  label: string;
  icon: string;
  tone: string;
};

const RADIAL_ACTIONS: RadialAction[] = [
  { id: 'Attack', label: 'Attack', icon: 'melee', tone: 'text-red-200 border-red-400/60 bg-red-950/90' },
  { id: 'Spell', label: 'Spell', icon: 'spells', tone: 'text-purple-200 border-purple-400/60 bg-purple-950/90' },
  { id: 'Move', label: 'Move', icon: 'footsteps', tone: 'text-blue-200 border-blue-400/60 bg-blue-950/90' },
  { id: 'Backpack', label: 'Backpack', icon: 'package', tone: 'text-amber-200 border-amber-400/60 bg-amber-950/90' },
  { id: 'End Turn', label: 'End Turn', icon: 'chevron_right', tone: 'text-stone-950 border-dragon-gold bg-dragon-gold' }
];

export const TokenActionHUD: React.FC<TokenActionHUDProps> = ({ x, y, cellSize }) => {
  const {
    isTargeting,
    combatActionCategory,
    setCombatActionCategory,
    setIsTargeting,
    setTargetingAction
  } = useUIStore();
  const { addLog, nextTurn, combatState } = useGameStore();
  const characters = useCharacterStore(state => state.characters);

  const activeTurnActor = combatState.initiativeOrder[combatState.activeTurnIndex];
  const activeChar = useMemo(
    () => activeTurnActor ? characters.find(character => character.id === activeTurnActor.id) : undefined,
    [activeTurnActor, characters]
  );

  const options = useMemo(() => {
    if (!activeTurnActor) return [];
    // Allied summons without a playable Character record have no canonical player
    // action/resource data. Keep turn advancement available without inventing actions.
    if (!activeChar) return activeTurnActor.isAlly ? [RADIAL_ACTIONS[4]] : [];
    const available: RadialAction[] = [RADIAL_ACTIONS[0]];

    if ((activeChar.knownSpells?.length || 0) > 0) available.push(RADIAL_ACTIONS[1]);
    // Keep Move in the first layer even when movement is spent; the detail panel explains its unavailable state.
    available.push(RADIAL_ACTIONS[2]);

    const equippedIds = new Set((activeChar.equipment?.slots || []).map(slot => slot.itemId).filter(Boolean));
    const hasBackpackItems =
      (activeChar.backpack?.length || 0) > 0 ||
      Object.values(activeChar.inventory || {}).some(Boolean) ||
      Object.values(activeChar.items || {}).some(item => !equippedIds.has(item.id));

    if (hasBackpackItems) available.push(RADIAL_ACTIONS[3]);
    available.push(RADIAL_ACTIONS[4]);
    return available;
  }, [activeTurnActor, activeChar]);

  const isPlayableTurn = Boolean(
    activeTurnActor &&
    (activeTurnActor.isPlayer || activeTurnActor.isAlly) &&
    (activeChar ? activeChar.hp > 0 : activeTurnActor.isAlly)
  );

  const handleActionSelect = (action: RadialAction) => {
    if (action.id === 'End Turn') {
      setCombatActionCategory(null);
      if (isTargeting) {
        setIsTargeting(false);
        setTargetingAction(null);
      }
      addLog(`${activeChar?.name || activeTurnActor?.name || 'Actor'} has ended their turn.`, 'success');
      nextTurn();
      return;
    }

    setCombatActionCategory(combatActionCategory === action.id ? null : action.id);
  };

  if (!isPlayableTurn || isTargeting || options.length === 0) return null;

  const center = 82;
  const radius = 62;
  const angleOffset = -90;

  return (
    // Keep the 50% / 50% actor anchor static. Framer Motion animates only the
    // inner layer so its scale transform can never replace the centering pivot.
    <div
      className="absolute z-[130] pointer-events-none"
      style={{
        left: x * cellSize + cellSize / 2,
        top: y * cellSize + cellSize / 2,
        width: center * 2,
        height: center * 2,
        transform: 'translate(-50%, -50%)'
      }}
      aria-label={`Actions for ${activeChar?.name || activeTurnActor.name}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.75 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 164 164"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <circle cx="82" cy="82" r="36" fill="rgba(12,10,8,0.12)" stroke="rgba(212,175,55,0.85)" strokeWidth="2" />
          <circle cx="82" cy="82" r="54" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1" strokeDasharray="2 5" />
        </svg>

        {options.map((action, index) => {
          const angle = ((angleOffset + index * (360 / options.length)) * Math.PI) / 180;
          const left = center + Math.cos(angle) * radius;
          const top = center + Math.sin(angle) * radius;
          const isSelected = action.id !== 'End Turn' && combatActionCategory === action.id;

          return (
            <motion.button
              key={action.id}
              type="button"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, x: left - center, y: top - center }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleActionSelect(action)}
              aria-label={action.label}
              aria-pressed={isSelected}
              title={action.label}
              className={cn(
                "absolute left-1/2 top-1/2 -ml-[19px] -mt-[19px] w-[38px] h-[38px] rounded-full border shadow-[0_4px_14px_rgba(0,0,0,0.65)] backdrop-blur-md flex items-center justify-center pointer-events-auto transition-colors",
                action.tone,
                isSelected && "ring-2 ring-white/80 ring-offset-2 ring-offset-stone-950 scale-110"
              )}
            >
              <GameIcon name={action.icon} size={17} color="currentColor" />
              <span className="absolute top-full mt-1 whitespace-nowrap rounded bg-stone-950/90 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-white/85 border border-white/10">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
