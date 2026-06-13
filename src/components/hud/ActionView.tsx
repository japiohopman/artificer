import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useWorldStore } from '../../store/useWorldStore';
import { FirstPersonView } from './view/FirstPersonView';
import { ChatPanel } from './chat/ChatPanel';
import { GameIcon } from '../../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableCard } from '../atlas/DraggableCard';
import { ErrorBoundary } from '../core/ErrorBoundary';

import { NotificationWindow } from './NotificationWindow';
import { Rest } from './game/Rest';

export const ActionView: React.FC = () => {
  const { currentShop } = useWorldStore();
  const { currentView, isEditingSubMap, chatExpanded, setChatExpanded, activeCards, clearPreview, setViewMode, removeFromPreview } = useStore();

  if (currentView === 'rest') {
    return <Rest />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative items-center pointer-events-auto">
      {/* 1. Header Navigation Stream */}
      <div className="w-full flex items-center justify-between mb-4 px-2 gap-4">
        <div className="flex-1">
           <NotificationWindow />
        </div>
        
        {/* View Toggles */}
        <div className="flex items-center gap-2 bg-stone-900/40 p-1 rounded-md border border-white/5 backdrop-blur-md">
           <button 
             onClick={() => setChatExpanded(false)}
             className={cn(
               "p-1.5 rounded transition-all",
               !chatExpanded ? "bg-dragon-red text-white" : "text-white/40 hover:text-white/60"
             )}
             title="Focus Visuals"
           >
             <GameIcon name="eye" size={14} />
           </button>
           <button 
             onClick={() => setChatExpanded(true)}
             className={cn(
               "p-1.5 rounded transition-all",
               chatExpanded ? "bg-dragon-red text-white" : "text-white/40 hover:text-white/60"
             )}
             title="Focus Communications"
           >
             <GameIcon name="chat" size={14} />
           </button>
        </div>
      </div>

      {/* 2. Visuals - Core Scene Content */}
      <div className="w-full h-full max-w-5xl flex flex-col p-2">
        <div className="flex-1 bg-parchment-100 rounded-lg overflow-hidden shadow-2xl relative border-2 border-dragon-gold bg-paper-texture">
          <FirstPersonView />
          
          {/* Internal Overlay Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] z-10" />

          {/* Shop/Sub-location Info Badge */}
          {currentShop && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-6 right-6 z-20 flex flex-col items-end"
            >
               <div className="bg-black/60 backdrop-blur-md border-r-4 border-dragon-red px-4 py-2 flex items-center gap-3">
                  <div className="text-right">
                     <p className="text-[8px] font-black text-dragon-red uppercase tracking-[0.3em] leading-none mb-1">Commercial Node</p>
                     <h4 className="text-xl font-header font-black text-white uppercase tracking-widest leading-none">{currentShop}</h4>
                  </div>
                  <div className="w-10 h-10 rounded bg-dragon-red/20 flex items-center justify-center border border-dragon-red/30">
                     <GameIcon name="package" size={20} color="#FF4444" />
                  </div>
               </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* 3. Global Entity Sim (Floating Cards) */}
      <AnimatePresence>
        {activeCards.length > 0 && !chatExpanded && (
          <div className="fixed inset-0 z-[1000] pointer-events-none p-12">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-parchment-300 shadow-xl inline-flex flex-col gap-2 pointer-events-auto absolute top-20 left-12">
              <h4 className="font-header text-lg text-dragon-darkRed uppercase tracking-widest">Entity Simulator</h4>
              <p className="text-[10px] text-parchment-600 font-bold uppercase">Linked Specimens: {activeCards.length}</p>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => clearPreview()}
                  className="px-3 py-1.5 bg-parchment-200 text-parchment-700 rounded text-[10px] font-bold uppercase hover:bg-parchment-300"
                >
                  Clear Manifest
                </button>
              </div>
            </div>

            {activeCards.map((monster, idx) => (
              <div key={idx} className="relative pointer-events-auto">
                <ErrorBoundary name="SimCard" fallback={<div className="w-[380px] h-[500px] bg-red-100/50 border-2 border-red-200 rounded-xl flex items-center justify-center italic text-red-500">Card Distorted</div>}>
                  <DraggableCard 
                    monster={monster} 
                    initialX={100 + (idx * 40)} 
                    initialY={100 + (idx * 40)} 
                  />
                </ErrorBoundary>
                <button 
                  onClick={() => removeFromPreview(idx)}
                  className="absolute top-0 right-0 z-[60] bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  style={{ transform: `translate(${100 + (idx * 40) + 360}px, ${100 + (idx * 40) - 10}px)` }}
                >
                  <GameIcon name="close" size={12} color="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Spacer for SubMap Editor if needed */}
      {isEditingSubMap && <div className="h-12 w-full bg-dragon-darkRed/20" />}
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
