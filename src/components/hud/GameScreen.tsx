import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { WorldMap } from './WorldMap';
import { NPCDisplay } from './NPCDisplay';
import { ChatPanel } from './chat/ChatPanel';
import { NotificationWindow } from './NotificationWindow';
import { CombatGrid } from './game/CombatGrid';
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
    activeCards,
    removeFromPreview,
    isEditingSubMap,
    gameMode,
    activeBottomHub,
    setActiveBottomHub
  } = useStore();

  const { currentNPC, emotion } = useCharacterStore();

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      {/* 1. Background Map/Combat Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {gameMode === 'exploration' ? (
            <motion.div 
              key="world-map"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: (chatExpanded && activeBottomHub === 'chat') ? 0.4 : 1,
                scale: (chatExpanded && activeBottomHub === 'chat') ? 1.05 : 1
              }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "absolute inset-0",
                (chatExpanded && activeBottomHub === 'chat') ? "pointer-events-none" : "pointer-events-auto"
              )}
            >
              <WorldMap />
            </motion.div>
          ) : (
            <motion.div
              key="combat-grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 pointer-events-auto"
            >
              <CombatGrid />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Main Game View (ActionView/Simulator/FirstPerson) - Slides up when chat is closed */}
      <motion.div 
        initial={false}
        animate={{ 
          y: chatExpanded ? 0 : -1000,
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

      {/* 4. Hub Panel Layer (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center pointer-events-none">
        <div className={cn(
          "w-full px-4 pb-4 pointer-events-auto relative transition-all duration-500",
          gameMode === 'combat' ? "max-w-none" : "max-w-5xl"
        )}>
           {/* Toggle Buttons */}
           <div className="absolute -top-12 right-6 z-50 flex items-center gap-3 pointer-events-none">
            {gameMode === 'exploration' && (
              <button 
                onClick={() => setActiveBottomHub(activeBottomHub === 'chat' ? 'legend' : 'chat')}
                className="pointer-events-auto px-4 h-10 flex items-center gap-2 bg-dragon-gold hover:brightness-110 text-stone-900 rounded-full border-2 border-white/20 transition-all shadow-xl cursor-pointer font-black uppercase text-[10px] tracking-widest active:scale-95"
              >
                <GameIcon name={activeBottomHub === 'chat' ? 'map' : 'chat'} size={14} />
                {activeBottomHub === 'chat' ? 'Legend' : 'Chat'}
              </button>
            )}

            <button 
              onClick={() => setChatExpanded(!chatExpanded)}
              className={cn(
                "pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full border-2 border-dragon-gold transition-all shadow-xl cursor-pointer group active:scale-90",
                gameMode === 'combat' ? "bg-stone-900 text-white border-white/20" : "bg-dragon-red text-white hover:bg-dragon-darkRed"
              )}
              title={chatExpanded ? "Collapse Hub" : "Expand Hub"}
            >
              <div className="transition-transform duration-300">
                {chatExpanded ? <GameIcon name="chevron_down" size={16} /> : <GameIcon name="chevron_up" size={16} className={cn(gameMode !== 'combat' && "animate-bounce")} />}
              </div>
            </button>
          </div>

           <ChatPanel isCollapsed={!chatExpanded} />
        </div>
      </div>

      {/* 5. Simulator Cards Layer - Highest Priority interactive content */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        {activeCards.map((monster: any, idx: number) => (
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
      <div className="absolute top-0 inset-x-0 z-[200] px-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto mt-4">
          <NotificationWindow />
        </div>
      </div>
    </div>
  );
};
