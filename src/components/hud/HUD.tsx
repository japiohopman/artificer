import React from 'react';
import { useStore } from '../../store/useStore';
import { WorldPanel } from './WorldPanel';
import { GameScreen } from './GameScreen';
import { CharacterPanel } from '../character/CharacterPanel';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

import { Nav } from './nav/Nav';

export const HUD: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    isCharacterPanelOpen, 
    isInventoryOpen,
    setIsWorldPanelOpen,
    setIsCharacterPanelOpen,
    setIsInventoryOpen
  } = useStore();

  return (
    <div className="h-screen w-full flex overflow-hidden bg-black text-parchment-900 font-sans relative">
      {/* 1. Left Aside: World Panel */}
      <AnimatePresence mode="wait">
        {isWorldPanelOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full w-80 bg-zinc-950 border-r border-white/10 z-[1000] relative flex flex-col shrink-0"
          >
            <WorldPanel />
            
            {/* Panel Close Tab (Left) */}
            <button 
              onClick={() => setIsWorldPanelOpen(false)}
              className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-16 bg-white/5 backdrop-blur-xl text-white/40 flex items-center justify-center rounded-r-md hover:text-white transition-all border border-l-0 border-white/10"
              title="Close World Panel"
            >
              <GameIcon name="chevron_left" size={12} color="currentColor" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Main Content: Game Screen Area */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden bg-black">
        {/* Top Header / Navigation (Floating over GameScreen) */}
        <div className="absolute top-0 inset-x-0 z-[2000] p-4 pointer-events-none">
          <Nav />
        </div>

        {/* The Game Screen Area */}
        <GameScreen />
        
        {/* Sidebar Toggle Buttons (Visible when panels are closed) */}
        {!isWorldPanelOpen && (
          <button 
            onClick={() => setIsWorldPanelOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-white/5 backdrop-blur-xl border border-l-0 border-white/10 text-white/40 hover:text-white hover:w-10 transition-all rounded-r-xl z-[1500] flex flex-col items-center justify-center gap-4 group"
          >
            <GameIcon name="city" size={16} />
            <div className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Atlas</div>
          </button>
        )}
        
        {!isCharacterPanelOpen && !isInventoryOpen && (
          <button 
            onClick={() => {
              setIsCharacterPanelOpen(true);
              setIsInventoryOpen(true);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-white/5 backdrop-blur-xl border border-r-0 border-white/10 text-white/40 hover:text-white hover:w-10 transition-all rounded-l-xl z-[1500] flex flex-col items-center justify-center gap-4 group"
          >
            <GameIcon name="party_stats" size={16} />
            <div className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Party</div>
          </button>
        )}
      </div>

      {/* 3. Right Aside: Character Panel */}
      <AnimatePresence mode="wait">
        {(isCharacterPanelOpen || isInventoryOpen) && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full w-80 bg-zinc-950 border-l border-white/10 z-[1000] relative flex flex-col shrink-0"
          >
            <div className="w-full h-full overflow-hidden">
               <CharacterPanel />
            </div>
            
            {/* Panel Close Tab (Right) */}
            <button 
              onClick={() => {
                setIsCharacterPanelOpen(false);
                setIsInventoryOpen(false);
              }}
              className="absolute top-1/2 -left-4 -translate-y-1/2 w-4 h-16 bg-white/5 backdrop-blur-xl text-white/40 flex items-center justify-center rounded-l-md hover:text-white transition-all border border-r-0 border-white/10"
              title="Close Character Panel"
            >
              <GameIcon name="chevron_right" size={12} color="currentColor" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
