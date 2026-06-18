import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { useStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { PartyLogistics } from '../../ui/PartyLogistics';
import { GameIcon, GameIconName } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';

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
    dynamicNavButtons,
    setIsCharacterCreatorOpen,
    chatExpanded,
    setChatExpanded
  } = useStore();

  const { currentLocation } = useWorldStore();

  const { user, userProfile, isAuthReady } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const {
    activeCharacterId,
    characters
  } = useCharacterStore();

  const {
    setIsInventoryOpen,
    isInventoryOpen
  } = useInventoryStore();

  const activeChar = characters.find(c => c.id === activeCharacterId);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const leftActions: NavAction[] = [
    {
      id: 'chat-toggle',
      icon: chatExpanded ? 'chevron_down' : 'chevron_up',
      label: chatExpanded ? 'Map Focus' : 'Interaction',
      onClick: () => setChatExpanded(!chatExpanded),
      isActive: chatExpanded,
      shortcut: 'T'
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
      shortcut: 'J'
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
        const newState = !isCharacterPanelOpen;
        setIsCharacterPanelOpen(newState);
        setIsInventoryOpen(newState);
      },
      isActive: isCharacterPanelOpen || isInventoryOpen,
      shortcut: 'C'
    }
  ];

  return (
    <nav className="h-16 w-full px-6 flex items-center justify-between relative overflow-hidden pointer-events-auto bg-parchment-100/80 backdrop-blur-md rounded-xl border-2 border-dragon-gold shadow-lg bg-paper-texture z-[4000]">
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
      {dynamicNavButtons.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center z-10">
          <div className="flex items-center gap-6 bg-parchment-200/50 backdrop-blur-md px-6 py-1.5 rounded-full border-2 border-dragon-gold/30 shadow-inner">
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
      )}

      {/* Right Section: Hero Status + Stats */}
      <div className="flex items-center gap-6 z-10 w-1/3 justify-end">
        {/* Firebase Profile Section */}
        {isAuthReady && user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-1.5 bg-parchment-200/50 hover:bg-parchment-300/50 rounded-lg border-2 border-dragon-gold/30 transition-all group"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-black text-dragon-darkRed uppercase tracking-widest truncate max-w-[100px]">
                  {userProfile?.displayName || user.displayName || 'Traveler'}
                </span>
                <span className="text-[7px] font-bold text-dragon-red/60 uppercase tracking-tighter">
                  {userProfile?.role || 'User'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-dragon-gold overflow-hidden bg-white shadow-sm transition-transform group-hover:scale-105">
                {(userProfile?.photoURL || user.photoURL) ? (
                  <img 
                    src={userProfile?.photoURL || user.photoURL || ''} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dragon-red/40 bg-parchment-100">
                    <GameIcon name="user" size={16} />
                  </div>
                )}
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-parchment-50 border-2 border-dragon-gold rounded-xl shadow-2xl overflow-hidden z-50 py-2"
                  >
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-dragon-red/5 text-dragon-darkRed transition-colors"
                    >
                      <GameIcon name="scroll" size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsCharacterCreatorOpen(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-dragon-red/5 text-dragon-darkRed transition-colors"
                    >
                      <GameIcon name="quill" size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">New Hero</span>
                    </button>

                    <div className="h-px bg-dragon-gold/20 my-2 mx-4" />

                    <button
                      onClick={() => {
                        signOut(auth);
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <GameIcon name="close" size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {!user && isAuthReady && (
           <button 
             onClick={() => setIsCharacterCreatorOpen(true)}
             className="px-4 py-2 bg-dragon-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all"
           >
             Sign In / Start
           </button>
        )}

        <div className="h-8 w-px bg-dragon-gold/20 mx-1" />
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

        <div className="flex items-center gap-2">
          <PartyLogistics />
          <div className="h-8 w-px bg-dragon-gold/20 mx-1" />
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
