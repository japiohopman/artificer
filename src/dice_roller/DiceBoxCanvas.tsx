import React, { useEffect, useRef } from 'react';
import { diceService } from './diceService';
import { useStore } from '../store/useStore';

export const DiceBoxCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setIsDiceReady = useStore(state => state.setIsDiceReady);

  useEffect(() => {
    if (containerRef.current) {
      diceService.init('#dice-box-container').then(() => {
        setIsDiceReady(true);
      }).catch(err => {
        console.error("[DiceBoxCanvas] Init failed:", err);
      });
    }
  }, [setIsDiceReady]);

  return (
    <div 
      id="dice-box-container"
      ref={containerRef}
      className="fixed inset-0 z-[21000] border-2 border-transparent block visible opacity-100 w-screen h-screen overflow-hidden pointer-events-none"
    >
      <style>
        {`
          #dice-box-container canvas {
            display: block !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
          }
        `}
      </style>
      {/* DiceBox will inject the canvas here */}
    </div>
  );
};
