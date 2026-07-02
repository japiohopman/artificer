import { create } from 'zustand';
import { useInventoryStore } from './useInventoryStore';
import { useCharacterStore } from './useCharacterStore';

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
  popup?: { title: string };
  categoryId?: string;
}

export const CategoryIcons: Record<string, { icon: string, color: string }> = {
  city: { icon: 'city', color: '#D4AF37' },
  village: { icon: 'village', color: '#C0C0C0' },
  forest: { icon: 'forest', color: '#228B22' },
  wetlands: { icon: 'wetlands', color: '#1E90FF' },
  mountain: { icon: 'mountains', color: '#2F4F4F' },
  mountains: { icon: 'mountains', color: '#2F4F4F' },
  underdark: { icon: 'dungeon', color: '#4B0082' },
  dungeon: { icon: 'dungeon', color: '#8B0000' },
  castle: { icon: 'castle', color: '#A9A9A9' },
  fortresses_keeps: { icon: 'fortresses_keeps', color: '#A9A9A9' },
  landmark: { icon: 'landmark', color: '#4169E1' },
  poi: { icon: 'poi', color: '#4169E1' },
  points_of_interest: { icon: 'points_of_interest', color: '#4169E1' },
  ruins: { icon: 'ruins', color: '#8B4513' },
  waters: { icon: 'waters', color: '#1E90FF' },
  rivers: { icon: 'waters', color: '#1E90FF' },
  lakes: { icon: 'lake', color: '#1E90FF' },
  lake: { icon: 'lake', color: '#1E90FF' },
  seas_oceans: { icon: 'sea', color: '#1E90FF' },
  sea: { icon: 'sea', color: '#1E90FF' },
  bays: { icon: 'waters', color: '#1E90FF' },
  coasts: { icon: 'coast', color: '#1E90FF' },
  islands: { icon: 'islands', color: '#FFD700' },
  roads: { icon: 'roads', color: '#696969' },
  trails: { icon: 'trails', color: '#696969' },
  temples: { icon: 'temples', color: '#4169E1' },
  shrines: { icon: 'shrines', color: '#4169E1' },
  graveyard: { icon: 'graveyard', color: '#696969' },
  desert: { icon: 'desert', color: '#EDC9AF' },
  deserts: { icon: 'deserts', color: '#EDC9AF' },
  deserts_wastelands: { icon: 'deserts', color: '#EDC9AF' },
  grassland: { icon: 'grassland', color: '#7CFC00' },
  plains: { icon: 'plains', color: '#7CFC00' },
  plains_grasslands: { icon: 'plains', color: '#7CFC00' },
  arctic: { icon: 'arctic', color: '#F0FFFF' },
  glaciers_tundras: { icon: 'glaciers_tundras', color: '#F0FFFF' },
  oases: { icon: 'waters', color: '#1E90FF' },
  underdark: { icon: 'dungeon', color: '#4B0082' },
  sub_regions: { icon: 'landmark', color: '#D4AF37' },
  continents: { icon: 'landmark', color: '#D4AF37' }
};

export interface WorldState {
  // Temporal Progression
  gameYear: number;
  gameMonth: number;
  gameDay: number;
  gameTime: number; // minutes from midnight

  // Environmental Engine
  weather: WeatherType;
  currentRegion: string;
  mapZoom: number;
  isFastForwarding: boolean;

  // Location State
  currentLocation: SavedLocation | null;
  inspectedLocation: SavedLocation | null;
  currentSubLocation: any | null;
  currentShop: any | null;
  partyLocation: any | null;
  partySubLocation: any | null;
  travelOrigin: any | null;
  destination: any | null;
  isTraveling: boolean;
  travelProgress: number; // 0 to 1
  savedLocations: SavedLocation[];
  loadedCategories: string[];
  exploredAreas: { x: number, y: number, radius: number }[];

  // Global State / Faction Flags
  worldFlags: Record<string, any>;

  // Actions
  advanceTime: (minutes: number) => void;
  setWeather: (weather: WeatherType) => void;
  setRegion: (region: string) => void;
  setMapZoom: (zoom: number) => void;
  setIsFastForwarding: (isFastForwarding: boolean) => void;
  setPartyLocation: (location: any) => void;
  setPartySubLocation: (location: any) => void;
  setCurrentLocation: (location: SavedLocation) => void;
  setInspectedLocation: (location: SavedLocation | null) => void;
  setCurrentSubLocation: (location: any) => void;
  setCurrentShop: (shop: any) => void;
  setWorldFlag: (flag: string, value: any) => void;
  startTravel: (destination: any) => void;
  stopTravel: () => void;
  setSavedLocations: (locations: SavedLocation[]) => void;
  addSavedLocations: (locations: SavedLocation[]) => void;
  addLoadedCategory: (category: string) => void;
  isCategoryLoaded: (category: string) => boolean;
  exploreArea: (x: number, y: number, radius: number) => void;
  updateEnvironment: (minutesPassed?: number) => void;
  getCalendarDate: () => string;
  isNight: () => boolean;
  getActiveBackground: () => string;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  gameYear: 1492, // Year of the Three Ships Sailing
  gameMonth: 1,
  gameDay: 1,
  gameTime: 480, // 8:00 AM

  weather: 'Sunny',
  currentRegion: 'Sword Coast',
  mapZoom: 2,
  isFastForwarding: false,

  currentLocation: null,
  inspectedLocation: null,
  currentSubLocation: null,
  currentShop: null,
  partyLocation: {
    id: 'baldurs_gate',
    name: "Baldur's Gate",
    category: 'city',
    coordinates: { x: 955, y: 1592 }, // Initial starting position in proto units
    zoom: 0
  },
  partySubLocation: null,
  travelOrigin: null,
  destination: null,
  isTraveling: false,
  travelProgress: 0,
  savedLocations: [],
  loadedCategories: [],
  exploredAreas: [
    { x: 955, y: 1592, radius: 250 } // Initialize with Baldur's Gate
  ],

  worldFlags: {},

  startTravel: (destination) => set((state) => ({ 
    travelOrigin: state.partyLocation,
    destination, 
    isTraveling: true, 
    travelProgress: 0 
  })),

  stopTravel: () => set({ 
    isTraveling: false, 
    destination: null, 
    travelProgress: 0 
  }),

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
  setRegion: (currentRegion) => set({ currentRegion }),
  setMapZoom: (mapZoom) => set({ mapZoom }),
  setIsFastForwarding: (isFastForwarding) => set({ isFastForwarding }),
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
  addSavedLocations: (newLocations) => set((state) => {
    const existingIds = new Set(state.savedLocations.map(l => l.id));
    const uniqueNew = newLocations.filter(l => !existingIds.has(l.id));
    return {
      savedLocations: [...state.savedLocations, ...uniqueNew]
    };
  }),

  addLoadedCategory: (category) => set((state) => ({
    loadedCategories: [...state.loadedCategories, category]
  })),

  isCategoryLoaded: (category) => get().loadedCategories.includes(category),

  exploreArea: (x, y, radius) => set((state) => {
    // Check if we already have a point very close to this to avoid array bloating
    const isAlreadyExplored = state.exploredAreas.some(area => 
      Math.abs(area.x - x) < 20 && Math.abs(area.y - y) < 20 && area.radius >= radius
    );
    if (isAlreadyExplored) return state;

    return {
      exploredAreas: [...state.exploredAreas, { x, y, radius }]
    };
  }),

  updateEnvironment: (minutesPassed = 1) => {
    const state = get();
    
    // 1% chance per game hour to change weather (approx 0.016% per minute)
    if (Math.random() < (0.01 * (minutesPassed / 60))) {
      const weathers: WeatherType[] = ['Sunny', 'Rainy', 'Cloudy', 'Stormy', 'Snowy', 'Foggy'];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      set({ weather: newWeather });
    }

    // Handle Movement
    if (state.isTraveling && state.destination && state.travelOrigin) {
      // 1. Calculate distance in "Proto Units" (0 to 4763)
      const x1 = state.travelOrigin.coordinates?.x ?? state.travelOrigin.position?.[0] ?? 0;
      const y1 = state.travelOrigin.coordinates?.y ?? state.travelOrigin.position?.[1] ?? 0;
      const x2 = state.destination.coordinates?.x ?? state.destination.position?.[0] ?? 0;
      const y2 = state.destination.coordinates?.y ?? state.destination.position?.[1] ?? 0;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const totalDistProto = Math.sqrt(dx * dx + dy * dy);
      
      // 4000 miles width = 4763 proto units
      const PROTO_UNITS_PER_MILE = 4763 / 4000;
      const totalDistMiles = totalDistProto / PROTO_UNITS_PER_MILE;

      // 2. Calculate Speed (MPH)
      // Base speed: 3.0 mph (D&D Normal Pace)
      let currentSpeedMph = 3.0;

      // Dynamic Modifiers (Pulling from Inventory Store)
      try {
        const invState = useInventoryStore.getState();
        const { characters } = useCharacterStore.getState();
        
        // Calculate Weight Penalty
        const parseWeight = (weight: any): number => {
          if (!weight) return 0;
          if (typeof weight === 'number') return weight;
          const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
          return weightMatch ? parseFloat(weightMatch[0]) : 0;
        };

        const calculateItemWeight = (item: any): number => {
          if (!item) return 0;
          return parseWeight(item.weight) * (item.quantity || 1);
        };

        const sharedWeight = (invState.partyInventory || []).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
        const characterWeights = characters.reduce((acc: number, char: any) => {
          let personalWeight = 0;
          if (char.saveVersion === 2 && char.items) {
            personalWeight = Object.values(char.items).reduce((cAcc: number, item: any) => cAcc + calculateItemWeight(item), 0);
          } else {
            const equippedWeight = Object.values(char.inventory || {}).reduce((cAcc: number, item: any) => cAcc + calculateItemWeight(item), 0);
            const backpackWeight = (char.backpack || []).reduce((cAcc: number, item: any) => cAcc + calculateItemWeight(item), 0);
            personalWeight = equippedWeight + backpackWeight;
          }
          const money = char.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
          const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.ep || 0) + (money.gp || 0) + (money.pp || 0);
          const moneyWeight = totalCoins * (invState.partyStats?.currencyWeightPerCoin || 0.02);
          return acc + personalWeight + moneyWeight;
        }, 0);

        const totalWeight = sharedWeight + characterWeights;
        const memberCount = Math.max(invState.partyStats?.memberCount || 0, characters.length, 1);
        const vehicleBonusCapacity = (invState.partyVehicles || []).reduce((acc: number, v: any) => acc + (v.capacity || 0), 0);
        const totalCapacity = (memberCount * (invState.partyStats?.baseCapacityPerMember || 150)) + (invState.partyStats?.vehicleCapacityBonus || 0) + vehicleBonusCapacity;

        // Weight Penalty: Overburdened reduces speed by 50%
        if (totalWeight > totalCapacity) {
          currentSpeedMph *= 0.5;
        }

        // Vehicle Speed Bonus: If we have at least one horse/vehicle, increase base speed
        // D&D Riding Horse speed is approx 2x human
        if (invState.partyVehicles && invState.partyVehicles.length > 0) {
          currentSpeedMph *= 1.5; // +50% speed for having mounts/carts
        }
      } catch (err) {
        console.warn("Failed to calculate travel modifiers, using base speed", err);
      }

      // 3. Calculate Progress
      // Miles traveled in this step
      const milesTraveledThisStep = (currentSpeedMph / 60) * minutesPassed;
      const protoTraveledThisStep = milesTraveledThisStep * PROTO_UNITS_PER_MILE;
      
      // Update progress
      const currentDistProto = state.travelProgress * totalDistProto;
      const nextDistProto = currentDistProto + protoTraveledThisStep;
      const newProgress = Math.min(1, nextDistProto / totalDistProto);

      if (newProgress >= 1) {
        set({ 
          partyLocation: state.destination,
          isTraveling: false,
          destination: null,
          travelOrigin: null,
          travelProgress: 0
        });
      } else {
        const currentX = x1 + (x2 - x1) * newProgress;
        const currentY = y1 + (y2 - y1) * newProgress;

        set({ 
          travelProgress: newProgress,
          partyLocation: {
            ...state.partyLocation,
            coordinates: { x: currentX, y: currentY }
          }
        });

        // Trigger discovery during travel
        state.exploreArea(currentX, currentY, 200);
      }
    }
  },

  getCalendarDate: () => {
    const state = get();
    const months = [
      'Hammer', 'Alturiak', 'Ches', 'Tarsakh', 'Mirtul', 'Kythorn',
      'Flamerule', 'Eleasis', 'Eleint', 'Marpenoth', 'Uktar', 'Nightal'
    ];
    const month = months[state.gameMonth - 1] || 'Hammer';

    // Day suffix
    let suffix = 'th';
    const day = state.gameDay;
    if (day === 1 || day === 21) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return `${day}${suffix} of ${month}, ${state.gameYear} DR`;
  },

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
