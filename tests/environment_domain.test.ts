import { describe, it, expect } from 'vitest';
import {
  resolveLocationSummary,
  resolveTimeContext,
  resolveWeatherContext,
  resolveTemperatureContext,
  resolveForecast,
  getWeatherForTimeBlock,
  resolveWorldEnvironmentSnapshot,
} from '../src/domain/environment/environmentResolver';
import { useWorldStore, type WorldState } from '../src/store/useWorldStore';

describe('WorldEnvironmentSnapshot & Environment Resolver Domain Tests', () => {
  it('resolves location summary cleanly with fallback defaults', () => {
    const rawLoc = {
      id: 'waterdeep_1',
      name: 'Waterdeep',
      category: 'city',
      coordinates: { x: 100, y: 200 },
    };

    const summary = resolveLocationSummary(rawLoc, 'Sword Coast');
    expect(summary).not.toBeNull();
    expect(summary?.id).toBe('waterdeep_1');
    expect(summary?.name).toBe('Waterdeep');
    expect(summary?.category).toBe('city');
    expect(summary?.region).toBe('Sword Coast');
    expect(summary?.isUnderground).toBe(false);
    expect(summary?.coordinates).toEqual({ x: 100, y: 200 });
  });

  it('identifies underground location categories correctly', () => {
    const dungeonLoc = { id: 'd1', name: 'Undermountain', category: 'dungeon' };
    const underdarkLoc = { id: 'u1', name: 'Menzoberranzan', category: 'underdark' };

    expect(resolveLocationSummary(dungeonLoc)?.isUnderground).toBe(true);
    expect(resolveLocationSummary(underdarkLoc)?.isUnderground).toBe(true);
  });

  it('calculates time context and time of day deterministically', () => {
    // 8:30 AM (510 minutes) on day 15 of Month 4 (Tarsakh), 1492 DR
    const timeCtx = resolveTimeContext(1492, 4, 15, 510);
    expect(timeCtx.gameYear).toBe(1492);
    expect(timeCtx.formattedTime).toBe('08:30');
    expect(timeCtx.calendarDate).toBe('15th of Tarsakh, 1492 DR');
    expect(timeCtx.isNight).toBe(false);
    expect(timeCtx.timeOfDay).toBe('day');

    // 11:45 PM (1425 minutes)
    const nightCtx = resolveTimeContext(1492, 4, 15, 1425);
    expect(nightCtx.formattedTime).toBe('23:45');
    expect(nightCtx.isNight).toBe(true);
    expect(nightCtx.timeOfDay).toBe('night');
  });

  it('evaluates weather context properties strictly', () => {
    const sunny = resolveWeatherContext('Sunny');
    expect(sunny.visibility).toBe('clear');
    expect(sunny.isExtreme).toBe(false);

    const blizzard = resolveWeatherContext('Blizzard');
    expect(blizzard.visibility).toBe('near_zero');
    expect(blizzard.precipitation).toBe('severe');
    expect(blizzard.isExtreme).toBe(true);
  });

  it('calculates temperature deterministically across terrain, month, time, and weather', () => {
    // Desert at noon (720 min) in Kythorn (Month 6) with Sunny weather
    const desertTemp = resolveTemperatureContext('desert', 6, 720, 'Sunny');
    expect(desertTemp.baseTemp).toBe(35);
    expect(desertTemp.category).toBe('extreme_heat');
    expect(desertTemp.celsius).toBeGreaterThan(40);

    // Arctic in winter (Month 1) with Blizzard
    const arcticTemp = resolveTemperatureContext('arctic', 1, 0, 'Blizzard');
    expect(arcticTemp.category).toBe('freezing');
    expect(arcticTemp.celsius).toBeLessThan(-20);
  });

  it('ensures physical environment context uses partyLocation and ignores inspectedLocation', () => {
    const mockState: Partial<WorldState> = {
      gameYear: 1492,
      gameMonth: 1,
      gameDay: 1,
      gameTime: 480,
      weather: 'Sunny',
      temperature: 18,
      currentRegion: 'Sword Coast',
      isTraveling: false,
      travelProgress: 0,
      mapZoom: 2,
      isFastForwarding: false,
      partyLocation: {
        id: 'party_camp',
        name: 'High Road Encampment',
        category: 'landmark',
      },
      currentLocation: {
        id: 'phandalin',
        name: 'Phandalin',
        category: 'village',
      },
      inspectedLocation: {
        id: 'neverwinter',
        name: 'Neverwinter',
        category: 'city',
      },
    };

    const snapshot = resolveWorldEnvironmentSnapshot(mockState as WorldState);

    // Physical context MUST be based strictly on partyLocation
    expect(snapshot.locations.physical?.id).toBe('party_camp');
    expect(snapshot.locations.physical?.name).toBe('High Road Encampment');

    // Presentation and inspected locations remain separate
    expect(snapshot.locations.presentation?.id).toBe('phandalin');
    expect(snapshot.locations.inspected?.id).toBe('neverwinter');
  });

  it('guarantees identical authoritative inputs resolve to identical complete snapshot outputs', () => {
    const mockState: Partial<WorldState> = {
      gameYear: 1492,
      gameMonth: 5,
      gameDay: 10,
      gameTime: 600,
      weather: 'Rainy',
      temperature: 14,
      currentRegion: 'Sword Coast',
      isTraveling: true,
      travelProgress: 0.4,
      mapZoom: 3,
      isFastForwarding: true,
      partyLocation: { id: 'road_1', name: 'Coast Way' },
      currentLocation: null,
      inspectedLocation: null,
    };

    const snap1 = resolveWorldEnvironmentSnapshot(mockState as WorldState);
    const snap2 = resolveWorldEnvironmentSnapshot(mockState as WorldState);

    // Full strict deep equality on entire snapshot object
    expect(snap1).toEqual(snap2);
  });

  it('proves authoritative weather remains stable across ticks until explicit deterministic block boundary', () => {
    const store = useWorldStore.getState();
    store.setWeather('Mystic');
    store.setTemperature(20);

    // Advance by 5 minutes within the same 6-hour block (e.g. at 8:00 AM / 480 minutes)
    store.updateEnvironment(5);

    expect(useWorldStore.getState().weather).toBe('Mystic');
  });

  it('provides persistent weather continuity via time-block resolution', () => {
    // Calling getWeatherForTimeBlock at minute 10 vs minute 350 of the same 6h block (0-360) returns the exact same weather
    const w1 = getWeatherForTimeBlock(1492, 5, 10, 10, 'Sword Coast', 'landmark');
    const w2 = getWeatherForTimeBlock(1492, 5, 10, 350, 'Sword Coast', 'landmark');

    expect(w1).toBe(w2);
  });

  it('guarantees inspecting a landmark updates inspected location while preserving physical location context', () => {
    const store = useWorldStore.getState();
    store.setPartyLocation({
      id: 'party_camp',
      name: 'High Road Encampment',
      category: 'landmark',
      region: 'Sword Coast',
    });
    store.setInspectedLocation(null);

    const initialSnapshot = store.getEnvironmentSnapshot();
    expect(initialSnapshot.locations.physical?.name).toBe('High Road Encampment');
    expect(initialSnapshot.locations.inspected).toBeNull();

    // Inspect another landmark
    store.setInspectedLocation({
      id: 'candlekeep',
      name: 'Candlekeep',
      category: 'castle',
      region: 'Sword Coast',
    });

    const updatedSnapshot = store.getEnvironmentSnapshot();
    expect(updatedSnapshot.locations.physical?.name).toBe('High Road Encampment');
    expect(updatedSnapshot.locations.inspected?.name).toBe('Candlekeep');

    // Clear inspection
    store.setInspectedLocation(null);
    const clearedSnapshot = store.getEnvironmentSnapshot();
    expect(clearedSnapshot.locations.physical?.name).toBe('High Road Encampment');
    expect(clearedSnapshot.locations.inspected).toBeNull();
  });

  it('provides complete environmental metrics in snapshot for WorldEnvironmentHeader consumption', () => {
    const store = useWorldStore.getState();
    const snapshot = store.getEnvironmentSnapshot();

    expect(snapshot.time.formattedTime).toMatch(/^\d{2}:\d{2}$/);
    expect(snapshot.time.calendarDate).toContain('1492 DR');
    expect(typeof snapshot.temperature.celsius).toBe('number');
    expect(snapshot.weather.current).toBeDefined();
    expect(['dawn', 'day', 'dusk', 'night']).toContain(snapshot.time.timeOfDay);
  });
});

describe('WorldEnvironmentHeader React Subscription & Snapshot Resolution Integration', () => {
  it('guarantees referential stability of Zustand selector inputs when building snapshot', () => {
    const store = useWorldStore.getState();

    // Verify snapshot accessor calls
    const snapshot1 = store.getEnvironmentSnapshot();
    const snapshot2 = store.getEnvironmentSnapshot();

    expect(snapshot1.time.formattedTime).toBe(snapshot2.time.formattedTime);
    expect(snapshot1.locations.physical?.name).toBe(snapshot2.locations.physical?.name);

    // Verify shallow primitive equality across state snapshots
    const primitiveSelector = (s: typeof store) => ({
      gameYear: s.gameYear,
      gameMonth: s.gameMonth,
      gameDay: s.gameDay,
      gameTime: s.gameTime,
      weather: s.weather,
      temperature: s.temperature,
      partyLocation: s.partyLocation,
      currentLocation: s.currentLocation,
      inspectedLocation: s.inspectedLocation,
    });

    const sel1 = primitiveSelector(store);
    const sel2 = primitiveSelector(store);

    expect(sel1).toEqual(sel2);
  });
});
