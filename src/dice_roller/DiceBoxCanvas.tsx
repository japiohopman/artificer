import React, { useEffect, useRef } from 'react';
import { diceService } from './diceService';

export const DiceBoxCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      diceService.init(containerRef.current);
    }
  }, []);

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
