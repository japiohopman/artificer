import { create } from 'zustand';

export type WeatherType = 'Sunny' | 'Rainy' | 'Cloudy' | 'Stormy' | 'Snowy' | 'Foggy';

export interface SavedLocation {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string | null;
  region?: string;
  coordinates?: { x?: number; y?: number; lat?: number; lng?: number };
  overlayMapUrl?: string;
  subLocations?: any[];
}

export const CategoryIcons: Record<string, { icon: string, color: string }> = {
  city: { icon: 'city', color: '#D4AF37' },
  village: { icon: 'village', color: '#D4AF37' },
  forest: { icon: 'forest', color: '#228B22' },
  wetlands: { icon: 'waters', color: '#4682B4' },
  mountain: { icon: 'mountains', color: '#A9A9A9' },
  underdark: { icon: 'death', color: '#4B0082' }
};

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
  currentLocation: SavedLocation | null;
  inspectedLocation: SavedLocation | null;
  currentSubLocation: any | null;
  currentShop: any | null;
  partyLocation: any | null;
  partySubLocation: any | null;
  savedLocations: SavedLocation[];

  // Global State / Faction Flags
  worldFlags: Record<string, any>;

  // Actions
  advanceTime: (minutes: number) => void;
  setWeather: (weather: WeatherType) => void;
  setRegion: (region: string) => void;
  setPartyLocation: (location: any) => void;
  setPartySubLocation: (location: any) => void;
  setCurrentLocation: (location: SavedLocation) => void;
  setInspectedLocation: (location: SavedLocation | null) => void;
  setCurrentSubLocation: (location: any) => void;
  setCurrentShop: (shop: any) => void;
  setWorldFlag: (flag: string, value: any) => void;
  setSavedLocations: (locations: SavedLocation[]) => void;
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
  inspectedLocation: null,
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
  setInspectedLocation: (inspectedLocation) => set({ inspectedLocation }),
  setCurrentSubLocation: (currentSubLocation) => set({ currentSubLocation }),
  setCurrentShop: (currentShop) => set({ currentShop }),
  setWorldFlag: (flag, value) => set((state) => ({
    worldFlags: { ...state.worldFlags, [flag]: value }
  })),
  setSavedLocations: (savedLocations) => set({ savedLocations }),

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
