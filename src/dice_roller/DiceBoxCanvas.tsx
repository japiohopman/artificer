import React, { useEffect, useRef } from 'react';
import { diceService } from './diceService';
import { useStore } from '../store/useStore';
import { useInventoryStore } from '../store/useInventoryStore';

export const DiceBoxCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setIsDiceReady, isWorldPanelOpen, isCharacterPanelOpen } = useStore();
  const { isInventoryOpen } = useInventoryStore();

  useEffect(() => {
    if (containerRef.current) {
      diceService.init('#dice-box-container').then(() => {
        setIsDiceReady(true);
        // Force initial resize
        const handleResize = () => {
          // @ts-ignore
          if (diceService.diceBox && typeof diceService.diceBox.resize === 'function') {
            // @ts-ignore
            diceService.diceBox.resize();
          }
        };
        handleResize();
      }).catch(err => {
        console.error("[DiceBoxCanvas] Init failed:", err);
      });
    }
  }, [setIsDiceReady]);

  // Handle resizing when sidebars toggle
  useEffect(() => {
    const handleResize = () => {
      // @ts-ignore
      if (diceService.diceBox && typeof diceService.diceBox.resize === 'function') {
        // @ts-ignore
        diceService.diceBox.resize();
      }
    };
    
    // Dice need a short delay to wait for sidebar animation
    const timeout = setTimeout(handleResize, 350);
    return () => clearTimeout(timeout);
  }, [isWorldPanelOpen, isCharacterPanelOpen, isInventoryOpen]);

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
