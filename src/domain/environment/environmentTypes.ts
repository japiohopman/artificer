import type { WeatherType, SavedLocation } from '../../store/useWorldStore';

export interface LocationSummary {
  id: string;
  name: string;
  category: string;
  region: string;
  terrain: string;
  isUnderground: boolean;
  coordinates: { x?: number; y?: number; lat?: number; lng?: number } | null;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeContext {
  gameYear: number;
  gameMonth: number;
  gameDay: number;
  gameTime: number; // minutes from midnight
  hours: number;
  minutes: number;
  formattedTime: string;
  calendarDate: string;
  isNight: boolean;
  timeOfDay: TimeOfDay;
}

export interface WeatherContext {
  current: WeatherType;
  visibility: 'clear' | 'moderate' | 'low' | 'near_zero';
  precipitation: 'none' | 'light' | 'moderate' | 'heavy' | 'severe';
  lightingModifier: number; // 0.0 (full darkness penalty/dimming) to 1.0 (clear bright day)
  isExtreme: boolean;
}

export interface TemperatureContext {
  celsius: number;
  fahrenheit: number;
  category: 'freezing' | 'cold' | 'temperate' | 'warm' | 'hot' | 'extreme_heat';
  baseTemp: number;
  seasonOffset: number;
  timeOffset: number;
  weatherOffset: number;
}

export interface EnvironmentForecast {
  trend: 'warming' | 'cooling' | 'stable';
  weatherStability: 'stable' | 'unsettled' | 'changing';
  nextTimeOfDayChangeMinutes: number;
}

export interface LocationEnvironmentContext {
  /** Physical location of the party (authoritative physical context) */
  physical: LocationSummary | null;
  /** Location currently displayed in presentation/submap view */
  presentation: LocationSummary | null;
  /** Location currently being inspected by user in UI/atlas */
  inspected: LocationSummary | null;
}

export interface WorldEnvironmentSnapshot {
  timestamp: string;
  time: TimeContext;
  locations: LocationEnvironmentContext;
  weather: WeatherContext;
  temperature: TemperatureContext;
  forecast: EnvironmentForecast;
  isTraveling: boolean;
  travelProgress: number;
  currentRegion: string;
  mapZoom: number;
  isFastForwarding: boolean;
}
