import React from 'react';
import { useStore } from '../../../store/useStore';
import { GameIcon, GameIconName } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface NavAction {
  id: string;
  icon: GameIconName;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  color?: string;
  shortcut?: string;
}

export const Nav: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    isCharacterPanelOpen, 
    setIsCharacterPanelOpen,
    setIsInventoryOpen,
    currentLocation,
    gameTime,
    isNight,
    dynamicNavButtons,
    activeCharacterId,
    characters
  } = useStore();

  const activeChar = characters.find(c => c.id === activeCharacterId);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const leftActions: NavAction[] = [
    {
      id: 'world-panel',
      icon: 'city',
      label: 'Atlas',
      onClick: () => setIsWorldPanelOpen(!isWorldPanelOpen),
      isActive: isWorldPanelOpen,
      shortcut: 'M'
    }
  ];

  const rightActions: NavAction[] = [
    {
      id: 'character-panel',
      icon: 'party_stats',
      label: 'Hero',
      onClick: () => {
        const nextState = !isCharacterPanelOpen;
        setIsCharacterPanelOpen(nextState);
        setIsInventoryOpen(nextState);
      },
      isActive: isCharacterPanelOpen,
      shortcut: 'C'
    }
  ];

  return (
    <nav className="h-16 w-full px-6 flex items-center justify-between relative overflow-hidden pointer-events-auto">
      {/* Visual Accents */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-dragon-gold/20" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-dragon-gold/5 to-transparent pointer-events-none" />

      {/* Left Section: Side Toggle + Location */}
      <div className="flex items-center gap-6 z-10">
        <div className="flex gap-2">
          {leftActions.map(action => (
            <button 
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "w-10 h-10 rounded border transition-all flex items-center justify-center relative group",
                action.isActive 
                  ? "bg-dragon-red border-dragon-gold/50 text-white shadow-[0_0_15px_rgba(139,0,0,0.4)]" 
                  : "bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/20"
              )}
            >
              <GameIcon name={action.icon} size={18} />
              {action.shortcut && (
                <span className="absolute -top-1 -right-1 bg-black/80 text-[7px] px-1 rounded border border-white/10 text-white/40">
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold shadow-[0_0_8px_rgba(184,134,11,0.8)]" />
             <span className="text-[9px] font-black uppercase text-dragon-gold/60 tracking-[0.3em]">Position_Verified</span>
          </div>
          <span className="text-sm font-bodoni font-black text-white uppercase tracking-widest mt-0.5">
             {currentLocation?.name || 'Unknown Region'}
          </span>
        </div>
      </div>

      {/* Middle Section: Command Display */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center z-10">
        <div className="flex items-center gap-8 bg-black/40 backdrop-blur-md px-8 py-2 rounded-full border border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Timeline</span>
              <div className="flex items-center gap-2">
                 <GameIcon name={isNight() ? "moon" : "eye"} size={10} className="text-dragon-gold/50" />
                 <span className="text-xs font-mono text-white tracking-[0.1em] font-medium">
                    {formatTime(gameTime)}
                 </span>
              </div>
           </div>

           <div className="w-px h-6 bg-white/10" />

           <div className="flex items-center gap-4">
              <AnimatePresence mode="popLayout">
                {dynamicNavButtons.map((action: NavAction) => (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={action.onClick}
                    className={cn(
                      "flex flex-col items-center group gap-1",
                      action.isActive ? "text-dragon-red" : "text-white/40 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-all",
                      action.isActive ? "bg-dragon-red/10 border border-dragon-red/30" : "group-hover:bg-white/5"
                    )}>
                      <GameIcon name={action.icon} size={14} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-tighter">{action.label}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Right Section: Hero Status + Stats */}
      <div className="flex items-center gap-6 z-10">
        {activeChar && (
          <div className="flex items-center gap-4 px-4 py-1.5 bg-black/40 border border-white/10 rounded-lg">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-white/30 uppercase">Lvl {activeChar.level || 1} {activeChar.class || 'Hero'}</span>
                <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                   <div 
                      className="h-full bg-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.8)]" 
                      style={{ width: `${(activeChar.hp / activeChar.maxHp) * 100}%` }}
                   />
                </div>
             </div>
             <div className="w-8 h-8 rounded border border-dragon-gold/20 overflow-hidden bg-dragon-darkRed/20">
                {activeChar.avatarUrl ? (
                  <img src={activeChar.avatarUrl} alt="Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dragon-gold/40">
                    <GameIcon name="user" size={16} />
                  </div>
                )}
             </div>
          </div>
        )}

        <div className="flex gap-2">
          {rightActions.map(action => (
            <button 
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "w-10 h-10 rounded border transition-all flex items-center justify-center relative group",
                action.isActive 
                  ? "bg-dragon-red border-dragon-gold/50 text-white shadow-[0_0_15px_rgba(139,0,0,0.4)]" 
                  : "bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/20"
              )}
            >
              <GameIcon name={action.icon} size={18} />
              {action.shortcut && (
                <span className="absolute -top-1 -left-1 bg-black/80 text-[7px] px-1 rounded border border-white/10 text-white/40">
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
