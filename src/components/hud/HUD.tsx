import React, { useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useGameStore } from '../../store/useGameStore';
import { WorldPanel } from './WorldPanel';
import { GameScreen } from './GameScreen';
import { CharacterPanel } from './CharacterPanel';
import { Journal } from './Journal';
import { motion } from 'motion/react';

import { Nav } from './nav/Nav';
import { EnvironmentalEngine } from './EnvironmentalEngine';
import { HUDFooter } from './HUDFooter';

export const HUD: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    isCharacterPanelOpen, 
    setIsWorldPanelOpen,
    setIsCharacterPanelOpen,
    gameMode,
    setActiveCharacterTab,
    setIsLoading
  } = useUIStore();

  const {
    isInventoryOpen,
    setIsInventoryOpen
  } = useInventoryStore();

  // Auto-configure sidebars for Combat Mode
  useEffect(() => {
    if (gameMode === 'combat') {
      setIsWorldPanelOpen(true);
      setIsCharacterPanelOpen(true);
      setIsInventoryOpen(true);
      setActiveCharacterTab('party');
      
      // Auto-start initiative
      const { startCombat } = useGameStore.getState();
      startCombat();
    }
  }, [gameMode, setIsWorldPanelOpen, setIsCharacterPanelOpen, setIsInventoryOpen, setActiveCharacterTab]);

  const { resetAtlas, loadAllCitiesRegistry, loadDiscoveredLocations } = useWorldStore();

  useEffect(() => {
    // Initial cleanup of atlas data and loaded categories to prevent stale states
    resetAtlas();
    
    // Load directories and discovered locations
    loadAllCitiesRegistry();
    loadDiscoveredLocations();

    // Dismiss the loading screen after a short delay to ensure components are ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resetAtlas, loadAllCitiesRegistry, loadDiscoveredLocations, setIsLoading]);

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
          initial={false}
          animate={{ width: isWorldPanelOpen ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full z-[1000] relative flex flex-col shrink-0 overflow-hidden seamless-hud-unit border-l-0"
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
          initial={false}
          animate={{ width: (isCharacterPanelOpen || isInventoryOpen) ? 320 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full z-[1000] relative flex flex-col shrink-0 overflow-hidden seamless-hud-unit border-r-0"
        >
          <div className="w-80 h-full flex flex-col overflow-hidden">
             <CharacterPanel />
          </div>
        </motion.aside>
      </div>

      {/* 5. Compact Bottom Footer */}
      <HUDFooter />
    </div>
  );
};
