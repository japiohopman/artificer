import React from 'react';
import { useWorldStore, WeatherType } from '../../store/useWorldStore';
import { GameIcon, GameIconName } from '../../game_icons';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TemporalWidget: React.FC = () => {
  const { 
    gameTime, 
    gameDay, 
    gameMonth, 
    gameYear, 
    weather,
    getCalendarDate,
    isNight
  } = useWorldStore();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getWeatherIconUrl = (type: WeatherType): string => {
    let slug = 'clear-day';
    switch (type) {
      case 'Sunny': slug = 'clear-day'; break;
      case 'Rainy': slug = 'rain'; break;
      case 'Cloudy': slug = 'cloudy'; break; 
      case 'Stormy': slug = 'thunderstorms'; break;
      case 'Snowy': slug = 'snow'; break;
      case 'Foggy': slug = 'fog'; break;
    }
    return `https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${slug}.svg`;
  };

  return (
    <div className="flex items-center gap-4 bg-parchment-200/50 px-4 py-2 rounded-lg border-2 border-dragon-gold/30 shadow-inner group transition-all hover:bg-parchment-200/80">
      {/* Time Display */}
      <div className="flex flex-col items-center border-r border-dragon-gold/20 pr-4">
        <span className="text-[8px] font-black text-dragon-darkRed/40 uppercase tracking-[0.2em] mb-0.5">Time</span>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isNight() ? 180 : 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <img 
              src={`https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${isNight() ? 'clear-night' : 'clear-day'}.svg`} 
              alt={isNight() ? "Night" : "Day"} 
              className="w-5 h-5 opacity-90 drop-shadow-sm" 
            />
          </motion.div>
          <span className="text-lg font-mono text-dragon-darkRed tracking-[0.1em] font-black tabular-nums">
            {formatTime(gameTime)}
          </span>
        </div>
      </div>

      {/* Date Display */}
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-dragon-darkRed/40 uppercase tracking-[0.2em] mb-0.5">Calendar</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-header font-bold text-dragon-red uppercase tracking-wider">
            {getCalendarDate()}
          </span>
        </div>
      </div>

      {/* Weather Indicator */}
      <div className="flex flex-col items-center border-l border-dragon-gold/20 pl-4">
        <span className="text-[8px] font-black text-dragon-darkRed/40 uppercase tracking-[0.2em] mb-0.5">Weather</span>
        <div className="flex items-center gap-1">
          <img src={getWeatherIconUrl(weather)} alt={weather} className="w-5 h-5 opacity-80" />
          <span className="text-[10px] font-bold text-dragon-darkRed/80 uppercase">{weather}</span>
        </div>
      </div>
    </div>
  );
};
