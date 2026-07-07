import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore } from '../../store/useWorldStore';
import { WorldPanel } from './WorldPanel';
import { GameScreen } from './GameScreen';
import { CharacterPanel } from '../character/CharacterPanel';
import { Journal } from './Journal';
import { motion } from 'motion/react';

import { Nav } from './nav/Nav';
import { EnvironmentalEngine } from './EnvironmentalEngine';

export const HUD: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    isCharacterPanelOpen, 
    setIsWorldPanelOpen,
    setIsCharacterPanelOpen,
    gameMode,
    setActiveCharacterTab
  } = useUIStore();

  const {
    isInventoryOpen,
    setIsInventoryOpen
  } = useInventoryStore();

  // Auto-configure sidebars for Combat Mode
  React.useEffect(() => {
    if (gameMode === 'combat') {
      setIsWorldPanelOpen(true);
      setIsCharacterPanelOpen(true);
      setIsInventoryOpen(true);
      setActiveCharacterTab('party');
    }
  }, [gameMode, setIsWorldPanelOpen, setIsCharacterPanelOpen, setIsInventoryOpen, setActiveCharacterTab]);

  const { resetAtlas } = useWorldStore();

  React.useEffect(() => {
    // Initial cleanup of atlas data and loaded categories to prevent stale states
    resetAtlas();
  }, [resetAtlas]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-parchment-100 text-parchment-900 font-body relative bg-paper-texture">
      <EnvironmentalEngine />
      {/* Journal Modal */}
      <Journal />

      {/* 1. Fixed Top Header / Navigation (Above sidebars) */}
      <div className="w-full z-[5000] pointer-events-none">
        <Nav />
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* 2. Left Aside: World Panel */}
        <motion.aside
          animate={{ width: isWorldPanelOpen ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-parchment-50 border-r-2 border-dragon-gold z-[1000] relative flex flex-col shrink-0 shadow-xl overflow-hidden"
        >
          <div className="w-80 h-full flex flex-col">
            <WorldPanel />
          </div>
        </motion.aside>

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
          <GameScreen />
        </div>

        {/* 4. Right Aside: Character Panel */}
        <motion.aside
          animate={{ width: (isCharacterPanelOpen || isInventoryOpen) ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-parchment-50 border-l-2 border-dragon-gold z-[1000] relative flex flex-col shrink-0 shadow-xl overflow-hidden"
        >
          <div className="w-80 h-full flex flex-col overflow-hidden">
             <CharacterPanel />
          </div>
        </motion.aside>
      </div>
    </div>
  );
};
