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
      {/* Fast Forward Indicator */}
      {isFastForwarding && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-dragon-red/80 backdrop-blur-md border-2 border-dragon-gold rounded-full shadow-2xl animate-pulse">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
              <div className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" />
              <div className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_400ms]" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Temporal_Acceleration_Active</span>
          </div>
          <div className="text-[8px] font-bold text-dragon-gold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
            50x Time Compression
          </div>
        </div>
      )}

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
