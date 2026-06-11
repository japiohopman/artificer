import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { WorldMap } from './WorldMap';
import { NPCDisplay } from './NPCDisplay';
import { ChatPanel } from './ChatPanel';
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
    <div className="flex-1 relative flex flex-col overflow-hidden bg-black">
      {/* 1. Background Map Layer (Leaflet) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <WorldMap />
      </div>

      {/* 2. Main Game View (ActionView/Simulator/FirstPerson) */}
      <div className="absolute inset-x-0 top-16 bottom-[100px] z-10 flex flex-col px-4 items-center">
        <div className="w-full h-full max-w-5xl">
            <ActionView />
        </div>
      </div>

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
           {/* Toggle Icon */}
           <div className="absolute -top-10 right-8 z-50">
              <button 
                onClick={() => setChatExpanded(!chatExpanded)}
                className="w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-dragon-red backdrop-blur-md rounded-full border border-white/10 text-white transition-all shadow-2xl cursor-pointer group"
                title={chatExpanded ? "[COLLAPSE_HISTORY]" : "[EXPAND_HISTORY]"}
              >
                  <div className={cn("transition-transform duration-300", chatExpanded ? "rotate-180" : "animate-bounce")}>
                    <GameIcon name="chevron_up" size={16} />
                  </div>
              </button>
           </div>

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
