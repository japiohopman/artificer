import React from 'react';
import { useWorldStore, WeatherType } from '../../store/useWorldStore';
import { TimeOfDay } from '../../domain/environment/environmentTypes';
import { GameIcon } from '../../game_icons';
import { useShallow } from 'zustand/react/shallow';

export const WorldEnvironmentHeader: React.FC = () => {
  // Subscribe to primitive state fields using useShallow to maintain referential stability
  // and prevent infinite render loops while avoiding double store calls or duplicate logic.
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

  const { time, weather, temperature, locations } = snapshot;
  const physicalLoc = locations.physical;

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
    <div className="bg-parchment-200/80 border-2 border-dragon-gold/40 rounded-lg p-3 shadow-inner space-y-2">
      {/* Physical Environment Context Header */}
      <div className="flex items-center justify-between border-b border-dragon-gold/30 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GameIcon name="compass" size={14} className="text-dragon-red shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-black uppercase text-dragon-red/60 tracking-widest leading-none">
              Physical Location
            </span>
            <span className="text-xs font-bold text-dragon-darkRed truncate leading-tight">
              {physicalLoc?.name || 'Wilderness'}
            </span>
          </div>
        </div>
        {physicalLoc?.region && (
          <span className="text-[9px] font-bold text-dragon-red/70 uppercase tracking-tight bg-dragon-gold/10 px-1.5 py-0.5 rounded border border-dragon-gold/20 shrink-0">
            {physicalLoc.region}
          </span>
        )}
      </div>

      {/* Grid of Temporal & Environmental Metrics */}
      <div className="grid grid-cols-2 gap-2 text-stone-800">
        {/* Time */}
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded border border-dragon-gold/20">
          <img
            src={getTimeIconUrl(time.timeOfDay, time.hours)}
            alt="Time of Day"
            className="w-5 h-5 opacity-90 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-black uppercase text-dragon-darkRed/50 tracking-wider">Time</span>
            <span className="text-sm font-mono text-dragon-darkRed font-black tabular-nums leading-none">
              {time.formattedTime}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded border border-dragon-gold/20">
          <GameIcon name="scroll" size={16} className="text-dragon-red/70 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-black uppercase text-dragon-darkRed/50 tracking-wider">Calendar</span>
            <span className="text-[10px] font-header font-bold text-dragon-red truncate leading-tight">
              {time.calendarDate}
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded border border-dragon-gold/20">
          <img
            src={getTempIconUrl(temperature.celsius)}
            alt="Temperature"
            className="w-5 h-5 opacity-80 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-black uppercase text-dragon-darkRed/50 tracking-wider">Temp</span>
            <span className="text-xs font-black text-dragon-darkRed/90 tabular-nums leading-none">
              {temperature.celsius}°C
            </span>
          </div>
        </div>

        {/* Weather */}
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded border border-dragon-gold/20">
          <img
            src={getWeatherIconUrl(weather.current)}
            alt={weather.current}
            className="w-5 h-5 opacity-80 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-black uppercase text-dragon-darkRed/50 tracking-wider">Weather</span>
            <span className="text-[10px] font-bold text-dragon-darkRed/90 uppercase truncate leading-none">
              {weather.current}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
