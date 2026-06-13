import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
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
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    dynamicNavButtons,
  } = useCharacterStore();

  const {
    currentLocation,
    gameTime,
    isNight
  } = useWorldStore();

  const {
    activeCharacterId,
    characters
  } = useCharacterStore();

  const {
    setIsInventoryOpen
  } = useInventoryStore();

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
      id: 'profile-menu',
      icon: 'scroll',
      label: 'Stats',
      onClick: () => setIsProfileMenuOpen(!isProfileMenuOpen),
      isActive: isProfileMenuOpen,
      shortcut: 'P'
    },
    {
      id: 'character-panel',
      icon: 'party_stats',
      label: 'Hero',
      onClick: () => {
        // Now Hero also toggles the full stats view by default
        setIsProfileMenuOpen(!isProfileMenuOpen);
      },
      isActive: isProfileMenuOpen || isCharacterPanelOpen,
      shortcut: 'C'
    }
  ];

  return (
    <nav className="h-16 w-full px-6 flex items-center justify-between relative overflow-hidden pointer-events-auto bg-parchment-100/80 backdrop-blur-md rounded-xl border-2 border-dragon-gold shadow-lg bg-paper-texture">
      {/* Visual Accents */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-dragon-red/20" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-dragon-red/5 to-transparent pointer-events-none" />

      {/* Left Section: Side Toggle + Location */}
      <div className="flex items-center gap-6 z-10 w-1/3">
        <div className="flex gap-2">
          {leftActions.map(action => (
            <button 
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "w-10 h-10 rounded border-2 transition-all flex items-center justify-center relative group shadow-sm",
                action.isActive 
                  ? "bg-dragon-red border-dragon-gold text-white shadow-dragon-red/40 scale-105" 
                  : "bg-parchment-200 border-dragon-gold/30 text-dragon-red/60 hover:text-dragon-red hover:border-dragon-gold/60"
              )}
            >
              <GameIcon name={action.icon} size={18} />
              {action.shortcut && (
                <span className="absolute -top-1 -right-1 bg-dragon-darkRed text-[7px] px-1 rounded border border-dragon-gold text-white/80">
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.8)]" />
             <span className="text-[9px] font-black uppercase text-dragon-darkRed/60 tracking-[0.3em]">Position_Verified</span>
          </div>
          <span className="text-sm font-header font-black text-dragon-red uppercase tracking-widest mt-0.5 truncate">
             {currentLocation?.name || 'Unknown Region'}
          </span>
        </div>
      </div>

      {/* Middle Section: Command Display */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center z-10">
        <div className="flex items-center gap-6 bg-parchment-200/50 backdrop-blur-md px-6 py-1.5 rounded-full border-2 border-dragon-gold/30 shadow-inner">
           <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-dragon-darkRed/40 uppercase tracking-[0.2em] mb-0.5">Timeline</span>
              <div className="flex items-center gap-2">
                 <GameIcon name={isNight() ? "moon" : "eye"} size={10} className="text-dragon-red/50" />
                 <span className="text-xs font-mono text-dragon-darkRed tracking-[0.1em] font-black">
                    {formatTime(gameTime)}
                 </span>
              </div>
           </div>

           <div className="w-px h-6 bg-dragon-gold/20" />

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
                      action.isActive ? "text-dragon-red" : "text-dragon-red/40 hover:text-dragon-red"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-all",
                      action.isActive ? "bg-dragon-red/10 border-2 border-dragon-red/30 shadow-inner" : "group-hover:bg-dragon-red/5"
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
      <div className="flex items-center gap-6 z-10 w-1/3 justify-end">
        {activeChar && (
          <div className="flex items-center gap-4 px-4 py-1.5 bg-parchment-200/50 border-2 border-dragon-gold/30 rounded-lg shadow-inner">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-dragon-darkRed/40 uppercase tracking-tighter">Lvl {activeChar.level || 1} {activeChar.class || 'Hero'}</span>
                <div className="w-24 h-1.5 bg-parchment-300 rounded-full mt-1 overflow-hidden border border-dragon-gold/10">
                   <div 
                      className="h-full bg-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.8)]" 
                      style={{ width: `${(activeChar.hp / activeChar.maxHp) * 100}%` }}
                   />
                </div>
             </div>
             <div className="w-8 h-8 rounded border-2 border-dragon-gold overflow-hidden bg-dragon-darkRed/10 shadow-sm">
                {activeChar.avatarUrl ? (
                  <img src={activeChar.avatarUrl} alt="Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dragon-red/40">
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
                "w-10 h-10 rounded border-2 transition-all flex items-center justify-center relative group shadow-sm",
                action.isActive 
                  ? "bg-dragon-red border-dragon-gold text-white shadow-dragon-red/40 scale-105" 
                  : "bg-parchment-200 border-dragon-gold/30 text-dragon-red/60 hover:text-dragon-red hover:border-dragon-gold/60"
              )}
            >
              <GameIcon name={action.icon} size={18} />
              {action.shortcut && (
                <span className="absolute -top-1 -left-1 bg-dragon-darkRed text-[7px] px-1 rounded border border-dragon-gold text-white/80">
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
