import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { WorldMap } from './WorldMap';
import { NPCDisplay } from './NPCDisplay';
import { ChatPanel } from './chat/ChatPanel';
import { NotificationWindow } from './NotificationWindow';
import { MapLegend } from './game/MapLegend';
import { Rest } from './game/Rest';
import { DraggableCard } from '../atlas/DraggableCard';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

import { ActionView } from './game/ActionView';

export const GameScreen: React.FC = () => {
  const { 
    chatExpanded,
    setChatExpanded,
    isEditingSubMap,
    gameMode,
    isMapLegendOpen,
    setIsMapLegendOpen
  } = useUIStore();

  const {
    activeCards,
    removeFromPreview,
    combatState
  } = useGameStore();

  const { currentNPC, emotion } = useCharacterStore();
  const { mapZoom } = useWorldStore();

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      {/* 0. Combat transition Overlay */}
      <AnimatePresence>
        {gameMode === 'combat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] pointer-events-none bg-dragon-darkRed/10"
          />
        )}
      </AnimatePresence>

      {/* 1. Background Map Layer (Leaflet) */}
      <motion.div 
        animate={{ 
          opacity: chatExpanded ? 0.4 : 1,
          scale: chatExpanded ? 1.05 : 1
        }}
        transition={{ duration: 0.5 }}
        className={cn(
          "absolute inset-0 z-0",
          chatExpanded ? "pointer-events-none" : "pointer-events-auto"
        )}
      >
        {gameMode === 'combat' ? (
          <div className="w-full h-full bg-stone-950" />
        ) : (
          <WorldMap />
        )}
      </motion.div>

      {/* 2. Main Game View (ActionView/Simulator/FirstPerson) - Slides up when chat is closed */}
      <motion.div 
        initial={false}
        animate={{ 
          y: (chatExpanded || gameMode === 'combat') ? 0 : -1000,
          opacity: (chatExpanded || gameMode === 'combat') ? 1 : 0,
          scale: (chatExpanded || gameMode === 'combat') ? 1 : 0.9
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 120 }}
        className={cn(
          "absolute inset-x-0 top-0 bottom-[64px] z-10 flex flex-col items-center",
          (chatExpanded || gameMode === 'combat') ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div className="w-full h-full max-w-5xl">
            <ActionView />
        </div>
      </motion.div>

      {/* 3. NPC Layer - Slides up when chat history is expanded */}
      <div className="absolute inset-x-0 top-0 bottom-0 z-20 flex items-end justify-center pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          {(chatExpanded && currentNPC) && (
            <motion.div 
              initial={{ opacity: 0, y: 500, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 500, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 120,
                opacity: { duration: 0.3 }
              }}
              className="w-full h-full max-w-5xl pointer-events-auto flex items-end justify-center"
            >
              <div className="w-full h-[85%] mb-[160px]">
                <NPCDisplay 
                  species={currentNPC?.race || 'Humanoid'}
                  emotion={emotion}
                  name={currentNPC?.name || 'Traveler'}
                  type={currentNPC?.class || 'NPC'}
                  portraitUrl={currentNPC?.imageUrl}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Legend & Chat Overlay Layer */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center pointer-events-none">
        {/* Map Legend Overlay Removed (moved to ChatPanel) */}

        <div className="w-full pointer-events-auto relative">

           <ChatPanel isCollapsed={!chatExpanded} />
        </div>
      </div>

      {/* 5. Simulator Cards Layer - Highest Priority interactive content */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        {activeCards.filter(card => {
          // If in combat mode, don't show cards for monsters that are already in the combat state
          if (gameMode === 'combat') {
            return !combatState.monsters.some(m => m.id === card.id || m.name === card.name);
          }
          return true;
        }).map((monster: any, idx: number) => (
          <div key={`${monster.index || idx}-${idx}`} className="relative pointer-events-auto">
            <ErrorBoundary name="SimCard" fallback={<div className="w-[380px] h-[500px] bg-red-100/50 border-2 border-red-200 rounded-xl flex items-center justify-center italic text-red-500">Entity Distorted</div>}>
              <DraggableCard 
                monster={monster} 
                initialX={100 + (idx * 40)} 
                initialY={100 + (idx * 40)} 
              />
            </ErrorBoundary>
            <button 
              onClick={() => removeFromPreview(idx)}
              title="Remove Card"
              className="absolute z-[110] bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              style={{ 
                left: 100 + (idx * 40) + 360,
                top: 100 + (idx * 40) - 10
              }}
            >
              <GameIcon name="close" size={14} color="currentColor" />
            </button>
          </div>
        ))}
      </div>

      {/* 6. TOP: Stationary Notifications */}
      <div className="absolute top-0 inset-x-0 z-[200] pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto mt-2">
          <NotificationWindow />
        </div>
      </div>
    </div>
  );
};
