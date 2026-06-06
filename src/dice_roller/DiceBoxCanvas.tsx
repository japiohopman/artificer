import React, { useEffect, useRef } from 'react';
import { diceService } from './diceService';

export const DiceBoxCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      diceService.init('#dice-box-container');
    }
  }, []);

  return (
    <div 
      id="dice-box-container"
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* DiceBox will inject the canvas here */}
    </div>
  );
};
