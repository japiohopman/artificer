import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon, GameIconName } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TemporalWidget } from '../TemporalWidget';

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
    isJournalOpen,
    setIsJournalOpen,
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    activeCharacterTab,
    setActiveCharacterTab,
    dynamicNavButtons,
  } = useUIStore();

  const {
    setIsInventoryOpen
  } = useInventoryStore();

  const leftActions: NavAction[] = [
    {
      id: 'grid-view',
      icon: 'panel',
      label: 'Tactical',
      onClick: () => {
        const { currentView, setCurrentView } = useUIStore.getState();
        setCurrentView(currentView === 'grid' ? 'world' : 'grid');
      },
      isActive: useUIStore.getState().currentView === 'grid',
      shortcut: 'G'
    },
    {
      id: 'world-panel',
      icon: 'city',
      label: 'Atlas',
      onClick: () => setIsWorldPanelOpen(!isWorldPanelOpen),
      isActive: isWorldPanelOpen,
      shortcut: 'M'
    },
    {
      id: 'journal-panel',
      icon: 'book',
      label: 'Journal',
      onClick: () => setIsJournalOpen(!isJournalOpen),
      isActive: isJournalOpen,
      shortcut: 'Alt+J'
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
      id: 'logistics-panel',
      icon: 'package',
      label: 'Logistics',
      onClick: () => {
        if (isCharacterPanelOpen && activeCharacterTab === 'logistics') {
          setIsCharacterPanelOpen(false);
          setIsInventoryOpen(false);
        } else {
          setActiveCharacterTab('logistics');
          setIsCharacterPanelOpen(true);
          setIsInventoryOpen(true);
        }
      },
      isActive: isCharacterPanelOpen && activeCharacterTab === 'logistics',
      shortcut: 'L'
    },
    {
      id: 'character-panel',
      icon: 'party_stats',
      label: 'Hero',
      onClick: () => {
        if (isCharacterPanelOpen && activeCharacterTab !== 'logistics') {
          setIsCharacterPanelOpen(false);
          setIsInventoryOpen(false);
        } else {
          setActiveCharacterTab('party');
          setIsCharacterPanelOpen(true);
          setIsInventoryOpen(true);
        }
      },
      isActive: isCharacterPanelOpen && activeCharacterTab !== 'logistics',
      shortcut: 'C'
    }
  ];

  return (
    <nav className="h-16 w-full px-6 flex items-center justify-between relative overflow-hidden pointer-events-auto bg-parchment-100 border-b-2 border-dragon-gold shadow-lg bg-paper-texture">
      {/* Visual Accents */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-dragon-red/20" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-dragon-red/5 to-transparent pointer-events-none" />

      {/* Left Section: Side Toggle Actions */}
      <div className="flex items-center gap-6 z-10 w-1/3">
        <div className="flex gap-2">
          {leftActions.map(action => (
            <button 
              key={action.id}
              onClick={action.onClick}
              title={action.label}
              aria-label={action.label}
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
      </div>

      {/* Middle Section: Temporal Widget & Dynamic Actions */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center z-10 gap-4">
        <TemporalWidget />
        
        {dynamicNavButtons.length > 0 && (
          <div className="flex items-center gap-4 bg-parchment-200/50 px-4 py-1.5 rounded-full border-2 border-dragon-gold/30 shadow-inner">
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
        )}
      </div>

      {/* Right Section: Action Controls */}
      <div className="flex items-center gap-6 z-10 w-1/3 justify-end">
        <div className="flex items-center gap-2">
          <div className="h-8 w-px bg-dragon-gold/20 mx-1" />
          {rightActions.map(action => (
            <button 
              key={action.id}
              id={action.id}
              onClick={action.onClick}
              title={action.label}
              aria-label={action.label}
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
