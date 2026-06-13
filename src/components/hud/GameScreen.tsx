import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useCharacterStore } from '../../store/useCharacterStore';
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
  const { currentNPC, emotion } = useCharacterStore();
  const { 
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

      {/* 2. Main Visual Staging Area */}
      <div className="flex-1 flex flex-col relative z-10 p-4 md:p-6 pointer-events-none min-h-0">
        <div className="flex-1 flex flex-col lg:flex-row gap-6 relative min-h-0">
          
          {/* Left Column: Visuals & Actions */}
          <div className="flex-1 flex flex-col min-w-0">
             <ActionView />
          </div>

          {/* Right Column: Interaction Shard (NPC & Chat) */}
          <div className="w-full lg:w-[400px] flex flex-col pointer-events-auto gap-4">
             {/* Character Visualization */}
             <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md rounded-md border border-white/10 overflow-hidden relative shadow-2xl">
                <div className="flex-1 relative overflow-hidden group">
                  <NPCDisplay 
                    name={currentNPC?.name || 'Local Denizen'} 
                    species={currentNPC?.race || 'Humanoid'}
                    emotion={emotion}
                    type={currentNPC?.class || 'Citizen'}
                    imageUrl={currentNPC?.imageUrl}
                    alignment={currentNPC?.alignment}
                  />
                </div>
                
                {/* Chat Interface */}
                <div className={cn(
                  "shrink-0 transition-all duration-500",
                  chatExpanded ? "flex-1" : "h-24"
                )}>
                  <ChatPanel isCollapsed={!chatExpanded} />
                </div>
             </div>
          </div>
        </div>
        
        {/* Notification Stream / Status Bar */}
        <div className="shrink-0 mt-4 h-10 w-full">
           <NotificationWindow />
        </div>
      </div>

      {/* 3. Global Overlays specific to Game Screen */}
      <AnimatePresence>
        {activeCards.length > 0 && (
           <div className="fixed inset-0 z-[1600] pointer-events-none">
             {activeCards.map((monster, idx) => (
                <div key={idx} className="relative pointer-events-auto">
                   <ErrorBoundary name="CardSim" fallback={<div className="p-4 bg-red-900/20 text-red-500 border border-red-500/50">Entity Distorted</div>}>
                      <DraggableCard 
                        monster={monster} 
                        initialX={100 + (idx * 40)} 
                        initialY={100 + (idx * 40)} 
                      />
                   </ErrorBoundary>
                   <button 
                     onClick={() => removeFromPreview(idx)}
                     className="absolute top-0 right-0 z-[1610] bg-dragon-red text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-all"
                     style={{ transform: `translate(${100 + (idx * 40) + 360}px, ${100 + (idx * 40) - 10}px)` }}
                   >
                     <GameIcon name="close" size={12} color="currentColor" />
                   </button>
                </div>
             ))}
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};
