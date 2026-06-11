import React from 'react';
import { useStore } from '../../../store/useStore';
import { FirstPersonView } from '../view/FirstPersonView';
import { GameIcon } from '../../../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableCard } from '../../atlas/DraggableCard';
import { ErrorBoundary } from '../../core/ErrorBoundary';
import { Rest } from './Rest';

export const ActionView: React.FC = () => {
  const { 
    currentView, 
    isEditingSubMap, 
    activeCards, 
    clearPreview, 
    setViewMode, 
    removeFromPreview 
  } = useStore();

  if (currentView === 'campfire') {
    return <Rest />;
  }

  if (currentView === 'rest') {
    return (
      <div className="w-full h-full bg-parchment-200/50 relative overflow-hidden pointer-events-auto">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-parchment-300 shadow-xl">
            <h4 className="font-header text-lg text-dragon-darkRed uppercase tracking-widest">Combat Simulator</h4>
            <p className="text-[10px] text-parchment-600 font-bold uppercase">Drag cards to organize your collection</p>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => clearPreview()}
                className="px-3 py-1.5 bg-parchment-200 text-parchment-700 rounded text-[10px] font-bold uppercase hover:bg-parchment-300"
              >
                Clear Board
              </button>
            </div>
          </div>
        </div>

        {activeCards.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-parchment-400 space-y-4">
            <GameIcon name="panel" size={64} className="opacity-10" />
            <p className="font-header text-2xl uppercase tracking-widest">The board is empty</p>
            <button 
              onClick={() => setViewMode('collection')}
              className="px-6 py-2 bg-dragon-red text-white rounded-lg font-bold uppercase text-xs shadow-lg hover:bg-red-700"
            >
              Go to Collection
            </button>
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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative items-center pointer-events-auto">
      {/* Visuals - Core Scene Content */}
      <div className="w-full h-full max-w-5xl flex flex-col p-2">
        <div className="flex-1 bg-zinc-950 rounded border border-white/10 overflow-hidden relative shadow-2xl">
          <FirstPersonView />
        </div>
      </div>
      
      {/* Bottom Spacer for SubMap Editor if needed */}
      {isEditingSubMap && <div className="h-12 w-full bg-black/20" />}
    </div>
  );
};
