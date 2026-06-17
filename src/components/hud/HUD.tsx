import React from 'react';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { WorldPanel } from './WorldPanel';
import { GameScreen } from './GameScreen';
import { CharacterPanel } from '../character/CharacterPanel';
import { Journal } from './Journal';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

import { Nav } from './nav/Nav';

export const HUD: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    isCharacterPanelOpen, 
    setIsWorldPanelOpen,
    setIsCharacterPanelOpen,
  } = useStore();

  const {
    isInventoryOpen,
    setIsInventoryOpen
  } = useInventoryStore();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-parchment-100 text-parchment-900 font-body relative bg-paper-texture">
      {/* Journal Modal */}
      <Journal />

      {/* 1. Fixed Top Header / Navigation (Above sidebars) */}
      <div className="w-full z-[5000] p-4 pointer-events-none">
        <Nav />
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* 2. Left Aside: World Panel */}
        <motion.aside
          animate={{ width: isWorldPanelOpen ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-parchment-50 border-r-2 border-dragon-red z-[1000] relative flex flex-col shrink-0 shadow-xl overflow-hidden"
        >
          <div className="w-80 h-full flex flex-col">
            <WorldPanel />
          </div>
          
          {/* Panel Close Tab (Left) */}
          <AnimatePresence>
            {isWorldPanelOpen && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWorldPanelOpen(false)}
                className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-16 bg-dragon-red text-white flex items-center justify-center rounded-r-md hover:bg-dragon-darkRed transition-all border border-l-0 border-dragon-gold shadow-lg z-[1001]"
                title="Close World Panel"
              >
                <GameIcon name="chevron_left" size={12} color="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
          <GameScreen />
          
          {/* Sidebar Toggle Buttons (Visible when panels are closed) */}
          <AnimatePresence>
            {!isWorldPanelOpen && (
              <motion.button 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onClick={() => setIsWorldPanelOpen(true)}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-dragon-red border-2 border-l-0 border-dragon-gold text-white hover:w-10 transition-all rounded-r-xl z-[1500] flex flex-col items-center justify-center gap-4 group shadow-lg shadow-dragon-red/20"
              >
                <GameIcon name="city" size={16} />
                <div className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Atlas</div>
              </motion.button>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!isCharacterPanelOpen && !isInventoryOpen && (
              <motion.button 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onClick={() => {
                  setIsCharacterPanelOpen(true);
                  setIsInventoryOpen(true);
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-dragon-red border-2 border-r-0 border-dragon-gold text-white hover:w-10 transition-all rounded-l-xl z-[1500] flex flex-col items-center justify-center gap-4 group shadow-lg shadow-dragon-red/20"
              >
                <GameIcon name="party_stats" size={16} />
                <div className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Party</div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Right Aside: Character Panel */}
        <motion.aside
          animate={{ width: (isCharacterPanelOpen || isInventoryOpen) ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-parchment-50 border-l-2 border-dragon-red z-[1000] relative flex flex-col shrink-0 shadow-xl overflow-hidden"
        >
          <div className="w-80 h-full flex flex-col overflow-hidden">
             <CharacterPanel />
          </div>
          
          {/* Panel Close Tab (Right) */}
          <AnimatePresence>
            {(isCharacterPanelOpen || isInventoryOpen) && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCharacterPanelOpen(false);
                  setIsInventoryOpen(false);
                }}
                className="absolute top-1/2 -left-4 -translate-y-1/2 w-4 h-16 bg-dragon-red text-white flex items-center justify-center rounded-l-md hover:bg-dragon-darkRed transition-all border border-r-0 border-dragon-gold shadow-lg z-[1001]"
                title="Close Character Panel"
              >
                <GameIcon name="chevron_right" size={12} color="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </div>
  );
};
