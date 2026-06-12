import { create } from 'zustand';

export type WeatherType = 'Sunny' | 'Rainy' | 'Cloudy' | 'Stormy' | 'Snowy' | 'Foggy';

export interface WorldState {
  // Temporal Progression
  gameYear: number;
  gameMonth: number;
  gameDay: number;
  gameTime: number; // minutes from midnight

  // Environmental Engine
  weather: WeatherType;
  region: string;

  // Location State
  currentLocation: any | null;
  currentSubLocation: any | null;
  currentShop: any | null;
  partyLocation: any | null;
  partySubLocation: any | null;
  savedLocations: any[];

  // Global State / Faction Flags
  worldFlags: Record<string, any>;

  // Actions
  advanceTime: (minutes: number) => void;
  setWeather: (weather: WeatherType) => void;
  setRegion: (region: string) => void;
  setPartyLocation: (location: any) => void;
  setPartySubLocation: (location: any) => void;
  setCurrentLocation: (location: any) => void;
  setCurrentSubLocation: (location: any) => void;
  setCurrentShop: (shop: any) => void;
  setWorldFlag: (flag: string, value: any) => void;
  isNight: () => boolean;
  getActiveBackground: () => string;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  gameYear: 1492, // Year of the Three Ships Sailing
  gameMonth: 1,
  gameDay: 1,
  gameTime: 480, // 8:00 AM

  weather: 'Sunny',
  region: 'Sword Coast',

  currentLocation: null,
  currentSubLocation: null,
  currentShop: null,
  partyLocation: null,
  partySubLocation: null,
  savedLocations: [],

  worldFlags: {},

  advanceTime: (minutes) => set((state) => {
    let newTime = state.gameTime + minutes;
    let newDay = state.gameDay;
    let newMonth = state.gameMonth;
    let newYear = state.gameYear;

    if (newTime >= 1440) {
      const daysPassed = Math.floor(newTime / 1440);
      newDay += daysPassed;
      newTime %= 1440;

      // Simple calendar logic (30 days per month)
      if (newDay > 30) {
        const monthsPassed = Math.floor((newDay - 1) / 30);
        newMonth += monthsPassed;
        newDay = ((newDay - 1) % 30) + 1;

        if (newMonth > 12) {
          const yearsPassed = Math.floor((newMonth - 1) / 12);
          newYear += yearsPassed;
          newMonth = ((newMonth - 1) % 12) + 1;
        }
      }
    }

    return {
      gameTime: newTime,
      gameDay: newDay,
      gameMonth: newMonth,
      gameYear: newYear
    };
  }),

  setWeather: (weather) => set({ weather }),
  setRegion: (region) => set({ region }),
  setPartyLocation: (partyLocation) => set({ partyLocation }),
  setPartySubLocation: (partySubLocation) => set({ partySubLocation }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setCurrentSubLocation: (currentSubLocation) => set({ currentSubLocation }),
  setCurrentShop: (currentShop) => set({ currentShop }),
  setWorldFlag: (flag, value) => set((state) => ({
    worldFlags: { ...state.worldFlags, [flag]: value }
  })),

  isNight: () => {
    const time = get().gameTime;
    return time < 360 || time > 1200; // Night between 8 PM and 6 AM
  },

  getActiveBackground: () => {
    const state = get();
    if (state.currentShop?.image) return state.currentShop.image;
    if (state.currentSubLocation?.image) return state.currentSubLocation.image;
    if (state.currentLocation?.image) return state.currentLocation.image;
    return '';
  },
}));
