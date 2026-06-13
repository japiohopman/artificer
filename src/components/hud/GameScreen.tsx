import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { WorldMap } from './WorldMap';
import { NPCDisplay } from './NPCDisplay';
import { ChatPanel } from './chat/ChatPanel';
import { NotificationWindow } from './NotificationWindow';
import { Rest } from './game/Rest';
import { DraggableCard } from '../atlas/DraggableCard';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

import { ActionView } from './game/ActionView';

export const GameScreen: React.FC = () => {
  const { 
    currentNPC, 
    emotion, 
    chatExpanded,
    setChatExpanded,
    activeCards,
    removeFromPreview,
    isEditingSubMap
  } = useStore();

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      {/* 1. Background Map Layer (Leaflet) */}
      <motion.div 
        animate={{ 
          opacity: chatExpanded ? 0.4 : 1,
          scale: chatExpanded ? 1.05 : 1
        }}
        className={cn(
          "absolute inset-0 z-0 transition-opacity duration-500",
          chatExpanded ? "pointer-events-none" : "pointer-events-auto"
        )}
      >
        <WorldMap />
      </motion.div>

      {/* 2. Main Game View (ActionView/Simulator/FirstPerson) - Slides up when chat is closed */}
      <motion.div 
        initial={false}
        animate={{ 
          y: chatExpanded ? 0 : -800,
          opacity: chatExpanded ? 1 : 0,
          scale: chatExpanded ? 1 : 0.9
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 120 }}
        className={cn(
          "absolute inset-x-0 top-0 bottom-[100px] z-10 flex flex-col px-4 items-center",
          chatExpanded ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div className="w-full h-full max-w-5xl mt-8">
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
                  species={currentNPC?.species || 'Humanoid'}
                  emotion={emotion}
                  name={currentNPC?.name || 'Traveler'}
                  type={currentNPC?.classJob || 'NPC'}
                  portraitUrl={currentNPC?.image}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Chat Panel Layer (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center pointer-events-none">
        <div className="w-full max-w-5xl px-4 pb-4 pointer-events-auto relative">
           <ChatPanel isCollapsed={!chatExpanded} />
        </div>
      </div>

      {/* 5. Simulator Cards Layer - Highest Priority interactive content */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        {activeCards.map((monster: any, idx: number) => (
          <div key={`${monster.index}-${idx}`} className="relative pointer-events-auto">
            <ErrorBoundary fallback={<div className="w-[380px] h-[500px] bg-red-100/50 border-2 border-red-200 rounded-xl flex items-center justify-center italic text-red-500">Card Distorted</div>}>
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
      <div className="absolute top-0 inset-x-0 z-[200] px-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto mt-4">
          <NotificationWindow />
        </div>
      </div>
    </div>
  );
};
