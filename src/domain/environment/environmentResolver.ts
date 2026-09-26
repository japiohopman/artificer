import type { WeatherType, WorldState } from '../../store/useWorldStore';
import type {
  LocationSummary,
  TimeContext,
  TimeOfDay,
  WeatherContext,
  TemperatureContext,
  EnvironmentForecast,
  WorldEnvironmentSnapshot,
} from './environmentTypes';

const MONTH_NAMES = [
  'Hammer', 'Alturiak', 'Ches', 'Tarsakh', 'Mirtul', 'Kythorn',
  'Flamerule', 'Eleasis', 'Eleint', 'Marpenoth', 'Uktar', 'Nightal'
];

/**
 * Extracts a clean, normalized LocationSummary from a raw location object or record.
 */
export function resolveLocationSummary(location: any, defaultRegion = 'Sword Coast'): LocationSummary | null {
  if (!location) return null;

  const id = location.id || 'unknown';
  const name = location.name || location.title || 'Unknown Location';
  const category = (location.category || location.type || 'landmark').toLowerCase();
  const region = location.region || defaultRegion;
  const terrain = category;
  const isUnderground = category === 'underdark' || category === 'dungeon';

  let coordinates: { x?: number; y?: number; lat?: number; lng?: number } | null = null;
  if (location.coordinates) {
    coordinates = { ...location.coordinates };
  } else if (Array.isArray(location.position)) {
    coordinates = { x: location.position[0], y: location.position[1] };
  }

  return {
    id,
    name,
    category,
    region,
    terrain,
    isUnderground,
    coordinates,
  };
}

/**
 * Pure calculation of TimeContext from calendar fields.
 */
export function resolveTimeContext(
  gameYear: number,
  gameMonth: number,
  gameDay: number,
  gameTime: number
): TimeContext {
  const hours = Math.floor(gameTime / 60) % 24;
  const minutes = gameTime % 60;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const monthName = MONTH_NAMES[Math.max(0, Math.min(11, gameMonth - 1))] || 'Hammer';
  let suffix = 'th';
  if (gameDay === 1 || gameDay === 21) suffix = 'st';
  else if (gameDay === 2 || gameDay === 22) suffix = 'nd';
  else if (gameDay === 3 || gameDay === 23) suffix = 'rd';

  const calendarDate = `${gameDay}${suffix} of ${monthName}, ${gameYear} DR`;
  const isNight = gameTime < 360 || gameTime > 1200; // Night between 8 PM (1200m) and 6 AM (360m)

  let timeOfDay: TimeOfDay = 'day';
  if (hours >= 5 && hours < 7) {
    timeOfDay = 'dawn';
  } else if (hours >= 7 && hours < 18) {
    timeOfDay = 'day';
  } else if (hours >= 18 && hours < 20) {
    timeOfDay = 'dusk';
  } else {
    timeOfDay = 'night';
  }

  return {
    gameYear,
    gameMonth,
    gameDay,
    gameTime,
    hours,
    minutes,
    formattedTime,
    calendarDate,
    isNight,
    timeOfDay,
  };
}

/**
 * Pure mapping of WeatherType to rich WeatherContext.
 */
export function resolveWeatherContext(weather: WeatherType): WeatherContext {
  switch (weather) {
    case 'Sunny':
      return { current: 'Sunny', visibility: 'clear', precipitation: 'none', lightingModifier: 1.0, isExtreme: false };
    case 'Cloudy':
      return { current: 'Cloudy', visibility: 'clear', precipitation: 'none', lightingModifier: 0.85, isExtreme: false };
    case 'Rainy':
      return { current: 'Rainy', visibility: 'moderate', precipitation: 'moderate', lightingModifier: 0.7, isExtreme: false };
    case 'Stormy':
      return { current: 'Stormy', visibility: 'low', precipitation: 'heavy', lightingModifier: 0.4, isExtreme: true };
    case 'Snowy':
      return { current: 'Snowy', visibility: 'moderate', precipitation: 'light', lightingModifier: 0.75, isExtreme: false };
    case 'Foggy':
      return { current: 'Foggy', visibility: 'low', precipitation: 'none', lightingModifier: 0.6, isExtreme: false };
    case 'Blizzard':
      return { current: 'Blizzard', visibility: 'near_zero', precipitation: 'severe', lightingModifier: 0.2, isExtreme: true };
    case 'Heatwave':
      return { current: 'Heatwave', visibility: 'clear', precipitation: 'none', lightingModifier: 1.0, isExtreme: true };
    case 'Hail':
      return { current: 'Hail', visibility: 'low', precipitation: 'heavy', lightingModifier: 0.5, isExtreme: true };
    case 'Eerie':
      return { current: 'Eerie', visibility: 'moderate', precipitation: 'none', lightingModifier: 0.5, isExtreme: false };
    case 'Mystic':
      return { current: 'Mystic', visibility: 'clear', precipitation: 'none', lightingModifier: 0.9, isExtreme: false };
    default:
      return { current: 'Sunny', visibility: 'clear', precipitation: 'none', lightingModifier: 1.0, isExtreme: false };
  }
}

/**
 * Pure temperature evaluation based on terrain, season, time of day, and weather.
 */
export function resolveTemperatureContext(
  terrain: string,
  gameMonth: number,
  gameTime: number,
  weather: WeatherType
): TemperatureContext {
  const normTerrain = terrain.toLowerCase();
  let baseTemp = 15; // baseline temperate land
  let isUnderground = false;

  if (normTerrain === 'arctic' || normTerrain === 'glaciers_tundras') {
    baseTemp = -8;
  } else if (normTerrain === 'desert' || normTerrain === 'deserts' || normTerrain === 'deserts_wastelands') {
    baseTemp = 35;
  } else if (normTerrain === 'underdark' || normTerrain === 'dungeon') {
    baseTemp = 12;
    isUnderground = true;
  }

  let seasonOffset = 0;
  let timeOffset = 0;
  let weatherOffset = 0;

  if (!isUnderground) {
    // 1. Season offset
    if (gameMonth === 12 || gameMonth === 1 || gameMonth === 2) {
      seasonOffset = -10;
    } else if (gameMonth === 6 || gameMonth === 7 || gameMonth === 8) {
      seasonOffset = 8;
    } else if (gameMonth === 9 || gameMonth === 10 || gameMonth === 11) {
      seasonOffset = -2;
    } // Spring = 0

    // 2. Diurnal cycle
    const hours = gameTime / 60;
    const timeFactor = Math.sin((hours - 10) * Math.PI / 12); // -1 to 1
    const dailySwing = normTerrain.includes('desert') ? 12 : 6;
    timeOffset = timeFactor * dailySwing;

    // 3. Weather impact
    if (weather === 'Rainy') weatherOffset = -3;
    else if (weather === 'Stormy') weatherOffset = -5;
    else if (weather === 'Snowy') weatherOffset = -8;
    else if (weather === 'Cloudy') weatherOffset = -2;
    else if (weather === 'Foggy') weatherOffset = -4;
    else if (weather === 'Blizzard') weatherOffset = -15;
    else if (weather === 'Heatwave') weatherOffset = 10;
    else if (weather === 'Hail') weatherOffset = -6;
  }

  const celsius = Math.round((baseTemp + seasonOffset + timeOffset + weatherOffset) * 10) / 10;
  const fahrenheit = Math.round(((celsius * 9) / 5 + 32) * 10) / 10;

  let category: TemperatureContext['category'] = 'temperate';
  if (celsius <= 0) category = 'freezing';
  else if (celsius <= 10) category = 'cold';
  else if (celsius <= 22) category = 'temperate';
  else if (celsius <= 30) category = 'warm';
  else if (celsius <= 40) category = 'hot';
  else category = 'extreme_heat';

  return {
    celsius,
    fahrenheit,
    category,
    baseTemp,
    seasonOffset,
    timeOffset: Math.round(timeOffset * 10) / 10,
    weatherOffset,
  };
}

/**
 * Pure forecast derivation based on current state.
 */
export function resolveForecast(
  gameTime: number,
  gameMonth: number,
  weather: WeatherType
): EnvironmentForecast {
  const hours = gameTime / 60;
  // Coolest at 4 AM, warmest at 4 PM (16:00)
  const trend: EnvironmentForecast['trend'] = (hours >= 4 && hours < 16) ? 'warming' : 'cooling';

  const weatherContext = resolveWeatherContext(weather);
  let weatherStability: EnvironmentForecast['weatherStability'] = 'stable';
  if (weatherContext.isExtreme) {
    weatherStability = 'unsettled';
  } else if (weather === 'Cloudy' || weather === 'Foggy') {
    weatherStability = 'changing';
  }

  // Next time of day boundary
  let targetMinutes = 300; // Next 5:00 AM Dawn
  if (gameTime < 300) {
    targetMinutes = 300;
  } else if (gameTime < 420) {
    targetMinutes = 420; // 7:00 AM Day
  } else if (gameTime < 1080) {
    targetMinutes = 1080; // 6:00 PM Dusk
  } else if (gameTime < 1200) {
    targetMinutes = 1200; // 8:00 PM Night
  } else {
    targetMinutes = 1440 + 300; // Tomorrow 5:00 AM Dawn
  }

  const nextTimeOfDayChangeMinutes = targetMinutes - gameTime;

  return {
    trend,
    weatherStability,
    nextTimeOfDayChangeMinutes,
  };
}

/**
 * Seeded PRNG helper to resolve deterministic weather for a 6-hour block.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const WEATHERS_BY_TERRAIN: Record<string, WeatherType[]> = {
  arctic: ['Snowy', 'Blizzard', 'Cloudy', 'Sunny', 'Foggy', 'Hail'],
  desert: ['Sunny', 'Heatwave', 'Cloudy', 'Eerie'],
  underdark: ['Eerie', 'Mystic', 'Foggy'],
  dungeon: ['Eerie', 'Mystic', 'Foggy'],
  default: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Snowy', 'Eerie', 'Mystic', 'Hail'],
};

export function getWeatherForTimeBlock(
  gameYear: number,
  gameMonth: number,
  gameDay: number,
  gameTime: number,
  region = 'Sword Coast',
  terrain = 'landmark'
): WeatherType {
  const blockIndex = Math.floor(gameTime / 360); // 4 blocks per day (6h each)
  const seed = gameYear * 10000 + gameMonth * 500 + gameDay * 10 + blockIndex;

  const normTerrain = terrain.toLowerCase();
  const pool = WEATHERS_BY_TERRAIN[normTerrain] || WEATHERS_BY_TERRAIN.default;

  const rnd = seededRandom(seed);
  const index = Math.floor(rnd * pool.length);
  return pool[index] || 'Sunny';
}

/**
 * Assembles a complete, immutable WorldEnvironmentSnapshot from WorldState.
 */
export function resolveWorldEnvironmentSnapshot(
  state: Pick<
    WorldState,
    | 'gameYear'
    | 'gameMonth'
    | 'gameDay'
    | 'gameTime'
    | 'weather'
    | 'temperature'
    | 'partyLocation'
    | 'currentLocation'
    | 'inspectedLocation'
    | 'currentRegion'
    | 'isTraveling'
    | 'travelProgress'
    | 'mapZoom'
    | 'isFastForwarding'
  >
): WorldEnvironmentSnapshot {
  const physicalLoc = resolveLocationSummary(state.partyLocation, state.currentRegion);
  const presentationLoc = resolveLocationSummary(state.currentLocation, state.currentRegion);
  const inspectedLoc = resolveLocationSummary(state.inspectedLocation, state.currentRegion);

  const activeTerrain = physicalLoc?.terrain || 'landmark';

  const time = resolveTimeContext(
    state.gameYear,
    state.gameMonth,
    state.gameDay,
    state.gameTime
  );

  const weather = resolveWeatherContext(state.weather);
  const temperature = resolveTemperatureContext(
    activeTerrain,
    state.gameMonth,
    state.gameTime,
    state.weather
  );
  const forecast = resolveForecast(state.gameTime, state.gameMonth, state.weather);

  return {
    timestamp: new Date().toISOString(),
    time,
    locations: {
      physical: physicalLoc,
      presentation: presentationLoc,
      inspected: inspectedLoc,
    },
    weather,
    temperature,
    forecast,
    isTraveling: state.isTraveling ?? false,
    travelProgress: state.travelProgress ?? 0,
    currentRegion: state.currentRegion || 'Sword Coast',
    mapZoom: state.mapZoom ?? 2,
    isFastForwarding: state.isFastForwarding ?? false,
  };
}
