import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FirstPersonView } from './view/FirstPersonView';
import { ChatPanel } from './ChatPanel';
import { GameIcon } from '../../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableCard } from '../DraggableCard';
import { ErrorBoundary } from '../ErrorBoundary';

import { NotificationWindow } from './NotificationWindow';
import { Rest } from './game/Rest';

export const ActionView: React.FC = () => {
  const { currentView, currentShop, isEditingSubMap, chatExpanded, setChatExpanded, activeCards, clearPreview, setViewMode, removeFromPreview } = useStore();

  if (currentView === 'campfire') {
    return <Rest />;
  }

  if (currentView === 'rest') {
    return (
      <div className="w-full h-full bg-parchment-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-parchment-300 shadow-xl">
            <h4 className="font-header text-lg text-dragon-darkRed uppercase tracking-widest">Combat Simulator</h4>
            <p className="text-[10px] text-parchment-600 font-bold uppercase">Drag cards to organize your collection</p>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => clearPreview()}
                title="Clear Board"
                aria-label="Clear Board"
                className="px-3 py-1.5 bg-parchment-200 text-parchment-700 rounded text-[10px] font-bold uppercase hover:bg-parchment-300"
              >
                Clear Board
              </button>
            </div>
          </div>
        </div>

        {activeCards.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-parchment-400 space-y-4">
            <GameIcon name="layout" size={64} className="opacity-10" />
            <p className="font-header text-2xl uppercase tracking-widest">The board is empty</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setViewMode('collection')}
                title="Go to Collection"
                aria-label="Go to Collection"
                className="px-6 py-2 bg-dragon-red text-white rounded-lg font-bold uppercase text-xs shadow-lg hover:bg-red-700"
              >
                Go to Collection
              </button>
            </div>
          </div>
        )}

        {activeCards.map((monster, idx) => (
          <div key={idx} className="relative">
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
              aria-label="Remove Card"
              className="absolute top-0 right-0 z-[60] bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              style={{ transform: `translate(${100 + (idx * 40) + 360}px, ${100 + (idx * 40) - 10}px)` }}
            >
              <GameIcon name="close" size={12} color="currentColor" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative items-center pointer-events-none">
      {/* TOP: Stationary Notifications */}
      <div className="w-full max-w-5xl z-50 pointer-events-auto">
        <NotificationWindow />
      </div>

      {/* Visuals - Always Visible */}
      <div className="w-full max-w-5xl px-1.5 pointer-events-auto mt-1.5 flex flex-col gap-1.5">
        <div className="h-[40vh] min-h-[300px] bg-zinc-950 rounded-md overflow-hidden shadow-2xl relative border border-white/10">
          <FirstPersonView />
        </div>
      </div>

      {/* MIDDLE: Flexible Area that collapses DOWN (Chat) */}
      <div className="flex-1 w-full max-w-5xl flex flex-col justify-end px-1.5 overflow-hidden pointer-events-none pb-1 relative">
        {/* Chat History & Toggle Button Area */}
        <div className="z-10 w-full pointer-events-none flex flex-col justify-end relative">
          <div className="pointer-events-auto">
            <ChatPanel isCollapsed={!chatExpanded} />
          </div>
          
          {/* Minimal Toggle Icon Overlay - Positioned relative to bottom section */}
          <div className="absolute -top-8 right-4 z-50 pointer-events-none">
            <button 
              onClick={() => setChatExpanded(!chatExpanded)}
              className="pointer-events-auto w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-red-600 backdrop-blur-md rounded-full border border-white/10 text-white transition-all shadow-2xl cursor-pointer group active:scale-90"
              title={chatExpanded ? "Collapse Chat" : "Expand Chat"}
              aria-label={chatExpanded ? "Collapse Chat" : "Expand Chat"}
            >
              <div className="transition-transform duration-300">
                {chatExpanded ? <GameIcon name="chevron_down" size={14} /> : <GameIcon name="chevron_up" size={14} className="text-red-500 group-hover:text-white" />}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Spacer for SubMap Editor if needed */}
      {isEditingSubMap && <div className="h-12 w-full bg-black/20" />}
    </div>
  );
};
