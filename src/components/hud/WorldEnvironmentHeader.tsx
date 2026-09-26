import React from 'react';
import { useWorldStore, WeatherType, SavedLocation } from '../../store/useWorldStore';
import { TimeOfDay } from '../../domain/environment/environmentTypes';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { useShallow } from 'zustand/react/shallow';

interface WorldEnvironmentHeaderProps {
  displayLocation: SavedLocation | null;
  isTravelExpanded: boolean;
  onToggleTravel: () => void;
  onClose: () => void;
}

export const WorldEnvironmentHeader: React.FC<WorldEnvironmentHeaderProps> = ({
  displayLocation,
  isTravelExpanded,
  onToggleTravel,
  onClose,
}) => {
  // Subscribe to primitive store fields with referential stability via useShallow
  const state = useWorldStore(
    useShallow((s) => ({
      gameYear: s.gameYear,
      gameMonth: s.gameMonth,
      gameDay: s.gameDay,
      gameTime: s.gameTime,
      weather: s.weather,
      temperature: s.temperature,
      partyLocation: s.partyLocation,
      currentLocation: s.currentLocation,
      inspectedLocation: s.inspectedLocation,
      currentRegion: s.currentRegion,
      isTraveling: s.isTraveling,
      travelProgress: s.travelProgress,
      mapZoom: s.mapZoom,
      isFastForwarding: s.isFastForwarding,
      getEnvironmentSnapshot: s.getEnvironmentSnapshot,
    }))
  );

  const snapshot = state.getEnvironmentSnapshot();
  const { time, weather, temperature } = snapshot;

  const isNight = time.isNight;

  const getWeatherIconUrl = (type: WeatherType): string => {
    let slug = 'clear-day';
    switch (type) {
      case 'Sunny': slug = 'clear-day'; break;
      case 'Rainy': slug = 'rain'; break;
      case 'Cloudy': slug = 'cloudy'; break;
      case 'Stormy': slug = 'thunderstorms'; break;
      case 'Snowy': slug = 'snow'; break;
      case 'Foggy': slug = 'fog'; break;
      case 'Blizzard': slug = 'snow-showers-snow'; break;
      case 'Heatwave': slug = 'extreme-day-heat'; break;
      case 'Hail': slug = 'hail'; break;
      case 'Eerie': slug = 'wind-sleet'; break;
      case 'Mystic': slug = 'star'; break;
    }
    return `https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${slug}.svg`;
  };

  const getTimeIconUrl = (timeOfDay: TimeOfDay, hours: number) => {
    let icon = 'clear-day';
    if (timeOfDay === 'dawn' || (hours >= 5 && hours < 8)) icon = 'sunrise';
    else if (timeOfDay === 'dusk' || (hours >= 17 && hours < 20)) icon = 'sunset';
    else if (timeOfDay === 'night' || hours < 5 || hours >= 20) icon = 'clear-night';
    else icon = 'clear-day';

    return `https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${icon}.svg`;
  };

  const getTempIconUrl = (temp: number) => {
    let icon = 'thermometer-celsius';
    if (temp <= 0) icon = 'thermometer-snowflake';
    else if (temp > 30) icon = 'thermometer-sun';
    return `https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${icon}.svg`;
  };

  return (
    <div className="relative p-4 border-b-2 border-dragon-red flex flex-col justify-between shadow-md overflow-hidden shrink-0 text-white min-h-[160px]">
      {/* Background Banner Image Layer */}
      {(displayLocation?.image || displayLocation?.banner) ? (
        <div
          className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url(${displayLocation?.image || displayLocation?.banner})`,
            backgroundPosition: isNight ? 'bottom center' : 'top center'
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-parchment-900/90" />
      )}

      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 z-10 pointer-events-none" />

      {/* Top Right Control Buttons */}
      <div className="absolute top-3 right-3 flex gap-1.5 z-30">
        <button
          onClick={onToggleTravel}
          className={cn(
            "p-1.5 rounded-full transition-all active:scale-95 group",
            isTravelExpanded ? "bg-dragon-red/30 text-white" : "hover:bg-white/20 text-white/70"
          )}
          title={isTravelExpanded ? "Minimize Travel" : "Expand Travel"}
          aria-label={isTravelExpanded ? "Minimize Travel" : "Expand Travel"}
        >
          <GameIcon name="compass" size={18} color="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-full transition-all active:scale-95 group"
          title="Close World Panel"
          aria-label="Close World Panel"
        >
          <GameIcon name="chevron_left" size={20} color="#FFFFFF" className="group-hover:-translate-x-1 transition-transform drop-shadow-md" />
        </button>
      </div>

      {/* Content Stack */}
      <div className="relative z-20 flex flex-col h-full justify-between pt-1">
        {/* 1. TOP: Time / Temp / Weather in 3 equal columns */}
        <div className="grid grid-cols-3 gap-2 items-center text-center border-b border-white/15 pb-2.5 mb-2">
          {/* Column 1: Time */}
          <div className="flex flex-col items-center">
            <img
              src={getTimeIconUrl(time.timeOfDay, time.hours)}
              alt="Time Icon"
              className="w-8 h-8 opacity-95 drop-shadow-md mb-0.5"
            />
            <span className="text-[8px] font-black uppercase text-dragon-gold tracking-widest leading-none mb-0.5">
              Time
            </span>
            <span className="text-xs font-mono font-black text-white tracking-wider tabular-nums leading-none">
              {time.formattedTime}
            </span>
          </div>

          {/* Column 2: Temperature */}
          <div className="flex flex-col items-center border-x border-white/15 px-1">
            <img
              src={getTempIconUrl(temperature.celsius)}
              alt="Temp Icon"
              className="w-8 h-8 opacity-90 drop-shadow-md mb-0.5"
            />
            <span className="text-[8px] font-black uppercase text-dragon-gold tracking-widest leading-none mb-0.5">
              Temp
            </span>
            <span className="text-xs font-mono font-black text-white tracking-wider tabular-nums leading-none">
              {temperature.celsius}°C
            </span>
          </div>

          {/* Column 3: Weather */}
          <div className="flex flex-col items-center">
            <img
              src={getWeatherIconUrl(weather.current)}
              alt={weather.current}
              className="w-8 h-8 opacity-90 drop-shadow-md mb-0.5"
            />
            <span className="text-[8px] font-black uppercase text-dragon-gold tracking-widest leading-none mb-0.5">
              Weather
            </span>
            <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[80px] leading-none">
              {weather.current}
            </span>
          </div>
        </div>

        {/* 2. MIDDLE: Calendar / Date Row */}
        <div className="text-center mb-2.5">
          <span className="text-[10px] font-header font-bold text-amber-300 uppercase tracking-widest drop-shadow-sm">
            {time.calendarDate}
          </span>
        </div>

        {/* 3. BOTTOM: Presentation Location Context (displayLocation) */}
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-dragon-gold uppercase tracking-[0.3em] leading-none mb-1 drop-shadow-md">
            {displayLocation ? displayLocation.category || 'Location' : 'Cartographic'}
          </span>
          <h2 className="text-xl md:text-2xl font-header text-white uppercase tracking-widest leading-none drop-shadow-lg truncate">
            {displayLocation ? displayLocation.name : 'World Atlas'}
          </h2>
        </div>
      </div>
    </div>
  );
};
