import React, { useEffect, useRef } from 'react';
import { diceService } from './diceService';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { useInventoryStore } from '../store/useInventoryStore';

export const DiceBoxCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isWorldPanelOpen, isCharacterPanelOpen } = useUIStore();
  const { setIsDiceReady } = useGameStore();
  const { isInventoryOpen } = useInventoryStore();

  useEffect(() => {
    if (containerRef.current) {
      // Ensure we don't have multiple canvases
      const existingCanvas = containerRef.current.querySelector('canvas');
      if (existingCanvas) {
        console.log("[DiceBoxCanvas] Canvas already exists, skipping re-init.");
        return;
      }

      diceService.init(containerRef.current).then(() => {
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
      }).catch((err: any) => {
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

  const isRolling3D = useGameStore(state => state.isRolling3D);

  return (
    <div 
      id="dice-box-container"
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[100000] border-2 border-transparent w-screen h-screen overflow-hidden pointer-events-none",
        isRolling3D ? "block visible opacity-100" : "hidden invisible opacity-0"
      )}
    >
      <style>
        {`
          #dice-box-container canvas {
            display: ${isRolling3D ? 'block' : 'none'} !important;
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
