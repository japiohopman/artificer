import React, { useEffect } from 'react';
import { useWorldStore } from '../../store/useWorldStore';

export const EnvironmentalEngine: React.FC = () => {
  const {
    advanceTime,
    updateEnvironment,
    isNight,
    weather,
    isTraveling,
    isFastForwarding
  } = useWorldStore();

  useEffect(() => {
    // Standard game tick: 1 minute every 10 seconds
    // Fast forward: 10 minutes every 2 seconds
    const tickRate = (isTraveling && isFastForwarding) ? 2000 : 10000;
    const minutesPerTick = (isTraveling && isFastForwarding) ? 10 : 1;

    const interval = setInterval(() => {
      advanceTime(minutesPerTick);
      updateEnvironment(minutesPerTick);
    }, tickRate);

    return () => clearInterval(interval);
  }, [advanceTime, updateEnvironment, isTraveling, isFastForwarding]);

  // Visual Overlays based on state
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Day/Night Overlay */}
      <div 
        className="absolute inset-0 transition-colors duration-[5000ms]" 
        style={{ 
          backgroundColor: isNight() ? 'rgba(0, 0, 40, 0.3)' : 'transparent',
          mixBlendMode: 'multiply'
        }} 
      />

      {/* Weather Effects Overlay (Simple implementation) */}
      {weather === 'Rainy' && (
        <div className="absolute inset-0 bg-blue-900/10 animate-pulse" />
      )}
      {weather === 'Foggy' && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      )}
      {weather === 'Stormy' && (
        <div className="absolute inset-0 bg-black/20" />
      )}
    </div>
  );
};
